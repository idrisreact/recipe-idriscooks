/**
 * Pricing Configuration
 * Centralized pricing for easy updates
 */

export const PRICING = {
  // Recipe Access - Lifetime
  recipeAccess: {
    current: {
      amount: 1000, // £10.00 in pence
      display: '£10',
      label: 'Early Bird Special',
      badge: '🎉 Limited Time',
    },
    regular: {
      amount: 2500, // £25.00 in pence
      display: '£25',
      label: 'Regular Price',
    },
    isLaunchSpecial: true, // Set to false to switch to regular pricing
  },

  // PDF Downloads (per recipe bundle)
  pdfDownloads: {
    tier1: { recipes: 5, amount: 299, display: '£2.99' },
    tier2: { recipes: 10, amount: 499, display: '£4.99' },
    tier3: { recipes: 20, amount: 799, display: '£7.99' },
    tier4: { recipes: 30, amount: 999, display: '£9.99' },
  },

  // Free Tier Limits
  freeTier: {
    recipeViewsPerMonth: 3,
    favoritesLimit: 5,
  },
} as const;

// Helper to get current recipe access pricing
export function getRecipeAccessPrice() {
  const { recipeAccess } = PRICING;
  return recipeAccess.isLaunchSpecial ? recipeAccess.current : recipeAccess.regular;
}

// Helper to get savings amount
export function getSavingsAmount() {
  const { recipeAccess } = PRICING;
  return recipeAccess.regular.amount - recipeAccess.current.amount; // In pence
}

// Helper to get savings display
export function getSavingsDisplay() {
  const savings = getSavingsAmount() / 100;
  return `£${savings}`;
}
