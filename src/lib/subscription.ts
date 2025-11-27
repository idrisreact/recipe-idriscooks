/**
 * Subscription utilities for checking user access and enforcing limits
 */

import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { userSubscriptions, userUsage } from '@/src/db/schemas';
import { eq, and } from 'drizzle-orm';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: UserSubscriptionInfo['limits'];
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    features: ['Access to basic recipes', 'Create up to 3 recipes', 'Save 5 favorites'],
    limits: {
      monthlyRecipeViews: 3,
      totalFavorites: 5,
      totalCollections: 1,
      pdfExportsPerMonth: 0,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For serious home cooks',
    price: 9.99,
    features: [
      'Unlimited recipe views',
      'Create unlimited recipes',
      'Save unlimited favorites',
      'Nutrition information',
      'Advanced search',
    ],
    limits: {
      monthlyRecipeViews: -1,
      totalFavorites: -1,
      totalCollections: 10,
      pdfExportsPerMonth: 5,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'The ultimate cooking experience',
    price: 19.99,
    features: [
      'Everything in Pro',
      'PDF exports',
      'Priority support',
      'Share recipes with friends',
      'Exclusive chef content',
    ],
    limits: {
      monthlyRecipeViews: -1,
      totalFavorites: -1,
      totalCollections: -1,
      pdfExportsPerMonth: -1,
    },
  },
};

export function getPlanById(planId: string): Plan {
  return PLANS[planId] || PLANS.free;
}

export interface UserSubscriptionInfo {
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  features: {
    canExportPdf: boolean;
    canCreateRecipes: boolean;
    canShareRecipes: boolean;
    hasNutritionInfo: boolean;
    hasAdvancedSearch: boolean;
    hasPrioritySupport: boolean;
  };
  limits: {
    monthlyRecipeViews?: number; // -1 means unlimited
    totalFavorites?: number;
    totalCollections?: number;
    pdfExportsPerMonth?: number;
  };
}

/**
 * Get database user ID for the current session
 */
async function getDbUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id || null;
}

/**
 * Get the current user's subscription information
 */
export async function getUserSubscriptionInfo(): Promise<UserSubscriptionInfo | null> {
  const dbUserId = await getDbUserId();

  if (!dbUserId) {
    return null;
  }

  // Get subscription from database using mapped user ID
  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, dbUserId))
    .limit(1);

  const planId = subscription?.planId || 'free';
  const plan = getPlanById(planId);

  if (!plan) {
    return null;
  }

  return {
    planId: plan.id,
    status: (subscription?.status as SubscriptionStatus) || 'active',
    currentPeriodEnd: subscription?.currentPeriodEnd || null,
    features: {
      canExportPdf: plan.features.includes('PDF exports'),
      canCreateRecipes: plan.id !== 'free',
      canShareRecipes: plan.id === 'premium',
      hasNutritionInfo: plan.features.includes('Nutrition information'),
      hasAdvancedSearch: plan.features.includes('Advanced search'),
      hasPrioritySupport: plan.id === 'premium',
    },
    limits: plan.limits || {
      monthlyRecipeViews: 3,
      totalFavorites: 5,
      totalCollections: 1,
      pdfExportsPerMonth: 0,
    },
  };
}

/**
 * Check if user can access a specific feature
 */
export async function canAccessFeature(
  feature: keyof UserSubscriptionInfo['features']
): Promise<boolean> {
  const subscription = await getUserSubscriptionInfo();

  if (!subscription) {
    return false;
  }

  return subscription.features[feature];
}

/**
 * Check if user has reached their usage limit for a specific resource
 */
export async function hasReachedLimit(
  resource: keyof UserSubscriptionInfo['limits'],
  currentUsage: number
): Promise<boolean> {
  const subscription = await getUserSubscriptionInfo();

  if (!subscription) {
    return true; // No subscription = reached limit
  }

  const limit = subscription.limits[resource];

  // undefined or -1 means unlimited
  if (!limit || limit === -1) {
    return false;
  }

  return currentUsage >= limit;
}

/**
 * Get current month's usage for the user
 */
