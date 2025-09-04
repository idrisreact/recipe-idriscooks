import { loadStripe } from '@stripe/stripe-js';

let stripePromise: ReturnType<typeof loadStripe>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export const PRICE_CONFIG = {
  tiers: [
    { maxRecipes: 5, price: 2.99, priceInCents: 299 },
    { maxRecipes: 10, price: 4.99, priceInCents: 499 },
    { maxRecipes: 20, price: 7.99, priceInCents: 799 },
    { maxRecipes: Infinity, price: 9.99, priceInCents: 999 },
  ],

  getPriceForRecipeCount: (count: number) => {
    const tier = PRICE_CONFIG.tiers.find((t) => count <= t.maxRecipes);
    return tier ? tier.priceInCents : 999;
  },

  getDisplayPriceForRecipeCount: (count: number) => {
    const tier = PRICE_CONFIG.tiers.find((t) => count <= t.maxRecipes);
    return tier ? tier.price.toFixed(2) : '9.99';
  },
};
