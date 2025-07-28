import { PlanFeatures, PlanLimits, PlanType, UserUsage } from '../types/subscription.types';

// Feature access validation utilities
export class SubscriptionService {
  /**
   * Check if a user can access a specific feature based on their plan
   */
  static canAccessFeature(
    feature: keyof PlanFeatures,
    userPlanFeatures: PlanFeatures
  ): boolean {
    return Boolean(userPlanFeatures[feature]);
  }

  /**
   * Check if a user has reached their usage limit for a specific feature
   */
  static hasReachedLimit(
    limitType: keyof PlanLimits,
    currentUsage: number,
    planLimits: PlanLimits
  ): boolean {
    const limit = planLimits[limitType];
    if (limit === null || limit === undefined) return false; // Unlimited
    return currentUsage >= limit;
  }

  /**
   * Calculate remaining usage for a specific limit
   */
  static getRemainingUsage(
    limitType: keyof PlanLimits,
    currentUsage: number,
    planLimits: PlanLimits
  ): number | null {
    const limit = planLimits[limitType];
    if (limit === null || limit === undefined) return null; // Unlimited
    return Math.max(0, limit - currentUsage);
  }

  /**
   * Get usage percentage for a specific limit
   */
  static getUsagePercentage(
    limitType: keyof PlanLimits,
    currentUsage: number,
    planLimits: PlanLimits
  ): number {
    const limit = planLimits[limitType];
    if (limit === null || limit === undefined) return 0; // Unlimited
    return Math.min(100, (currentUsage / limit) * 100);
  }

  /**
   * Determine if a plan change is an upgrade or downgrade
   */
  static isPlanUpgrade(fromPlanType: PlanType, toPlanType: PlanType): boolean {
    const planHierarchy: Record<PlanType, number> = {
      free: 0,
      premium: 1,
      pro: 2,
    };
    return planHierarchy[toPlanType] > planHierarchy[fromPlanType];
  }

  /**
   * Calculate proration amount for plan changes
   */
  static calculateProration(
    currentPlanPrice: number,
    newPlanPrice: number,
    daysRemaining: number,
    totalDaysInPeriod: number
  ): number {
    const currentDailyRate = currentPlanPrice / totalDaysInPeriod;
    const newDailyRate = newPlanPrice / totalDaysInPeriod;
    const currentCredit = currentDailyRate * daysRemaining;
    const newCharge = newDailyRate * daysRemaining;
    return newCharge - currentCredit;
  }

  /**
   * Check if a recipe type is accessible to a user's plan
   */
  static canAccessRecipeType(
    recipeType: 'free' | 'premium' | 'pro_only',
    planType: PlanType
  ): boolean {
    switch (recipeType) {
      case 'free':
        return true; // Everyone can access free recipes
      case 'premium':
        return ['premium', 'pro'].includes(planType);
      case 'pro_only':
        return ['pro'].includes(planType);
      default:
        return false;
    }
  }

  /**
   * Get feature comparison matrix for plan selection
   */
  static getFeatureComparison(): Record<keyof PlanFeatures, Record<PlanType, boolean | number | string>> {
    return {
      maxRecipeViews: {
        free: 100,
        premium: 1000,
        pro: 0, // Unlimited
      },
      maxFavorites: {
        free: 25,
        premium: 100,
        pro: 0, // Unlimited
      },
      maxCollections: {
        free: 3,
        premium: 20,
        pro: 0, // Unlimited
      },
      maxMealPlans: {
        free: 1,
        premium: 10,
        pro: 0, // Unlimited
      },
      canCreateRecipes: {
        free: false,
        premium: true,
        pro: true,
      },
      canExportPdf: {
        free: false,
        premium: true,
        pro: true,
      },
      canShareRecipes: {
        free: false,
        premium: false,
        pro: true,
      },
      hasNutritionInfo: {
        free: false,
        premium: true,
        pro: true,
      },
      hasOfflineAccess: {
        free: false,
        premium: false,
        pro: true,
      },
      hasCustomThemes: {
        free: false,
        premium: true,
        pro: true,
      },
      hasPrioritySupport: {
        free: false,
        premium: false,
        pro: true,
      },
      hasAdvancedSearch: {
        free: false,
        premium: true,
        pro: true,
      },
    };
  }

