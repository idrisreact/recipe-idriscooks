import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/src/utils/auth';
import { rateLimit } from '@/src/lib/rate-limit';
import { getRecipeAccessPrice } from '@/src/config/pricing';

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

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pricing = getRecipeAccessPrice();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Recipe Access - Lifetime ${pricing.label ? `(${pricing.label})` : ''}`,
              description: 'Unlimited access to all recipes, forever',
            },
            unit_amount: pricing.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recipes?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recipes?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        type: 'recipe_access',
        pricingTier: pricing.label || 'standard',
      },
      customer_email: session.user.email,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
