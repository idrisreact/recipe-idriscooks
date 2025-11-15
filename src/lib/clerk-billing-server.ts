/**
 * Server-only billing functions
 * These use Clerk's auth() and should only be imported in server components
 */

import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { getPlanById, type SubscriptionPlan } from './clerk-billing';

/**
 * Get the user's current subscription status
 * This will be populated by Clerk's webhook events
 */
export async function getUserSubscription() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // In production, this would fetch from your database
  // For now, returning free tier as default
  return {
    userId,
    planId: 'free',
    status: 'active',
    currentPeriodEnd: null,
  };
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(feature: keyof SubscriptionPlan['limits']): Promise<boolean> {
  const subscription = await getUserSubscription();

  if (!subscription) {
    return false;
  }

  const plan = getPlanById(subscription.planId);

  if (!plan || !plan.limits) {
    return false;
  }

  const limit = plan.limits[feature];

  // -1 means unlimited
  if (limit === -1) {
    return true;
  }

  // 0 or undefined means no access
  if (!limit) {
    return false;
  }

  // TODO: Check current usage against limit
  // This would require fetching usage data from your database
  return true;
}
