/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/src/db';
import { userSubscriptions, billingHistory, premiumFeatures } from '@/src/db/schemas';
import { eq, and } from 'drizzle-orm';

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

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
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

async function createInvoiceForCheckout(session: Stripe.Checkout.Session) {
  try {
    // Skip invoice creation for subscriptions (they create their own invoices)
    if (session.mode === 'subscription') {
      console.log('Skipping invoice creation for subscription');
      return;
    }

    // Only create invoices for successful payments
    if (session.payment_status !== 'paid') {
      console.log('Skipping invoice creation - payment not completed');
      return;
    }

    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerName = session.customer_details?.name;

    if (!customerEmail) {
      console.log('No customer email found, skipping invoice creation');
      return;
    }

    // Get or create customer
    let customerId = session.customer as string;

    if (!customerId) {
      // Create a new customer if one doesn't exist
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName || undefined,
        metadata: {
          userId: session.metadata?.userId || '',
          checkoutSessionId: session.id,
        },
      });
      customerId = customer.id;
      console.log('Created new Stripe customer:', customerId);
    }

    // Retrieve line items from the checkout session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });

    if (!lineItems.data || lineItems.data.length === 0) {
      console.log('No line items found, skipping invoice creation');
      return;
    }

    // Create the invoice (draft)
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: false,
      collection_method: 'charge_automatically', // Since it's already paid
      description: `Purchase from ${process.env.NEXT_PUBLIC_BASE_URL || 'IdrisCooks'}`,
      metadata: {
        checkoutSessionId: session.id,
        userId: session.metadata?.userId || '',
        type: session.metadata?.type || 'purchase',
        paymentIntent: (session.payment_intent as string) || '',
      },
    });

    console.log('Created draft invoice:', invoice.id);

    // Add each line item to the invoice
    for (const item of lineItems.data) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        description: item.description || 'Purchase',
        amount: item.amount_total || 0,
        currency: session.currency || 'gbp',
        quantity: item.quantity || 1,
      });
    }

    console.log('Added line items to invoice');

    if (!invoice.id) {
      throw new Error('Invoice ID is missing');
    }

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    if (!finalizedInvoice || !finalizedInvoice.id) {
      throw new Error('Failed to finalize invoice - no ID returned');
    }

    console.log('Finalized invoice:', finalizedInvoice.id);

    // Mark invoice as paid since payment already completed via checkout
    if (session.payment_intent) {
      try {
        await stripe.invoices.pay(finalizedInvoice.id, {
          paid_out_of_band: true,
        });
        console.log(
          `✅ Invoice ${finalizedInvoice.id} created and marked as paid for session ${session.id}`
        );
      } catch (payError: any) {
        // If marking as paid fails, log but don't fail the webhook
        console.warn('Could not mark invoice as paid (this is ok):', payError.message);
        console.log(`✅ Invoice ${finalizedInvoice.id} created (payment already processed)`);
      }
    }

    return finalizedInvoice;
  } catch (error: any) {
    console.error('Error creating invoice for checkout:', error.message || error);
    // Don't throw - we don't want to fail the webhook if invoice creation fails
    // The payment has already succeeded, invoice is just for records
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.metadata?.clerkUserId;
  const type = session.metadata?.type;
  const customerEmail = session.customer_email;
  const recipeCount = session.metadata?.recipeCount;

  console.log('Webhook: Checkout session completed:', {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    userId,
    type,
    customerEmail,
    amountTotal: session.amount_total,
  });

  // Only process paid sessions
  if (session.payment_status !== 'paid') {
    console.log('Webhook: Session payment not completed:', session.payment_status);
    return;
  }

  // Create formal invoice for this purchase
  await createInvoiceForCheckout(session);

  // Handle one-time payment for recipe access
  if (type === 'recipe_access' && userId && userId !== 'guest') {
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

    console.log('Webhook: Recipe access granted successfully to user:', userId);
    return;
  }

  // Handle PDF download payments with valid user ID
  if (type === 'pdf_download' && userId && userId !== 'guest') {
    console.log('Webhook: Granting PDF access to authenticated user:', userId);

    try {
      await db
        .insert(premiumFeatures)
        .values({
          userId: userId,
          feature: 'pdf_downloads',
          grantedAt: new Date(),
          expiresAt: null, // Lifetime access
          metadata: {
            sessionId: session.id,
            amountPaid: session.amount_total ? session.amount_total / 100 : 0,
            recipeCount: recipeCount ? parseInt(recipeCount) : 1,
            planType: 'pdf_download',
          },
        })
        .onConflictDoUpdate({
          target: [premiumFeatures.userId, premiumFeatures.feature],
          set: {
            grantedAt: new Date(),
            metadata: {
              sessionId: session.id,
              amountPaid: session.amount_total ? session.amount_total / 100 : 0,
              recipeCount: recipeCount ? parseInt(recipeCount) : 1,
              planType: 'pdf_download',
            },
          },
        });

      console.log('Webhook: PDF access granted successfully to user:', userId);
    } catch (dbError) {
      console.error('Webhook: Database error granting PDF access:', dbError);
      throw dbError;
    }
    return;
  }

  // Handle PDF download payments with guest user (email fallback)
  if (type === 'pdf_download' && (userId === 'guest' || !userId) && customerEmail) {
    console.log('Webhook: Attempting email fallback for PDF access:', customerEmail);

    try {
      const { user: userSchema } = await import('@/src/db/schemas/user.schema');
      const userRecord = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, customerEmail))
        .limit(1);

      if (userRecord.length > 0) {
        const foundUserId = userRecord[0].id;
        console.log('Webhook: Granting PDF access via email fallback to user:', foundUserId);

        await db
          .insert(premiumFeatures)
          .values({
            userId: foundUserId,
            feature: 'pdf_downloads',
            grantedAt: new Date(),
            expiresAt: null,
            metadata: {
              sessionId: session.id,
              amountPaid: session.amount_total ? session.amount_total / 100 : 0,
              recipeCount: recipeCount ? parseInt(recipeCount) : 1,
              planType: 'pdf_download',
              grantedViaEmail: true,
            },
          })
          .onConflictDoUpdate({
            target: [premiumFeatures.userId, premiumFeatures.feature],
            set: {
              grantedAt: new Date(),
              metadata: {
                sessionId: session.id,
                amountPaid: session.amount_total ? session.amount_total / 100 : 0,
                recipeCount: recipeCount ? parseInt(recipeCount) : 1,
                planType: 'pdf_download',
                grantedViaEmail: true,
              },
            },
          });

        console.log('Webhook: PDF access granted via email fallback successfully');
      } else {
        console.warn('Webhook: User not found for email fallback:', customerEmail);
      }
    } catch (error) {
      console.error('Webhook: Failed to grant access via email fallback:', error);
    }
    return;
  }

  // Handle other PDF download scenarios by amount (fallback for missing metadata)
  if (!type && customerEmail && [299, 499, 799, 999, 1000].includes(session.amount_total || 0)) {
    console.log('Webhook: Attempting amount-based fallback for:', customerEmail);

    try {
      const { user: userSchema } = await import('@/src/db/schemas/user.schema');
      const userRecord = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, customerEmail))
        .limit(1);

      if (userRecord.length > 0) {
        const foundUserId = userRecord[0].id;
        const featureType = session.amount_total === 1000 ? 'recipe_access' : 'pdf_downloads';

        console.log(`Webhook: Granting ${featureType} via amount fallback to user:`, foundUserId);

        await db
          .insert(premiumFeatures)
          .values({
            userId: foundUserId,
            feature: featureType,
            grantedAt: new Date(),
            expiresAt: featureType === 'recipe_access' ? null : null,
            metadata: {
              sessionId: session.id,
              amountPaid: session.amount_total ? session.amount_total / 100 : 0,
              planType: featureType === 'recipe_access' ? 'lifetime' : 'pdf_download',
              grantedViaAmountFallback: true,
            },
          })
          .onConflictDoUpdate({
            target: [premiumFeatures.userId, premiumFeatures.feature],
            set: {
              grantedAt: new Date(),
              metadata: {
                sessionId: session.id,
                amountPaid: session.amount_total ? session.amount_total / 100 : 0,
                planType: featureType === 'recipe_access' ? 'lifetime' : 'pdf_download',
                grantedViaAmountFallback: true,
              },
            },
          });

        console.log('Webhook: Access granted via amount fallback successfully');
      } else {
        console.warn('Webhook: User not found for amount fallback:', customerEmail);
      }
    } catch (error) {
      console.error('Webhook: Failed to grant access via amount fallback:', error);
    }
    return;
  }

  // Handle standard subscription checkout
  const planId = session.metadata?.planId;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('Missing userId for subscription checkout');
    return;
  }

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

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log('Webhook: Processing refund for charge:', charge.id);

    // Get the payment intent to find associated session metadata
    const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) {
      console.log('No payment intent found for refunded charge');
      return;
    }

    // Try to find the customer and user
    const customerEmail = charge.billing_details?.email;
    const chargeMetadata = charge.metadata;

    console.log('Refund details:', {
      chargeId: charge.id,
      amount: charge.amount_refunded,
      currency: charge.currency,
      customerEmail,
      metadata: chargeMetadata,
    });

    // If we have user information, revoke access
    if (customerEmail) {
      try {
        const { user: userSchema } = await import('@/src/db/schemas/user.schema');
        const userRecord = await db
          .select()
          .from(userSchema)
          .where(eq(userSchema.email, customerEmail))
          .limit(1);

        if (userRecord.length > 0) {
          const userId = userRecord[0].id;

          // For one-time purchases (PDF downloads, recipe access), remove the feature
          // Note: This is a policy decision - you might want to keep access even after refund
          await db
            .delete(premiumFeatures)
            .where(
              and(eq(premiumFeatures.userId, userId), eq(premiumFeatures.feature, 'pdf_downloads'))
            );

          await db
            .delete(premiumFeatures)
            .where(
              and(eq(premiumFeatures.userId, userId), eq(premiumFeatures.feature, 'recipe_access'))
            );

          console.log(`Revoked access for user ${userId} due to refund`);

          // Log the refund in billing history
          await db.insert(billingHistory).values({
            id: crypto.randomUUID(),
            userId: userId,
            amount: (charge.amount_refunded / 100).toFixed(2),
            currency: charge.currency,
            status: 'refunded',
            description: `Refund for charge ${charge.id}`,
            stripePaymentIntentId: paymentIntentId,
            billingDate: new Date(),
            createdAt: new Date(),
          });

          console.log('Refund recorded in billing history');
        } else {
          console.log('User not found for refund email:', customerEmail);
        }
      } catch (error) {
        console.error('Error processing refund:', error);
      }
    }
  } catch (error) {
    console.error('Error handling charge refund:', error);
    // Don't throw - we don't want to fail the webhook
  }
}