export async function getUserUsage() {
  const dbUserId = await getDbUserId();

  if (!dbUserId) {
    return null;
  }

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  const [usage] = await db
    .select()
    .from(userUsage)
    .where(and(eq(userUsage.userId, dbUserId), eq(userUsage.month, currentMonth)))
    .limit(1);

  return {
    recipeViews: usage?.recipeViews || 0,
    favoritesCount: usage?.favoritesCount || 0,
    collectionsCount: usage?.collectionsCount || 0,
    pdfExports: usage?.pdfExports || 0,
    recipesShared: usage?.recipesShared || 0,
  };
}

/**
 * Increment usage counter for a specific resource
 */
export async function incrementUsage(
  resource: 'recipeViews' | 'favoritesCount' | 'collectionsCount' | 'pdfExports' | 'recipesShared'
) {
  // Get the database user ID mapped from Clerk user
  const dbUserId = await getDbUserId();

  if (!dbUserId) {
    return;
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  // First, try to get existing usage
  const [existing] = await db
    .select()
    .from(userUsage)
    .where(and(eq(userUsage.userId, dbUserId), eq(userUsage.month, currentMonth)))
    .limit(1);

  if (existing) {
    // Update existing record
    await db
      .update(userUsage)
      .set({
        [resource]: (existing[resource] || 0) + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(userUsage.userId, dbUserId), eq(userUsage.month, currentMonth)));
  } else {
    // Insert new record
    await db.insert(userUsage).values({
      id: crypto.randomUUID(),
      userId: dbUserId,
      month: currentMonth,
      recipeViews: resource === 'recipeViews' ? 1 : 0,
      favoritesCount: resource === 'favoritesCount' ? 1 : 0,
      collectionsCount: resource === 'collectionsCount' ? 1 : 0,
      pdfExports: resource === 'pdfExports' ? 1 : 0,
      recipesShared: resource === 'recipesShared' ? 1 : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Check if user can perform an action based on their subscription
 */
export async function canPerformAction(
  action:
    | 'viewRecipe'
    | 'exportPdf'
    | 'createRecipe'
    | 'shareRecipe'
    | 'addFavorite'
    | 'createCollection'
): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getUserSubscriptionInfo();

  if (!subscription) {
    return { allowed: false, reason: 'No active subscription' };
  }

  const usage = await getUserUsage();

  if (!usage) {
    return { allowed: false, reason: 'Unable to retrieve usage data' };
  }

  switch (action) {
    case 'viewRecipe':
      if (
        subscription.limits.monthlyRecipeViews === -1 ||
        !subscription.limits.monthlyRecipeViews
      ) {
        return { allowed: true };
      }
      if (usage.recipeViews >= subscription.limits.monthlyRecipeViews) {
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${subscription.limits.monthlyRecipeViews} recipe views. Upgrade to view more!`,
        };
      }
      return { allowed: true };

    case 'exportPdf':
      if (!subscription.features.canExportPdf) {
        return {
          allowed: false,
          reason: 'PDF export is not available in your plan. Upgrade to Pro or Premium!',
        };
      }
      if (
        subscription.limits.pdfExportsPerMonth === -1 ||
        !subscription.limits.pdfExportsPerMonth
      ) {
        return { allowed: true };
      }
      if (usage.pdfExports >= subscription.limits.pdfExportsPerMonth) {
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${subscription.limits.pdfExportsPerMonth} PDF exports.`,
        };
      }
      return { allowed: true };

    case 'createRecipe':
      if (!subscription.features.canCreateRecipes) {
        return {
          allowed: false,
          reason: 'Recipe creation is not available in the free plan. Upgrade to unlock!',
        };
      }
      return { allowed: true };

    case 'shareRecipe':
      if (!subscription.features.canShareRecipes) {
        return {
          allowed: false,
          reason: 'Recipe sharing is only available in the Premium plan.',
        };
      }
      return { allowed: true };

    case 'addFavorite':
      if (subscription.limits.totalFavorites === -1 || !subscription.limits.totalFavorites) {
        return { allowed: true };
      }
      if (usage.favoritesCount >= subscription.limits.totalFavorites) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${subscription.limits.totalFavorites} favorites.`,
        };
      }
      return { allowed: true };

    case 'createCollection':
      if (subscription.limits.totalCollections === -1 || !subscription.limits.totalCollections) {
        return { allowed: true };
      }
      if (usage.collectionsCount >= subscription.limits.totalCollections) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${subscription.limits.totalCollections} collections.`,
        };
      }
      return { allowed: true };

    default:
      return { allowed: false, reason: 'Unknown action' };
  }
}
