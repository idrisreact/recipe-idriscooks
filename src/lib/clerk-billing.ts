/**
 * Clerk Billing Configuration
 *
 * This module handles the integration between Clerk and Stripe for subscription management.
 * Clerk Billing simplifies subscription management by handling the checkout flow,
 * subscription lifecycle, and webhooks automatically.
 *
 * This is a SHARED module - can be used in both client and server components.
 */

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  limits?: {
    monthlyRecipeViews?: number;
    totalFavorites?: number;
    totalCollections?: number;
    pdfExportsPerMonth?: number;
  };
  popular?: boolean;
};

/**
 * Define your subscription plans
 * These should match the plans you create in Stripe Dashboard
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out the platform',
    price: 0,
    interval: 'month',
    stripePriceId: '', // No Stripe price for free tier
    features: [
      '3 recipe views per month',
      '5 favorite recipes',
      '1 collection',
      'Basic recipe search',
    ],
    limits: {
      monthlyRecipeViews: 3,
      totalFavorites: 5,
      totalCollections: 1,
      pdfExportsPerMonth: 0,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For home chefs who love to cook',
    price: 9.99,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    features: [
      'Unlimited recipe views',
      'Unlimited favorites',
      '10 collections',
      'PDF exports',
      'Advanced search',
      'Nutrition information',
      'Meal planning',
    ],
    limits: {
      monthlyRecipeViews: -1, // unlimited
      totalFavorites: -1,
      totalCollections: 10,
      pdfExportsPerMonth: 50,
    },
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For culinary professionals',
    price: 19.99,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    features: [
      'Everything in Pro',
      'Unlimited collections',
      'Unlimited PDF exports',
      'Recipe sharing',
      'Priority support',
      'Custom themes',
      'Offline access',
      'Advanced analytics',
    ],
    limits: {
      monthlyRecipeViews: -1,
      totalFavorites: -1,
      totalCollections: -1,
      pdfExportsPerMonth: -1,
    },
  },
];

/**
 * Get the subscription plan by ID
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}


/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
