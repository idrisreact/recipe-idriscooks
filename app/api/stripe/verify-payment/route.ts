import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { subscription: null, plan: null, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        subscription: null,
        plan: null,
        error: 'Payment not completed',
        payment_status: session.payment_status,
      });
    }

    // Check if this is a subscription or one-time payment
    if (session.mode === 'subscription' && session.subscription) {
      // Handle subscription payment
      const subscription = session.subscription as Stripe.Subscription;
      const plan = subscription.items.data[0]?.price;

      return NextResponse.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          current_period_start: (subscription as any).current_period_start,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          current_period_end: (subscription as any).current_period_end,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cancel_at_period_end: (subscription as any).cancel_at_period_end,
        },
        plan: plan
          ? {
              id: plan.id,
              amount: plan.unit_amount,
              currency: plan.currency,
              interval: plan.recurring?.interval,
              interval_count: plan.recurring?.interval_count,
            }
          : null,
      });
    } else if (session.mode === 'payment') {
      // Handle one-time payment (PDF access)
      const userId = session.metadata?.userId;
      const type = session.metadata?.type;

      if (type === 'pdf_download' && userId && userId !== 'guest') {
        // Grant PDF access
        await db
          .insert(premiumFeatures)
          .values({
            userId: userId,
            feature: 'pdf_downloads',
            grantedAt: new Date(),
            expiresAt: undefined, // Lifetime access
            metadata: {
              sessionId: session.id,
              amountPaid: session.amount_total ?? 0,
            },
          })
          .onConflictDoUpdate({
            target: [premiumFeatures.userId, premiumFeatures.feature],
            set: {
              grantedAt: new Date(),
              metadata: {
                sessionId: session.id,
                amountPaid: session.amount_total ?? 0,
              },
            },
          });

        return NextResponse.json({
          subscription: null,
          plan: {
            id: 'pdf_download',
            type: 'one_time',
            amount: session.amount_total,
            currency: session.currency,
            feature: 'pdf_downloads',
            status: 'active',
          },
        });
      }

      // Return success but no specific plan info for other one-time payments
      return NextResponse.json({
        subscription: null,
        plan: {
          id: 'one_time_payment',
          type: 'one_time',
          amount: session.amount_total,
          currency: session.currency,
          status: 'completed',
        },
      });
    }

    // Fallback for unknown payment types
    return NextResponse.json({
      subscription: null,
      plan: null,
      error: 'Unknown payment type',
      session_mode: session.mode,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        subscription: null,
        plan: null,
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
