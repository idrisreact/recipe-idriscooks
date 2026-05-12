import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { mealPlans, mealPlanItems, recipes } from '@/src/db/schemas';
import { and, eq, sql } from 'drizzle-orm';

const MealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

const CreateMealPlanItemSchema = z.object({
  recipeId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: MealTypeSchema,
  servings: z.number().int().positive().optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [plan] = await db
      .select({ id: mealPlans.id, servings: mealPlans.servings })
      .from(mealPlans)
      .where(and(eq(mealPlans.id, id), eq(mealPlans.userId, session.user.id)))
      .limit(1);

    if (!plan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = CreateMealPlanItemSchema.parse(body);

    const [recipe] = await db
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.id, data.recipeId))
      .limit(1);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const existingSlot = await db
      .select({ id: mealPlanItems.id })
      .from(mealPlanItems)
      .where(
        and(
          eq(mealPlanItems.mealPlanId, id),
          eq(mealPlanItems.dayOfWeek, data.dayOfWeek),
          eq(mealPlanItems.mealType, data.mealType)
        )
      )
      .limit(1);

    if (existingSlot.length > 0) {
      return NextResponse.json(
        { error: 'This slot already has a recipe. Remove it before adding a new one.' },
        { status: 400 }
      );
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(mealPlanItems)
      .where(eq(mealPlanItems.mealPlanId, id));

    const [item] = await db
      .insert(mealPlanItems)
      .values({
        mealPlanId: id,
        recipeId: data.recipeId,
        dayOfWeek: data.dayOfWeek,
        mealType: data.mealType,
        servings: data.servings ?? plan.servings ?? 1,
        notes: data.notes?.trim() || null,
        sortOrder: Number(count) || 0,
      })
      .returning();

    await db
      .update(mealPlans)
      .set({ updatedAt: new Date() })
      .where(eq(mealPlans.id, id));

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }

    console.error('Error adding meal plan item:', error);
    return NextResponse.json({ error: 'Failed to add meal plan item' }, { status: 500 });
  }
}
