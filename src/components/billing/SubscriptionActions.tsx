'use client';

import { SUBSCRIPTION_PLANS } from '@/src/lib/clerk-billing';

interface SubscriptionActionsProps {
  currentPlanId: string;
}

export function SubscriptionActions({ currentPlanId }: SubscriptionActionsProps) {
  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlanId) {
      return;
    }

    try {
      if (planId === 'free') {
        // Redirect to billing portal to cancel subscription
        const response = await fetch('/api/billing/portal', {
          method: 'POST',
        });

        const { url } = await response.json();

        if (url) {
          window.location.href = url;
        }
      } else {
        // Create checkout session for the selected plan
        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

        if (!plan) {
          throw new Error('Plan not found');
        }

        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: plan.stripePriceId,
            planId: plan.id,
          }),
        });

        const { url } = await response.json();

        if (url) {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error('Error handling subscription:', error);
      alert('Failed to process subscription. Please try again.');
    }
  };

  // Inject handlers into window for PricingCard to use
  if (typeof window !== 'undefined') {
    const windowWithHandler = window as typeof window & { __handleSelectPlan?: (id: string) => Promise<void> };
    windowWithHandler.__handleSelectPlan = handleSelectPlan;
  }

  return null;
}
