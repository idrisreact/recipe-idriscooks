import { NextResponse } from 'next/server';
import { PRICING, getRecipeAccessPrice } from '@/src/config/pricing';

export async function GET() {
  const recipeAccess = getRecipeAccessPrice();

  return NextResponse.json({
    freeTier: {
      name: 'Free',
      price: 0,
      limits: PRICING.freeTier,
    },
    recipeAccess: {
      name: 'Lifetime Access',
      ...recipeAccess,
      isLaunchSpecial: PRICING.recipeAccess.isLaunchSpecial,
      regular: PRICING.recipeAccess.regular,
    },
    pdfDownloads: PRICING.pdfDownloads,
  });
}
