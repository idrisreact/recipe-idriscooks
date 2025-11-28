import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/src/utils/auth';
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

    const body = await request.json();
    const { recipeCount } = body;

    if (!recipeCount || recipeCount < 1) {
      return NextResponse.json({ error: 'Invalid recipe count' }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `PDF Recipe Collection`,
              description: `Download ${recipeCount} favorite recipe${recipeCount > 1 ? 's' : ''} as a beautifully formatted PDF`,
              images: [`${process.env.NEXT_PUBLIC_BASE_URL}/images/pdf-preview.png`],
            },
            unit_amount: calculatePrice(recipeCount), // Price in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/favorites`,
      metadata: {
        userId: session?.user?.id || 'guest',
        recipeCount: recipeCount.toString(),
        type: 'pdf_download',
      },
      customer_email: session?.user?.email || undefined,
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

function calculatePrice(recipeCount: number): number {
  if (recipeCount <= 5) return 299; // $2.99
  if (recipeCount <= 10) return 499; // $4.99
  if (recipeCount <= 20) return 799; // $7.99
  return 999; // $9.99 for more than 20 recipes
}
