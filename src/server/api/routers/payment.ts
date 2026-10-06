import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  vendorProcedure,
} from '../trpc';
import { vendors, orders, orderItems } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import type Stripe from 'stripe';
import { getStripe } from '@/server/stripe';
import { discardPendingOrder, fulfillOrder } from '@/server/orders/fulfillment';
import {
  computeOrderTotals,
  fromCents,
  mergeCartItems,
  toCents,
} from '@/lib/order-totals';
import { shippingAddressSchema } from '@/lib/shipping-address';

const cartItemSchema = z.object({
  productId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(99),
});

// Stripe only accepts absolute, publicly reachable image URLs.
const toStripeImages = (imageUrl: string | null) => {
  if (!imageUrl) return undefined;
  const url = imageUrl.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_APP_URL}${imageUrl}`
    : imageUrl;
  return url.startsWith('https://') ? [url] : undefined;
};

export const paymentRouter = createTRPCRouter({
  // Create Stripe Connect account for vendor
  createConnectAccount: vendorProcedure.mutation(async ({ ctx }) => {
    const vendor = await ctx.db.query.vendors.findFirst({
      where: eq(vendors.userId, ctx.session.user.id),
      with: {
        user: true,
      },
    });

    if (!vendor) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Vendor profile not found',
      });
    }

    if (vendor.stripeAccountId) {
      // Return existing account link for onboarding
      const accountLink = await getStripe().accountLinks.create({
        account: vendor.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/payouts?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/payouts?success=true`,
        type: 'account_onboarding',
      });

      return { url: accountLink.url };
    }

    // Create new Stripe Connect account
    const account = await getStripe().accounts.create({
      type: 'express',
      country: 'FR',
      email: vendor.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        vendorId: vendor.id,
        userId: ctx.session.user.id,
      },
    });

    // Save Stripe account ID
    await ctx.db
      .update(vendors)
      .set({
        stripeAccountId: account.id,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendor.id));

    // Create account link for onboarding
    const accountLink = await getStripe().accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/payouts?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/payouts?success=true`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }),

  // Get Stripe Connect account status
  getConnectStatus: vendorProcedure.query(async ({ ctx }) => {
    const vendor = await ctx.db.query.vendors.findFirst({
      where: eq(vendors.userId, ctx.session.user.id),
    });

    if (!vendor || !vendor.stripeAccountId) {
      return {
        connected: false,
        onboardingComplete: false,
        payoutsEnabled: false,
      };
    }

    const account = await getStripe().accounts.retrieve(vendor.stripeAccountId);

    const onboardingComplete = account.details_submitted ?? false;
    const payoutsEnabled = account.payouts_enabled ?? false;

    // Update vendor if onboarding is complete
    if (onboardingComplete && !vendor.stripeOnboardingComplete) {
      await ctx.db
        .update(vendors)
        .set({
          stripeOnboardingComplete: true,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, vendor.id));
    }

    return {
      connected: true,
      onboardingComplete,
      payoutsEnabled,
      accountId: vendor.stripeAccountId,
    };
  }),

  // Get Stripe dashboard link for vendor
  getDashboardLink: vendorProcedure.query(async ({ ctx }) => {
    const vendor = await ctx.db.query.vendors.findFirst({
      where: eq(vendors.userId, ctx.session.user.id),
    });

    if (!vendor?.stripeAccountId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Stripe account not found',
      });
    }

    const loginLink = await getStripe().accounts.createLoginLink(
      vendor.stripeAccountId
    );

    return { url: loginLink.url };
  }),

  // Create checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        items: z.array(cartItemSchema).min(1).max(50),
        shippingAddress: shippingAddressSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const items = mergeCartItems(input.items);

      const productsData = await ctx.db.query.products.findMany({
        where: (products, { inArray }) =>
          inArray(
            products.id,
            items.map((item) => item.productId)
          ),
        with: {
          vendor: true,
        },
      });

      // Prices, availability and stock are always read from the database:
      // nothing the browser sends is trusted beyond product ids and quantities.
      const lines = items.map((item) => {
        const product = productsData.find((p) => p.id === item.productId);
        if (!product || !product.active) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Un ou plusieurs produits ne sont plus disponibles. Retirez-les du panier.',
          });
        }
        if ((product.stock ?? 0) < item.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Stock insuffisant pour « ${product.name} »`,
          });
        }
        return { product, quantity: item.quantity };
      });

      // For MVP, we only support single-vendor checkout
      if (new Set(lines.map((line) => line.product.vendorId)).size > 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Les produits de plusieurs vendeurs ne peuvent pas encore être payés ensemble. Commandez un vendeur à la fois.',
        });
      }

      const vendor = lines[0].product.vendor;

      if (
        !vendor.approved ||
        !vendor.stripeAccountId ||
        !vendor.stripeOnboardingComplete
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce vendeur ne peut pas encore recevoir de paiements',
        });
      }

      const totals = computeOrderTotals(
        lines.map((line) => ({
          unitPrice: line.product.price,
          quantity: line.quantity,
        })),
        vendor.commissionRate
      );

      const orderNumber = `NB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // The order is stored as "pending" before the customer pays, with the
      // prices and commission of that moment. Stripe only carries its id: the
      // webhook (or the success page) then marks it as paid. A cart is never
      // serialized into Stripe metadata, which is capped at 500 characters.
      const [order] = await ctx.db
        .insert(orders)
        .values({
          orderNumber,
          userId: ctx.session.user.id,
          vendorId: vendor.id,
          subtotal: fromCents(totals.subtotalCents),
          commission: fromCents(totals.commissionCents),
          total: fromCents(totals.subtotalCents),
          status: 'pending',
          shippingName: input.shippingAddress.name,
          shippingAddress: input.shippingAddress.address,
          shippingCity: input.shippingAddress.city,
          shippingPostalCode: input.shippingAddress.postalCode,
          shippingCountry: input.shippingAddress.country,
        })
        .returning({ id: orders.id });

      try {
        await ctx.db.insert(orderItems).values(
          lines.map((line, index) => ({
            orderId: order.id,
            productId: line.product.id,
            productName: line.product.name,
            quantity: line.quantity,
            unitPrice: line.product.price,
            totalPrice: fromCents(totals.lineTotalsCents[index]),
          }))
        );

        const metadata = { orderId: order.id, orderNumber };

        const session = await getStripe().checkout.sessions.create({
          mode: 'payment',
          customer_email: ctx.session.user.email || undefined,
          line_items: lines.map(
            (line): Stripe.Checkout.SessionCreateParams.LineItem => ({
              price_data: {
                currency: 'eur',
                product_data: {
                  name: line.product.name,
                  description: line.product.shortDescription || undefined,
                  images: toStripeImages(line.product.imageUrl),
                },
                unit_amount: toCents(line.product.price),
              },
              quantity: line.quantity,
            })
          ),
          payment_intent_data: {
            application_fee_amount: totals.commissionCents,
            transfer_data: {
              destination: vendor.stripeAccountId,
            },
            metadata,
          },
          // Shortest lifetime Stripe allows: an abandoned checkout releases
          // its pending order after 30 minutes.
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
          metadata,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        // No payment page was created: do not leave a pending order behind.
        await discardPendingOrder(ctx.db, order.id);
        throw error;
      }
    }),

  // Called by the success page. The Stripe webhook does the same job: whoever
  // arrives first marks the order as paid, the other call changes nothing.
  verifyCheckout: protectedProcedure
    .input(z.object({ sessionId: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const session = await getStripe().checkout.sessions.retrieve(input.sessionId);

      const orderId = session.metadata?.orderId;
      const order = orderId
        ? await ctx.db.query.orders.findFirst({
            where: and(
              eq(orders.id, orderId),
              eq(orders.userId, ctx.session.user.id)
            ),
          })
        : undefined;

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      if (session.payment_status !== 'paid') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment not completed',
        });
      }

      await fulfillOrder(
        ctx.db,
        order.id,
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null)
      );

      return (await ctx.db.query.orders.findFirst({
        where: eq(orders.id, order.id),
      }))!;
    }),
});
