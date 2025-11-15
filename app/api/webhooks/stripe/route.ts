/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/src/db';
import { userSubscriptions, billingHistory } from '@/src/db/schemas';
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
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkUserId = session.metadata?.clerkUserId;
  const planId = session.metadata?.planId;

  if (!clerkUserId || !planId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  const subscription = subscriptionResponse as any;

  // Upsert user subscription
  await db
    .insert(userSubscriptions)
    .values({
      id: crypto.randomUUID(),
      userId: clerkUserId,
      planId: planId,
      status: subscription.status,
      currentPeriodStart: new Date((subscription.current_period_start || subscription.currentPeriodStart) * 1000),
      currentPeriodEnd: new Date((subscription.current_period_end || subscription.currentPeriodEnd) * 1000),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userSubscriptions.userId,
      set: {
        planId: planId,
        status: subscription.status,
        currentPeriodStart: new Date((subscription.current_period_start || subscription.currentPeriodStart) * 1000),
        currentPeriodEnd: new Date((subscription.current_period_end || subscription.currentPeriodEnd) * 1000),
        stripeSubscriptionId: subscription.id,
        updatedAt: new Date(),
      },
    });
}

async function handleSubscriptionUpdated(subscriptionData: Stripe.Subscription) {
  const subscription = subscriptionData as any;
  const clerkUserId = subscription.metadata?.clerkUserId;

  if (!clerkUserId) {
    console.error('Missing clerkUserId in subscription metadata');
    return;
  }

  await db
    .update(userSubscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart: new Date((subscription.current_period_start || subscription.currentPeriodStart) * 1000),
      currentPeriodEnd: new Date((subscription.current_period_end || subscription.currentPeriodEnd) * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || subscription.cancelAtPeriodEnd || false,
      canceledAt: (subscription.canceled_at || subscription.canceledAt)
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
  const clerkUserId = invoice.subscription_details?.metadata?.clerkUserId || invoice.metadata?.clerkUserId;

  if (!clerkUserId) {
    return;
  }

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, invoice.subscription as string))
    .limit(1);

  await db.insert(billingHistory).values({
    id: crypto.randomUUID(),
    userId: clerkUserId,
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
  const clerkUserId = invoice.subscription_details?.metadata?.clerkUserId || invoice.metadata?.clerkUserId;

  if (!clerkUserId) {
    return;
  }

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, invoice.subscription as string))
    .limit(1);

  await db.insert(billingHistory).values({
    id: crypto.randomUUID(),
    userId: clerkUserId,
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
