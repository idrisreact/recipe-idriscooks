import { db } from '../db';
import { userSubscriptions, subscriptionPlans, userUsage } from '../db/schemas';
import { eq, and } from 'drizzle-orm';
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  UserUsage,
  SubscriptionAccessCheck,
  PlanFeatures,
  PlanLimits
} from '../types/subscription.types';

/**
 * Get user's current active subscription with plan details
 */
export async function getUserSubscription(userId: string): Promise<{
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
}> {
  try {
    const result = await db
      .select()
      .from(userSubscriptions)
      .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, 'active')
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { subscription: null, plan: null };
    }

    const row = result[0];
    return {
      subscription: row.user_subscriptions as UserSubscription,
      plan: row.subscription_plans as SubscriptionPlan
    };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return { subscription: null, plan: null };
  }
}

/**
 * Get all available subscription plans
 */
export async function getAvailablePlans(): Promise<SubscriptionPlan[]> {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);

    return plans as SubscriptionPlan[];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
}

/**
 * Get user's current month usage statistics
 */
export async function getUserUsage(userId: string): Promise<UserUsage | null> {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const monthString = `${year}-${month}`; // YYYY-MM format

    const usage = await db
      .select()
      .from(userUsage)
      .where(
        and(
          eq(userUsage.userId, userId),
          eq(userUsage.month, monthString)
        )
      )
      .limit(1);

    return usage.length > 0 ? (usage[0] as UserUsage) : null;
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return null;
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof PlanFeatures
): Promise<SubscriptionAccessCheck> {
  try {
    const { subscription, plan } = await getUserSubscription(userId);
    
    if (!subscription || !plan) {
      return {
        hasAccess: false,
        reason: 'No active subscription',
        upgradeRequired: true
      };
    }

    const features = plan.features as PlanFeatures;
    const hasFeature = features[feature];

    if (hasFeature === undefined || hasFeature === false) {
      return {
        hasAccess: false,
        reason: `Feature not available in ${plan.name} plan`,
        upgradeRequired: true,
        featureName: feature
      };
    }

    return {
      hasAccess: true,
      featureName: feature
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      hasAccess: false,
      reason: 'Error checking access',
      upgradeRequired: false
    };
  }
}

/**
 * Check if user has reached usage limits for a specific feature
 */
