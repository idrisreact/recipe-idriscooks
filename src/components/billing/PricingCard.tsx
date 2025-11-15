'use client';

import { Check } from 'lucide-react';
import { SubscriptionPlan, formatPrice } from '@/src/lib/clerk-billing';

interface PricingCardProps {
  plan: SubscriptionPlan;
  currentPlanId?: string;
}

export function PricingCard({ plan, currentPlanId }: PricingCardProps) {
  const handleSelectPlan = () => {
    if (typeof window !== 'undefined') {
      const windowWithHandler = window as typeof window & { __handleSelectPlan?: (id: string) => void };
      if (windowWithHandler.__handleSelectPlan) {
        windowWithHandler.__handleSelectPlan(plan.id);
      }
    }
  };
  const isCurrentPlan = currentPlanId === plan.id;
  const isFree = plan.id === 'free';

  return (
    <div
      className={`relative rounded-2xl border-2 p-8 ${
        plan.popular
          ? 'border-[#6c47ff] shadow-lg scale-105'
          : isCurrentPlan
          ? 'border-green-500'
          : 'border-gray-200'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#6c47ff] text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <div className="mb-4">
          {isFree ? (
            <span className="text-4xl font-bold">Free</span>
          ) : (
            <>
              <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
              <span className="text-gray-600">/{plan.interval}</span>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#6c47ff] flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelectPlan}
        disabled={isCurrentPlan}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
          isCurrentPlan
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : plan.popular
            ? 'bg-[#6c47ff] text-white hover:bg-[#5a3dd4]'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : isFree ? 'Get Started' : 'Upgrade Now'}
      </button>
    </div>
  );
}
