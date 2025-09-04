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

    console.log('Webhook: Processing event with signature:', signature?.substring(0, 20) + '...');

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('Webhook: Event constructed successfully:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Webhook: Checkout session completed:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          mode: session.mode,
          amountTotal: session.amount_total,
          customerEmail: session.customer_email,
          metadata: session.metadata
        });

        // Only process paid sessions
        if (session.payment_status === 'paid') {
          const userId = session.metadata?.userId;
          const type = session.metadata?.type;
          const customerEmail = session.customer_email;
          const recipeCount = session.metadata?.recipeCount;

          console.log('Webhook: Session metadata:', {
            userId,
            type,
            customerEmail,
            recipeCount
          });

          // Handle PDF download payments with valid user ID
          if (type === 'pdf_download' && userId && userId !== 'guest') {
            console.log('Webhook: Granting PDF access to authenticated user:', userId);
            
            try {
              const result = await db
                .insert(premiumFeatures)
                .values({
                  userId: userId,
                  feature: 'pdf_downloads',
                  grantedAt: new Date(),
                  expiresAt: null, // Lifetime access
                  metadata: {
                    sessionId: session.id,
                    amountPaid: session.amount_total ?? 0,
                    recipeCount: recipeCount ? parseInt(recipeCount) : 1,
                    planType: 'pdf_download'
                  },
                })
                .onConflictDoUpdate({
                  target: [premiumFeatures.userId, premiumFeatures.feature],
                  set: {
                    grantedAt: new Date(),
                    metadata: {
                      sessionId: session.id,
                      amountPaid: session.amount_total ?? 0,
                      recipeCount: recipeCount ? parseInt(recipeCount) : 1,
                      planType: 'pdf_download'
                    },
                  },
                });

              console.log('Webhook: PDF access granted successfully to user:', userId, 'Result:', result);
            } catch (dbError) {
              console.error('Webhook: Database error granting PDF access:', dbError);
              throw dbError;
            }
          }
          // Handle PDF download payments with guest user (use email fallback)
          else if (type === 'pdf_download' && (userId === 'guest' || !userId) && customerEmail) {
            console.log('Webhook: Attempting email fallback for PDF access:', customerEmail);
            
            try {
              const userRecord = await db
                .select()
                .from(user)
                .where(eq(user.email, customerEmail))
                .limit(1);

              console.log('Webhook: User lookup result:', userRecord.length > 0 ? 'User found' : 'User not found');

              if (userRecord.length > 0) {
                const foundUserId = userRecord[0].id;
                console.log('Webhook: Granting PDF access via email fallback to user:', foundUserId);

                const result = await db
                  .insert(premiumFeatures)
                  .values({
                    userId: foundUserId,
                    feature: 'pdf_downloads',
                    grantedAt: new Date(),
                    expiresAt: null,
                    metadata: {
                      sessionId: session.id,
                      amountPaid: session.amount_total ?? 0,
                      recipeCount: recipeCount ? parseInt(recipeCount) : 1,
                      planType: 'pdf_download',
                      grantedViaEmail: true
                    },
                  })
                  .onConflictDoUpdate({
                    target: [premiumFeatures.userId, premiumFeatures.feature],
                    set: {
                      grantedAt: new Date(),
                      metadata: {
                        sessionId: session.id,
                        amountPaid: session.amount_total ?? 0,
                        recipeCount: recipeCount ? parseInt(recipeCount) : 1,
                        planType: 'pdf_download',
                        grantedViaEmail: true
                      },
                    },
                  });

                console.log('Webhook: PDF access granted via email fallback to:', customerEmail, 'Result:', result);
              } else {
                console.warn('Webhook: User not found for email fallback:', customerEmail);
              }
            } catch (error) {
              console.error('Webhook: Failed to grant access via email fallback:', error);
            }
          }
          // Handle other PDF download scenarios by amount
          else if (!type && customerEmail && [299, 499, 799, 999].includes(session.amount_total || 0)) {
            console.log('Webhook: Attempting amount-based PDF access fallback for:', customerEmail, 'Amount:', session.amount_total);
            
            try {
              const userRecord = await db
                .select()
                .from(user)
                .where(eq(user.email, customerEmail))
                .limit(1);

              if (userRecord.length > 0) {
                const foundUserId = userRecord[0].id;
                console.log('Webhook: Granting PDF access via amount fallback to user:', foundUserId);

                const result = await db
                  .insert(premiumFeatures)
                  .values({
                    userId: foundUserId,
                    feature: 'pdf_downloads',
                    grantedAt: new Date(),
                    expiresAt: null,
                    metadata: {
                      sessionId: session.id,
                      amountPaid: session.amount_total ?? 0,
                      planType: 'pdf_download',
                      grantedViaAmountFallback: true
                    },
                  })
                  .onConflictDoUpdate({
                    target: [premiumFeatures.userId, premiumFeatures.feature],
                    set: {
                      grantedAt: new Date(),
                      metadata: {
                        sessionId: session.id,
                        amountPaid: session.amount_total ?? 0,
                        planType: 'pdf_download',
                        grantedViaAmountFallback: true
                      },
                    },
                  });

                console.log('Webhook: PDF access granted via amount fallback to:', customerEmail, 'Result:', result);
              } else {
                console.warn('Webhook: User not found for amount fallback:', customerEmail);
              }
            } catch (error) {
              console.error('Webhook: Failed to grant access via amount fallback:', error);
            }
          } else {
            console.log('Webhook: Session does not match PDF download criteria:', {
              type,
              userId,
              customerEmail,
              amountTotal: session.amount_total
            });
          }
        } else {
          console.log('Webhook: Session payment not completed:', session.payment_status);
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Webhook: Payment intent succeeded:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Webhook: Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ 
      received: true, 
      processed: true,
      eventType: event.type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook: Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