export async function checkUsageLimit(
  userId: string,
  limitType: keyof PlanLimits
): Promise<SubscriptionAccessCheck> {
  try {
    const { subscription, plan } = await getUserSubscription(userId);
    const usage = await getUserUsage(userId);
    
    if (!subscription || !plan) {
      return {
        hasAccess: false,
        reason: 'No active subscription',
        upgradeRequired: true
      };
    }

    const limits = plan.limits as PlanLimits;
    const limit = limits[limitType];

    // If no limit is set (unlimited), access is granted
    if (limit === undefined || limit === null) {
      return {
        hasAccess: true,
        featureName: limitType
      };
    }

    if (!usage) {
      // No usage data means user hasn't used the feature yet
      return {
        hasAccess: true,
        remainingUsage: limit,
        featureName: limitType
      };
    }

    // Map limit types to usage fields
    const usageMapping: Record<string, keyof UserUsage> = {
      monthlyRecipeViews: 'recipeViews',
      totalFavorites: 'favoritesCount',
      totalCollections: 'collectionsCount',
      activeMealPlans: 'mealPlansCount',
      sharedRecipesPerMonth: 'recipesShared',
      pdfExportsPerMonth: 'pdfExports'
    };

    const usageField = usageMapping[limitType];
    if (!usageField) {
      return {
        hasAccess: true,
        featureName: limitType
      };
    }

    const currentUsage = usage[usageField] as number || 0;
    const remaining = limit - currentUsage;

    return {
      hasAccess: remaining > 0,
      reason: remaining <= 0 ? `${limitType} limit reached` : undefined,
      remainingUsage: Math.max(0, remaining),
      upgradeRequired: remaining <= 0,
      featureName: limitType
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return {
      hasAccess: false,
      reason: 'Error checking usage',
      upgradeRequired: false
    };
  }
}

/**
 * Increment usage for a specific feature
 */
export async function incrementUsage(
  userId: string,
  usageType: keyof UserUsage,
  amount: number = 1
): Promise<boolean> {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const monthNum = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const monthString = `${year}-${monthNum}`; // YYYY-MM format

    // Skip non-numeric fields
    if (!['recipeViews', 'favoritesCount', 'collectionsCount', 'mealPlansCount', 'recipesCreated', 'pdfExports', 'recipesShared'].includes(usageType)) {
      return true;
    }

    // First, try to update existing usage record
    const existingUsage = await db
      .select()
      .from(userUsage)
      .where(
        and(
          eq(userUsage.userId, userId),
          eq(userUsage.month, monthString)
        )
      )
      .limit(1);

    if (existingUsage.length > 0) {
      // Update existing record
      const currentValue = (existingUsage[0][usageType] as number) || 0;
      await db
        .update(userUsage)
        .set({
          [usageType]: currentValue + amount,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(userUsage.userId, userId),
            eq(userUsage.month, monthString)
          )
        );
    } else {
      // Create new usage record with proper defaults
      const newUsage = {
        id: `${userId}-${monthString}`, // Simple ID format
        userId,
        month: monthString,
        recipeViews: 0,
        favoritesCount: 0,
        collectionsCount: 0,
        mealPlansCount: 0,
        recipesCreated: 0,
        pdfExports: 0,
        recipesShared: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Set the specific usage type to the amount
      if (usageType === 'recipeViews') newUsage.recipeViews = amount;
      else if (usageType === 'favoritesCount') newUsage.favoritesCount = amount;
      else if (usageType === 'collectionsCount') newUsage.collectionsCount = amount;
      else if (usageType === 'mealPlansCount') newUsage.mealPlansCount = amount;
      else if (usageType === 'recipesCreated') newUsage.recipesCreated = amount;
      else if (usageType === 'pdfExports') newUsage.pdfExports = amount;
      else if (usageType === 'recipesShared') newUsage.recipesShared = amount;

      await db.insert(userUsage).values(newUsage);
    }

    return true;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }
}

/**
 * Check if user can perform an action (combines feature access and usage limits)
 */
export async function canPerformAction(
  userId: string,
  feature: keyof PlanFeatures,
  limitType?: keyof PlanLimits
): Promise<SubscriptionAccessCheck> {
  try {
    // First check if user has access to the feature
    const featureCheck = await checkFeatureAccess(userId, feature);
    
    if (!featureCheck.hasAccess) {
      return featureCheck;
    }

    // If no limit type specified, just return feature access result
    if (!limitType) {
      return featureCheck;
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(userId, limitType);
    
    return usageCheck;
  } catch (error) {
    console.error('Error checking action permission:', error);
    return {
      hasAccess: false,
      reason: 'Error checking permissions',
      upgradeRequired: false
    };
  }
}

/**
 * Get plan comparison for upgrade/downgrade decisions
 */
export async function comparePlans(
  currentPlanId: string,
  targetPlanId: string
): Promise<{
  isUpgrade: boolean;
  priceDifference: number;
  featureDifferences: Record<string, boolean | number | undefined>;
  limitDifferences: Record<string, number | undefined>;
}> {
  try {
    const [currentPlan, targetPlan] = await Promise.all([
      db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, currentPlanId)).limit(1),
      db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, targetPlanId)).limit(1)
    ]);

    if (currentPlan.length === 0 || targetPlan.length === 0) {
      throw new Error('Plan not found');
    }

    const current = currentPlan[0] as SubscriptionPlan;
    const target = targetPlan[0] as SubscriptionPlan;

    const currentPrice = parseFloat(current.price);
    const targetPrice = parseFloat(target.price);
    const priceDifference = targetPrice - currentPrice;

    const featureDifferences: Record<string, boolean | number | undefined> = {};
    const limitDifferences: Record<string, number | undefined> = {};

    // Compare features
    const currentFeatures = current.features as PlanFeatures;
    const targetFeatures = target.features as PlanFeatures;

    (Object.keys(targetFeatures) as Array<keyof PlanFeatures>).forEach(featureKey => {
      if (currentFeatures[featureKey] !== targetFeatures[featureKey]) {
        featureDifferences[featureKey] = targetFeatures[featureKey];
      }
    });

    // Compare limits
    const currentLimits = current.limits as PlanLimits;
    const targetLimits = target.limits as PlanLimits;

    if (targetLimits) {
      (Object.keys(targetLimits) as Array<keyof PlanLimits>).forEach(limitKey => {
        if (currentLimits?.[limitKey] !== targetLimits[limitKey]) {
          limitDifferences[limitKey] = targetLimits[limitKey];
        }
      });
    }

    return {
      isUpgrade: priceDifference > 0,
      priceDifference,
      featureDifferences,
      limitDifferences
    };
  } catch (error) {
    console.error('Error comparing plans:', error);
    throw error;
  }
}