import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { recipes } from '@/src/db/schemas';
import { eq } from 'drizzle-orm';
import { auth } from '@/src/utils/auth';
import { canPerformAction } from '@/src/lib/entitlements';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id);

    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Mirror the page paywall: only entitled users (or free users within their
    // monthly view limit) get the full ingredients/steps through the API.
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    const check = userId
      ? await canPerformAction(userId, 'viewRecipe')
      : { allowed: false as const };

    if (!check.allowed) {
      return NextResponse.json({
        ...recipe,
        ingredients: null,
        steps: null,
        restricted: true,
      });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
