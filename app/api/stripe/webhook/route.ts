import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata
        const userId = session.metadata?.userId;
        const recipeCount = session.metadata?.recipeCount;
        const type = session.metadata?.type;

        if (type === 'pdf_download' && userId && userId !== 'guest') {
          // Grant PDF access to the user
          await db.insert(premiumFeatures).values({
            userId: userId,
            feature: 'pdf_downloads',
            grantedAt: new Date(),
            expiresAt: undefined, // Lifetime access
            metadata: {
              sessionId: session.id,
              recipeCount: parseInt(recipeCount || '0'),
              amountPaid: session.amount_total ?? 0,
            },
          }).onConflictDoUpdate({
            target: [premiumFeatures.userId, premiumFeatures.feature],
            set: {
              grantedAt: new Date(),
              metadata: {
                sessionId: session.id,
                recipeCount: parseInt(recipeCount || '0'),
                amountPaid: session.amount_total ?? undefined,
              },
            },
          });

          console.log(`PDF access granted to user ${userId}`);
        }

        // For guest users, we'll handle this in the success page
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}