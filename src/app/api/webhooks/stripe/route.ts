import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/server/stripe';
import { db } from '@/server/db';
import { subscriptions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { handleCheckoutSessionEvent } from '@/server/orders/fulfillment';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired':
        await handleCheckoutSessionEvent(db, event.type, event.data.object);
        break;

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;

        if (metadata.userId && metadata.planId) {
          await db.insert(subscriptions).values({
            userId: metadata.userId,
            stripeSubscriptionId: subscription.id,
            status: 'active',
            frequency: (metadata.frequency as 'monthly' | 'quarterly') || 'monthly',
            nextDelivery: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
            ),
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const existing = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, subscription.id),
        });

        if (existing) {
          let status: 'active' | 'paused' | 'cancelled' = 'active';
          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            status = 'cancelled';
          } else if (subscription.status === 'paused') {
            status = 'paused';
          }

          await db
            .update(subscriptions)
            .set({
              status,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existing.id));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const existing = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, subscription.id),
        });

        if (existing) {
          await db
            .update(subscriptions)
            .set({
              status: 'cancelled',
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existing.id));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
