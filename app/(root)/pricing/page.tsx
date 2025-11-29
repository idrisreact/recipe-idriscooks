import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { eq, and } from 'drizzle-orm';
import { Check } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - Recipe Platform',
  description: 'Choose the perfect plan for your cooking journey',
};

export default async function PricingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/sign-in?redirect_url=/pricing');
  }

  const userId = session.user.id;

  // Check if user already has recipe access
  const [recipeAccess] = await db
    .select()
    .from(premiumFeatures)
    .where(
      and(
        eq(premiumFeatures.userId, userId),
        eq(premiumFeatures.feature, 'recipe_access')
      )
    )
    .limit(1);

  const hasAccess = !!recipeAccess;

  return (
    <div className="wrapper page">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features and take your cooking to the next level
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="murakamicity-card rounded-2xl shadow-lg p-8 border-2 border-border">
              <h3 className="text-2xl font-bold mb-2 text-foreground">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">£0</span>
                <span className="text-muted-foreground ml-2">forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-foreground">Browse all recipes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-foreground">Save favorites</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-foreground">Basic search</span>
                </li>
              </ul>
              {!hasAccess ? (
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-lg bg-muted text-muted-foreground cursor-not-allowed font-medium"
                >
                  Current Plan
                </button>
              ) : (
                <div className="w-full py-3 px-6 text-center text-muted-foreground font-medium">
                  Basic features
                </div>
              )}
            </div>

            {/* Premium Plan */}
            <div className="murakamicity-card rounded-2xl shadow-lg p-8 border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">Lifetime Access</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">£10</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="font-medium text-foreground">Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-foreground">Unlimited recipe access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-foreground">PDF downloads</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-foreground">Advanced filtering</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-foreground">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-foreground">Lifetime updates</span>
                </li>
              </ul>
              {hasAccess ? (
                <div className="w-full py-3 px-6 rounded-lg bg-green-500/20 text-green-500 text-center font-medium">
                  ✓ You have access
                </div>
              ) : (
                <Link
                  href="/api/stripe/checkout/recipe-access"
                  className="block w-full py-3 px-6 rounded-lg bg-primary text-primary-foreground text-center hover:opacity-90 transition-opacity font-medium"
                >
                  Get Lifetime Access
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Is this a subscription or one-time payment?
              </h3>
              <p className="text-muted-foreground">
                Lifetime Access is a one-time payment of £10. No recurring charges, no subscription
                fees. Pay once and get lifetime access to all premium features.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) through
                our secure payment processor, Stripe.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                What happens after I purchase?
              </h3>
              <p className="text-muted-foreground">
                After completing your payment, you&apos;ll be instantly granted access to all premium
                features. You&apos;ll also receive an email confirmation with your invoice.
              </p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Do you offer refunds?
              </h3>
              <p className="text-muted-foreground">
                Yes! We offer refunds within 7 days for technical issues, duplicate purchases,
                or billing errors. See our{' '}
                <Link href="/refund-policy" className="text-primary hover:underline">
                  refund policy
                </Link>{' '}
                for full details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
