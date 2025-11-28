import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit } from '@/src/lib/rate-limit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (5 requests per minute for payment endpoints)
    const rateLimitResponse = await rateLimit(request, 'payment');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          customer_email: session.customer_email,
          amount_total: session.amount_total,
          currency: session.currency,
          payment_intent: session.payment_intent,
          metadata: session.metadata,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not completed',
          payment_status: session.payment_status,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
