import { z } from 'zod';
import { eq } from 'drizzle-orm';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '../trpc';
import { subscriptions } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  });
};

export const subscriptionRouter = createTRPCRouter({
  // Get available plans
  getPlans: publicProcedure.query(() => {
    return SUBSCRIPTION_PLANS;
  }),

  // Get current user's subscription
  mySubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, ctx.session.user.id),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return subscription ?? null;
  }),

  // Create a Stripe Billing checkout session
  createCheckout: protectedProcedure
    .input(
      z.object({
        planId: z.enum(['decouverte', 'essentiel', 'premium']),
        frequency: z.enum(['monthly', 'quarterly']).default('monthly'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === input.planId);
      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan introuvable',
        });
      }

      // Check if user already has an active subscription
      const existing = await ctx.db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, ctx.session.user.id),
      });

      if (existing && existing.status === 'active') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Vous avez déjà un abonnement actif. Gérez-le depuis votre espace.',
        });
      }

      const stripe = getStripe();

      // Calculate price based on frequency
      const unitAmount = Math.round(plan.price * 100);
      const interval = input.frequency === 'quarterly' ? 'month' : 'month';
      const intervalCount = input.frequency === 'quarterly' ? 3 : 1;

      // Create Stripe Checkout for subscription
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: ctx.session.user.email || undefined,
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `NeuroBlend ${plan.name}`,
                description: `${plan.capsules} capsules / ${input.frequency === 'quarterly' ? 'trimestre' : 'mois'}`,
              },
              unit_amount: unitAmount,
              recurring: {
                interval,
                interval_count: intervalCount,
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            userId: ctx.session.user.id,
            planId: input.planId,
            frequency: input.frequency,
          },
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions?cancelled=true`,
        metadata: {
          userId: ctx.session.user.id,
          planId: input.planId,
          frequency: input.frequency,
        },
      });

      return { url: session.url };
    }),

  // Manage subscription (redirect to Stripe portal)
  manage: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, ctx.session.user.id),
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Aucun abonnement trouvé',
      });
    }

    const stripe = getStripe();

    // Get subscription to find customer ID
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    const customerId =
      typeof stripeSubscription.customer === 'string'
        ? stripeSubscription.customer
        : stripeSubscription.customer.id;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions`,
    });

    return { url: portalSession.url };
  }),
});
