/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/src/db';
import { userSubscriptions, billingHistory, premiumFeatures } from '@/src/db/schemas';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.metadata?.clerkUserId;
  const type = session.metadata?.type;

  if (!userId) {
    console.error('Missing userId/clerkUserId in checkout session metadata');
    return;
  }

  // Handle one-time payment for recipe access
  if (type === 'recipe_access') {
    // Grant lifetime access (or long duration)
    const lifetimeEnd = new Date();
    lifetimeEnd.setFullYear(lifetimeEnd.getFullYear() + 100); // 100 years from now

    await db
      .insert(userSubscriptions)
      .values({
        id: crypto.randomUUID(),
        userId: userId,
        planId: 'premium', // Grant premium features
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: lifetimeEnd,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.payment_intent as string, // Use payment intent ID for one-time payments
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          planId: 'premium',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: lifetimeEnd,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.payment_intent as string,
          updatedAt: new Date(),
        },
      });

    // Also grant access via premium_features table (which is what checkRecipeAccess uses)
    await db
      .insert(premiumFeatures)
      .values({
        userId: userId,
        feature: 'recipe_access',
        grantedAt: new Date(),
        expiresAt: null, // Lifetime access
        metadata: {
          sessionId: session.id,
          amountPaid: session.amount_total ? session.amount_total / 100 : 0,
          planType: 'lifetime',
        },
      })
      .onConflictDoNothing(); // If already exists, do nothing

    return;
  }

  // Handle standard subscription checkout
  const planId = session.metadata?.planId;
  const subscriptionId = session.subscription as string;

  if (!planId || !subscriptionId) {
    // If it's not a subscription and not recipe_access, we might not know what to do
    // But let's check if we have subscription info anyway
    if (!subscriptionId) return;
  }

  if (subscriptionId) {
    const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
    const subscription = subscriptionResponse as any;

    // Upsert user subscription
    await db
      .insert(userSubscriptions)
      .values({
        id: crypto.randomUUID(),
        userId: userId,
        planId: planId || 'pro', // Default to pro if planId missing but subscription exists
        status: subscription.status,
        currentPeriodStart: new Date(
          (subscription.current_period_start || subscription.currentPeriodStart) * 1000
        ),
        currentPeriodEnd: new Date(
          (subscription.current_period_end || subscription.currentPeriodEnd) * 1000
        ),
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          planId: planId || 'pro',
          status: subscription.status,
          currentPeriodStart: new Date(
            (subscription.current_period_start || subscription.currentPeriodStart) * 1000
          ),
          currentPeriodEnd: new Date(
            (subscription.current_period_end || subscription.currentPeriodEnd) * 1000
          ),
          stripeSubscriptionId: subscription.id,
          updatedAt: new Date(),
        },
      });
  }
}

async function handleSubscriptionUpdated(subscriptionData: Stripe.Subscription) {
  const subscription = subscriptionData as any;
  const userId = subscription.metadata?.userId || subscription.metadata?.clerkUserId;

  if (!userId) {
    console.error('Missing userId/clerkUserId in subscription metadata');
    return;
  }

  await db
    .update(userSubscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart: new Date(
        (subscription.current_period_start || subscription.currentPeriodStart) * 1000
      ),
      currentPeriodEnd: new Date(
        (subscription.current_period_end || subscription.currentPeriodEnd) * 1000
      ),
      cancelAtPeriodEnd:
        subscription.cancel_at_period_end || subscription.cancelAtPeriodEnd || false,
      canceledAt:
        subscription.canceled_at || subscription.canceledAt
          ? new Date((subscription.canceled_at || subscription.canceledAt) * 1000)
          : null,
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db
    .update(userSubscriptions)
    .set({
      status: 'canceled',
      endedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
}

async function handleInvoicePaymentSucceeded(invoiceData: Stripe.Invoice) {
  const invoice = invoiceData as any;
  const userId =
    invoice.subscription_details?.metadata?.userId ||
    invoice.subscription_details?.metadata?.clerkUserId ||
    invoice.metadata?.userId ||
    invoice.metadata?.clerkUserId;

  if (!userId) {
    return;
  }

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, invoice.subscription as string))
    .limit(1);

  await db.insert(billingHistory).values({
    id: crypto.randomUUID(),
    userId: userId,
    subscriptionId: subscription?.id,
    amount: (invoice.amount_paid / 100).toFixed(2),
    currency: invoice.currency,
    status: 'succeeded',
    description: invoice.description || 'Subscription payment',
    invoiceUrl: invoice.hosted_invoice_url || undefined,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: invoice.payment_intent as string,
    billingDate: new Date(invoice.created * 1000),
    paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
    createdAt: new Date(),
  });
}

async function handleInvoicePaymentFailed(invoiceData: Stripe.Invoice) {
  const invoice = invoiceData as any;
  const userId =
    invoice.subscription_details?.metadata?.userId ||
    invoice.subscription_details?.metadata?.clerkUserId ||
    invoice.metadata?.userId ||
    invoice.metadata?.clerkUserId;

  if (!userId) {
    return;
  }

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, invoice.subscription as string))
    .limit(1);

  await db.insert(billingHistory).values({
    id: crypto.randomUUID(),
    userId: userId,
    subscriptionId: subscription?.id,
    amount: (invoice.amount_due / 100).toFixed(2),
    currency: invoice.currency,
    status: 'failed',
    description: invoice.description || 'Subscription payment failed',
    invoiceUrl: invoice.hosted_invoice_url || undefined,
    stripeInvoiceId: invoice.id,
    billingDate: new Date(invoice.created * 1000),
    createdAt: new Date(),
  });
}