  /**
   * Generate usage report for admin dashboard
   */
  static generateUsageReport(usage: UserUsage, limits: PlanLimits) {
    return {
      recipeViews: {
        current: usage.recipeViews || 0,
        limit: limits.monthlyRecipeViews,
        percentage: this.getUsagePercentage('monthlyRecipeViews', usage.recipeViews || 0, limits),
        remaining: this.getRemainingUsage('monthlyRecipeViews', usage.recipeViews || 0, limits),
      },
      pdfExports: {
        current: usage.pdfExports || 0,
        limit: limits.pdfExportsPerMonth,
        percentage: this.getUsagePercentage('pdfExportsPerMonth', usage.pdfExports || 0, limits),
        remaining: this.getRemainingUsage('pdfExportsPerMonth', usage.pdfExports || 0, limits),
      },
      favorites: {
        current: usage.favoritesCount || 0,
        limit: limits.totalFavorites,
        percentage: this.getUsagePercentage('totalFavorites', usage.favoritesCount || 0, limits),
        remaining: this.getRemainingUsage('totalFavorites', usage.favoritesCount || 0, limits),
      },
      collections: {
        current: usage.collectionsCount || 0,
        limit: limits.totalCollections,
        percentage: this.getUsagePercentage('totalCollections', usage.collectionsCount || 0, limits),
        remaining: this.getRemainingUsage('totalCollections', usage.collectionsCount || 0, limits),
      },
    };
  }
}

// Premium feature definitions and benefits
export const PREMIUM_FEATURES = {
  RECIPE_CREATION: {
    name: 'Create Your Own Recipes',
    description: 'Share your culinary creations with detailed instructions and photos',
    plans: ['premium', 'pro'],
    category: 'content',
  },
  MEAL_PLANNING: {
    name: 'Advanced Meal Planning',
    description: 'Plan weekly meals, generate shopping lists, and track nutrition',
    plans: ['premium', 'pro'],
    category: 'planning',
  },
  RECIPE_COLLECTIONS: {
    name: 'Recipe Collections',
    description: 'Organize recipes into custom collections and meal categories',
    plans: ['premium', 'pro'],
    category: 'organization',
  },
  NUTRITIONAL_INFO: {
    name: 'Detailed Nutrition Facts',
    description: 'Complete nutritional breakdown including macros, vitamins, and allergens',
    plans: ['premium', 'pro'],
    category: 'health',
  },
  PDF_EXPORT: {
    name: 'Recipe PDF Export',
    description: 'Export recipes as beautifully formatted PDFs for offline use',
    plans: ['premium', 'pro'],
    category: 'export',
  },
  ADVANCED_SEARCH: {
    name: 'Advanced Search & Filters',
    description: 'Search by ingredients, dietary restrictions, cook time, and more',
    plans: ['premium', 'pro'],
    category: 'discovery',
  },
  RECIPE_SHARING: {
    name: 'Recipe Sharing',
    description: 'Share recipes privately with friends and family',
    plans: ['pro'],
    category: 'social',
  },
  OFFLINE_ACCESS: {
    name: 'Offline Recipe Access',
    description: 'Download recipes for cooking without internet connection',
    plans: ['pro'],
    category: 'convenience',
  },
  PRIORITY_SUPPORT: {
    name: 'Priority Customer Support',
    description: 'Get faster response times and dedicated support channels',
    plans: ['pro'],
    category: 'support',
  },
  CUSTOM_THEMES: {
    name: 'Custom Themes & Layout',
    description: 'Personalize your cooking experience with custom themes',
    plans: ['premium', 'pro'],
    category: 'customization',
  },
} as const;

// Content gating helpers
export const CONTENT_GATES = {
  RECIPE_VIEW_LIMIT: {
    free: 10, // recipes per month
    premium: null, // unlimited
    pro: null,
  },
  PREMIUM_RECIPE_ACCESS: {
    free: false,
    premium: true,
    pro: true,
  },
  RECIPE_CREATION: {
    free: false,
    premium: true,
    pro: true,
  },
} as const;