import { db } from '../db';
import { premiumFeatures } from '../db/schemas/premium-features.schema';
import { eq, and } from 'drizzle-orm';

export async function checkRecipeAccess(userId: string): Promise<boolean> {
  try {
    const [feature] = await db
      .select()
      .from(premiumFeatures)
      .where(and(eq(premiumFeatures.userId, userId), eq(premiumFeatures.feature, 'recipe_access')))
      .limit(1);

    return !!feature;
  } catch (error) {
    console.error('Error checking recipe access:', error);
    return false;
  }
}
