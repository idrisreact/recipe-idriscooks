/**
 * Single source of truth for what a user is allowed to do.
 *
 * The business model (see src/config/pricing.ts):
 * - Free tier: limited monthly recipe views and a capped number of favorites.
 * - "recipe_access" (premiumFeatures row): one-time purchase, lifetime unlimited
 *   recipe views and favorites.
 * - "pdf_downloads" (premiumFeatures row): one-time purchase of a recipe-bundle
 *   PDF export allowance (bundle size in metadata.recipeCount).
 *
 * Replaces the old src/lib/subscription.ts and src/utils/subscription.ts modules.
 */

import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { userUsage } from '@/src/db/schemas';
import { favoriteRecipes } from '@/src/db/schemas/favorite-recipes.schema';
import { and, eq, sql } from 'drizzle-orm';
import { PRICING } from '@/src/config/pricing';

export type EntitlementAction = 'viewRecipe' | 'addFavorite' | 'createCollection' | 'exportPdf';

export type UsageField =
  | 'recipeViews'
  | 'favoritesCount'
  | 'collectionsCount'
  | 'mealPlansCount'
  | 'recipesCreated'
  | 'pdfExports'
  | 'recipesShared';

export interface Usage {
  recipeViews: number;
  favoritesCount: number;
  collectionsCount: number;
  mealPlansCount: number;
  recipesCreated: number;
  pdfExports: number;
  recipesShared: number;
}

export interface Entitlements {
  /** Lifetime recipe access purchased — unlimited views and favorites. */
  hasRecipeAccess: boolean;
  /** PDF download bundle purchased. */
  hasPdfAccess: boolean;
  /** Bundle size purchased (recipes per PDF export), 0 when none. */
  pdfRecipeLimit: number;
  limits: {
    recipeViewsPerMonth: number;
    favoritesLimit: number;
  };
  usage: Usage;
}

export interface ActionCheck {
  allowed: boolean;
  reason?: string;
  /** Remaining quota for limited actions; undefined when unlimited. */
  remaining?: number;
}

const EMPTY_USAGE: Usage = {
  recipeViews: 0,
  favoritesCount: 0,
  collectionsCount: 0,
  mealPlansCount: 0,
  recipesCreated: 0,
  pdfExports: 0,
  recipesShared: 0,
};

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

async function getMonthlyUsage(userId: string): Promise<Usage> {
  const [usage] = await db
    .select()
    .from(userUsage)
    .where(and(eq(userUsage.userId, userId), eq(userUsage.month, currentMonth())))
    .limit(1);

  if (!usage) {
    return { ...EMPTY_USAGE };
  }

  return {
    recipeViews: usage.recipeViews ?? 0,
    favoritesCount: usage.favoritesCount ?? 0,
    collectionsCount: usage.collectionsCount ?? 0,
    mealPlansCount: usage.mealPlansCount ?? 0,
    recipesCreated: usage.recipesCreated ?? 0,
    pdfExports: usage.pdfExports ?? 0,
    recipesShared: usage.recipesShared ?? 0,
  };
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const [features, usage] = await Promise.all([
    db.select().from(premiumFeatures).where(eq(premiumFeatures.userId, userId)),
    getMonthlyUsage(userId),
  ]);

  const now = new Date();
  const activeFeatures = features.filter(
    (feature) => !feature.expiresAt || new Date(feature.expiresAt) > now
  );

  const pdfFeature = activeFeatures.find((feature) => feature.feature === 'pdf_downloads');
  const pdfMetadata = (pdfFeature?.metadata ?? {}) as { recipeCount?: number };

  return {
    hasRecipeAccess: activeFeatures.some((feature) => feature.feature === 'recipe_access'),
    hasPdfAccess: !!pdfFeature,
    pdfRecipeLimit: pdfMetadata.recipeCount ?? 0,
    limits: {
      recipeViewsPerMonth: PRICING.freeTier.recipeViewsPerMonth,
      favoritesLimit: PRICING.freeTier.favoritesLimit,
    },
    usage,
  };
}

async function countFavorites(userId: string): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(favoriteRecipes)
    .where(eq(favoriteRecipes.userId, userId));

  return Number(count) || 0;
}

export async function canPerformAction(
  userId: string,
  action: EntitlementAction
): Promise<ActionCheck> {
  const entitlements = await getEntitlements(userId);

  switch (action) {
    case 'viewRecipe': {
      if (entitlements.hasRecipeAccess) {
        return { allowed: true };
      }
      const limit = entitlements.limits.recipeViewsPerMonth;
      const remaining = Math.max(0, limit - entitlements.usage.recipeViews);
      if (remaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          reason: `You've used all ${limit} free recipe views this month. Get lifetime access to keep cooking.`,
        };
      }
      return { allowed: true, remaining };
    }

    case 'addFavorite': {
      if (entitlements.hasRecipeAccess) {
        return { allowed: true };
      }
      const limit = entitlements.limits.favoritesLimit;
      // Favorites is a total cap, so count live rows rather than the monthly counter.
      const current = await countFavorites(userId);
      const remaining = Math.max(0, limit - current);
      if (remaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          reason: `You've saved the maximum of ${limit} favorites on the free plan. Get lifetime access for unlimited favorites.`,
        };
      }
      return { allowed: true, remaining };
    }

    case 'createCollection':
      // Collections are not limited in the current business model.
      return { allowed: true };

    case 'exportPdf': {
      if (!entitlements.hasPdfAccess) {
        return {
          allowed: false,
          reason: 'PDF downloads are a paid add-on. Purchase a recipe bundle to export PDFs.',
        };
      }
      return { allowed: true, remaining: entitlements.pdfRecipeLimit };
    }
  }
}

/**
 * Route helper: returns a 402 response when the action is blocked, null when allowed.
 * Usage: const blocked = await enforceLimit(userId, 'addFavorite'); if (blocked) return blocked;
 */
export async function enforceLimit(
  userId: string,
  action: EntitlementAction
): Promise<NextResponse | null> {
  const check = await canPerformAction(userId, action);

  if (check.allowed) {
    return null;
  }

  return NextResponse.json(
    {
      error: 'Upgrade required',
      reason: check.reason,
      upgradeUrl: '/pricing',
    },
    { status: 402 }
  );
}

export async function incrementUsage(
  userId: string,
  field: UsageField,
  amount: number = 1
): Promise<void> {
  const month = currentMonth();

  const [existing] = await db
    .select()
    .from(userUsage)
    .where(and(eq(userUsage.userId, userId), eq(userUsage.month, month)))
    .limit(1);

  if (existing) {
    await db
      .update(userUsage)
      .set({
        [field]: (existing[field] ?? 0) + amount,
        updatedAt: new Date(),
      })
      .where(and(eq(userUsage.userId, userId), eq(userUsage.month, month)));
  } else {
    await db.insert(userUsage).values({
      id: crypto.randomUUID(),
      userId,
      month,
      ...EMPTY_USAGE,
      [field]: amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
