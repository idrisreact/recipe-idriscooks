import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { user } from '@/src/db/schemas/user.schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process paid sessions
        if (session.payment_status === 'paid') {
          const userId = session.metadata?.userId;
          const type = session.metadata?.type;
          const customerEmail = session.customer_email;

          // Handle PDF download payments
          if (type === 'pdf_download' && userId && userId !== 'guest') {
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

            console.log(`PDF access granted to user ${userId} via webhook`);
          }
          // Handle payments without metadata (fallback for PDF downloads)
          else if (session.amount_total === 299 && customerEmail) {
            // This is likely a PDF download payment - find user by email
            try {
              const userRecord = await db
                .select()
                .from(user)
                .where(eq(user.email, customerEmail))
                .limit(1);

              if (userRecord.length > 0) {
                await db
                  .insert(premiumFeatures)
                  .values({
                    userId: userRecord[0].id,
                    feature: 'pdf_downloads',
                    grantedAt: new Date(),
                    expiresAt: undefined,
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

                console.log(`PDF access granted to ${customerEmail} via webhook fallback`);
              }
            } catch (error) {
              console.error('Failed to grant access via email fallback:', error);
            }
          }
        }

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
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
