import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/src/utils/auth';
import { rateLimit } from '@/src/lib/rate-limit';
import { db } from '@/src/db';
import { userSubscriptions } from '@/src/db/schemas';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Handles the billing page form POST, so failures redirect back with a
// query flag instead of returning JSON the browser would render raw.
export async function POST(request: NextRequest) {
  const rateLimited = await rateLimit(request, 'payment');
  if (rateLimited) return rateLimited;

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/sign-in?redirect_url=/billing', request.url), 303);
  }

  try {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, session.user.id))
      .limit(1);

    let customerId = subscription?.stripeCustomerId ?? null;

    if (!customerId && session.user.email) {
      const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
      customerId = customers.data[0]?.id ?? null;
    }

    if (!customerId) {
      return NextResponse.redirect(new URL('/billing?portal=missing', request.url), 303);
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    });

    return NextResponse.redirect(portalSession.url, 303);
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.redirect(new URL('/billing?portal=error', request.url), 303);
  }
}
