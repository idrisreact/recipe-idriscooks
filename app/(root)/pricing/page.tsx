import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PricingCard } from '@/src/components/billing/PricingCard';
import { SUBSCRIPTION_PLANS } from '@/src/lib/clerk-billing';
import { getUserSubscription } from '@/src/lib/clerk-billing-server';
import { SubscriptionActions } from '@/src/components/billing/SubscriptionActions';

export const metadata = {
  title: 'Pricing - Recipe Platform',
  description: 'Choose the perfect plan for your cooking journey',
};

export default async function PricingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/pricing');
  }

  const subscription = await getUserSubscription();

  return (
    <div className="wrapper page">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock premium features and take your cooking to the next level
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlanId={subscription?.planId}
            />
          ))}
        </div>

        <SubscriptionActions currentPlanId={subscription?.planId || 'free'} />

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-2">
                Can I cancel my subscription at any time?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access
                to premium features until the end of your billing period.
              </p>
            </div>
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) through
                our secure payment processor, Stripe.
              </p>
            </div>
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be
                reflected immediately, and we&apos;ll prorate the difference.
              </p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied with your
                subscription, contact us within 30 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
