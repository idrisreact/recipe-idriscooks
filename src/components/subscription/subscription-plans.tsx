'use client';

import { Text } from '@/src/components/ui/Text';
import { Check, FileText, Heart, Star } from 'lucide-react';
import { authClient } from '@/src/utils/auth-client';
import { useState } from 'react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    currency: '£',
    billingCycle: 'forever',
    description: 'Perfect for exploring recipes',
    features: [
      'Browse all recipes',
      'Save favorite recipes',
      'Recipe search & filters',
      'Mobile-friendly access',
      'Community features',
    ],
    popular: false,
    current: true,
  },
  {
    id: 'pdf',
    name: 'PDF Access',
    price: '19.99',
    currency: '£',
    billingCycle: 'one-time',
    description: 'Lifetime access to PDF exports',
    features: [
      'Everything in Free',
      'PDF recipe exports',
      'Printable recipe cards',
      'Offline recipe access',
      'Beautiful formatting',
      'Lifetime access',
    ],
    popular: true,
    current: false,
  },
];

export default function SubscriptionPlans() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  const handlePlanSelection = async (planId: string) => {
    if (!session) {
      return;
    }

    if (planId === 'free') {
      return;
    }

    if (planId === 'pdf') {
      setLoading(true);
      try {
        console.log('Redirecting to payment for PDF access...');

        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert('Payment integration would happen here!');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`murakamicity-card p-8 relative transition-all duration-200 ${
            plan.popular
              ? 'ring-2 ring-primary shadow-lg transform scale-105'
              : 'hover:shadow-lg hover:scale-102'
          }`}
        >
          {}
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star className="w-4 h-4" />
                Most Popular
              </div>
            </div>
          )}

          {}
          {plan.current && (
            <div className="absolute top-4 right-4">
              <div className="bg-green-500/20 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                Current Plan
              </div>
            </div>
          )}

          {}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              {plan.id === 'pdf' ? (
                <FileText className="w-6 h-6 text-primary" />
              ) : (
                <Heart className="w-6 h-6 text-muted-foreground" />
              )}
              <Text as="h3" variant="subheading">
                {plan.name}
              </Text>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-bold text-foreground">
                {plan.currency}
                {plan.price}
              </span>
              <Text className="text-muted-foreground ml-2">{plan.billingCycle}</Text>
            </div>

            <Text className="text-muted-foreground">{plan.description}</Text>
          </div>

          {}
          <div className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <Text>{feature}</Text>
              </div>
            ))}
          </div>

          {}
          <button
            onClick={() => handlePlanSelection(plan.id)}
            disabled={plan.current || loading}
            className={`w-full py-4 px-6 rounded-sm font-medium transition-all duration-200 ${
              plan.current
                ? 'bg-green-500/20 text-green-600 cursor-not-allowed'
                : plan.popular
                  ? 'murakamicity-button hover:scale-105'
                  : 'murakamicity-button-outline hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            {loading && plan.id === 'pdf' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : plan.current ? (
              'Current Plan'
            ) : plan.id === 'pdf' ? (
              'Get PDF Access'
            ) : (
              'Stay Free'
            )}
          </button>

          {}
          {plan.id === 'pdf' && (
            <Text className="text-center text-muted-foreground text-sm mt-4">
              One-time payment • No recurring fees • Lifetime access
            </Text>
          )}
        </div>
      ))}
    </div>
  );
}
