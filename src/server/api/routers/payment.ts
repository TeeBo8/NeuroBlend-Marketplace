import { z } from 'zod';
import { eq } from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  vendorProcedure,
} from '../trpc';
import { vendors, orders, orderItems, users } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import type Stripe from 'stripe';
import { getStripe } from '@/server/stripe';
import { sendOrderConfirmationEmail } from '@/lib/email';

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const shippingAddressSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(2),
  country: z.string().min(2),
});

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
        items: z.array(cartItemSchema).min(1),
        shippingAddress: shippingAddressSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get products and validate
      const productIds = input.items.map((item) => item.productId);
      const productsData = await ctx.db.query.products.findMany({
        where: (products, { inArray }) => inArray(products.id, productIds),
        with: {
          vendor: true,
        },
      });

      if (productsData.length !== productIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'One or more products not found',
        });
      }

      // Group items by vendor
      const itemsByVendor = new Map<
        string,
        {
          vendor: typeof productsData[0]['vendor'];
          items: Array<{
            product: typeof productsData[0];
            quantity: number;
          }>;
        }
      >();

      for (const item of input.items) {
        const product = productsData.find((p) => p.id === item.productId);
        if (!product) continue;

        const vendorId = product.vendorId;
        if (!itemsByVendor.has(vendorId)) {
          itemsByVendor.set(vendorId, {
            vendor: product.vendor,
            items: [],
          });
        }
        itemsByVendor.get(vendorId)!.items.push({
          product,
          quantity: item.quantity,
        });
      }

      // For MVP, we only support single-vendor checkout
      if (itemsByVendor.size > 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Multi-vendor checkout not supported yet. Please checkout items from one vendor at a time.',
        });
      }

      const [vendorData] = Array.from(itemsByVendor.values());
      const vendor = vendorData.vendor;

      if (!vendor.stripeAccountId || !vendor.stripeOnboardingComplete) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Vendor payment setup incomplete',
        });
      }

      // Calculate totals
      let subtotal = 0;
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      for (const { product, quantity } of vendorData.items) {
        const price = parseFloat(product.price);
        subtotal += price * quantity;

        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
              description: product.shortDescription || undefined,
              images: product.imageUrl ? [product.imageUrl] : undefined,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity,
        });
      }

      const commissionRate = parseFloat(vendor.commissionRate || '15') / 100;
      const commission = subtotal * commissionRate;

      // Generate order number
      const orderNumber = `NB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Create checkout session with Stripe Connect
      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        customer_email: ctx.session.user.email || undefined,
        line_items: lineItems,
        payment_intent_data: {
          application_fee_amount: Math.round(commission * 100),
          transfer_data: {
            destination: vendor.stripeAccountId,
          },
          metadata: {
            orderNumber,
            userId: ctx.session.user.id,
            vendorId: vendor.id,
          },
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        metadata: {
          orderNumber,
          userId: ctx.session.user.id,
          vendorId: vendor.id,
          shippingAddress: JSON.stringify(input.shippingAddress),
          items: JSON.stringify(
            vendorData.items.map((i) => ({
              productId: i.product.id,
              productName: i.product.name,
              quantity: i.quantity,
              price: i.product.price,
            }))
          ),
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  // Verify checkout session and create order
  verifyCheckout: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getStripe().checkout.sessions.retrieve(input.sessionId, {
        expand: ['payment_intent'],
      });

      if (session.payment_status !== 'paid') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment not completed',
        });
      }

      const metadata = session.metadata!;
      const shippingAddress = JSON.parse(metadata.shippingAddress);
      const items = JSON.parse(metadata.items) as Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: string;
      }>;

      // Check if order already exists
      const existingOrder = await ctx.db.query.orders.findFirst({
        where: eq(orders.orderNumber, metadata.orderNumber),
      });

      if (existingOrder) {
        return existingOrder;
      }

      // Calculate totals
      let subtotal = 0;
      for (const item of items) {
        subtotal += parseFloat(item.price) * item.quantity;
      }

      const vendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.id, metadata.vendorId),
      });

      const commissionRate = parseFloat(vendor?.commissionRate || '15') / 100;
      const commission = subtotal * commissionRate;

      // Create order
      const [order] = await ctx.db
        .insert(orders)
        .values({
          orderNumber: metadata.orderNumber,
          userId: ctx.session.user.id,
          vendorId: metadata.vendorId,
          subtotal: subtotal.toFixed(2),
          commission: commission.toFixed(2),
          total: subtotal.toFixed(2),
          status: 'paid',
          stripePaymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id,
          shippingName: shippingAddress.name,
          shippingAddress: shippingAddress.address,
          shippingCity: shippingAddress.city,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
        })
        .returning();

      // Create order items
      for (const item of items) {
        await ctx.db.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: (parseFloat(item.price) * item.quantity).toFixed(2),
        });
      }

      // Send order confirmation email
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: { email: true, name: true },
      });
      if (user?.email) {
        sendOrderConfirmationEmail(user.email, {
          name: user.name || 'Client',
          orderNumber: metadata.orderNumber,
          total: `${subtotal.toFixed(2)} €`,
          items: items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            price: `${(parseFloat(i.price) * i.quantity).toFixed(2)} €`,
          })),
        });
      }

      return order;
    }),
});
