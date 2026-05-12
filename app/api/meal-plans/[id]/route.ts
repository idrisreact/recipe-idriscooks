import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { mealPlans, mealPlanItems, recipes } from '@/src/db/schemas';
import { and, asc, eq } from 'drizzle-orm';
import { Ingredient } from '@/src/types/recipes.types';

const MealPlanStatusSchema = z.enum(['active', 'archived', 'template']);

const DietaryPreferencesSchema = z
  .object({
    vegetarian: z.boolean().optional(),
    vegan: z.boolean().optional(),
    glutenFree: z.boolean().optional(),
    dairyFree: z.boolean().optional(),
    lowCarb: z.boolean().optional(),
    keto: z.boolean().optional(),
    paleo: z.boolean().optional(),
    allergies: z.array(z.string().trim().min(1)).optional(),
  })
  .optional();

const UpdateMealPlanSchema = z.object({
  name: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  weekStartDate: z.string().min(1).optional(),
  status: MealPlanStatusSchema.optional(),
  isTemplate: z.boolean().optional(),
  servings: z.number().int().positive().optional(),
  dietaryPreferences: DietaryPreferencesSchema,
  budget: z.union([z.number(), z.string()]).optional().nullable(),
});

function normalizeWeekStart(date: Date) {
  const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = normalized.getUTCDay();
  normalized.setUTCDate(normalized.getUTCDate() - day);
  return normalized;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [plan] = await db
      .select()
      .from(mealPlans)
      .where(and(eq(mealPlans.id, id), eq(mealPlans.userId, session.user.id)))
      .limit(1);

    if (!plan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    const items = await db
      .select({
        id: mealPlanItems.id,
        mealPlanId: mealPlanItems.mealPlanId,
        recipeId: mealPlanItems.recipeId,
        dayOfWeek: mealPlanItems.dayOfWeek,
        mealType: mealPlanItems.mealType,
        servings: mealPlanItems.servings,
        notes: mealPlanItems.notes,
        isCompleted: mealPlanItems.isCompleted,
        completedAt: mealPlanItems.completedAt,
        sortOrder: mealPlanItems.sortOrder,
        createdAt: mealPlanItems.createdAt,
        recipe: {
          id: recipes.id,
          title: recipes.title,
          description: recipes.description,
          imageUrl: recipes.imageUrl,
          servings: recipes.servings,
          prepTime: recipes.prepTime,
          cookTime: recipes.cookTime,
          ingredients: recipes.ingredients,
          steps: recipes.steps,
          tags: recipes.tags,
        },
      })
      .from(mealPlanItems)
      .innerJoin(recipes, eq(mealPlanItems.recipeId, recipes.id))
      .where(eq(mealPlanItems.mealPlanId, id))
      .orderBy(asc(mealPlanItems.dayOfWeek), asc(mealPlanItems.mealType));

    const normalizedItems = items.map((item) => ({
      ...item,
      recipe: {
        ...item.recipe,
        ingredients: item.recipe.ingredients as unknown as Ingredient[],
        steps: (item.recipe.steps as string[]) || [],
        tags: (item.recipe.tags as string[]) || [],
      },
    }));

    return NextResponse.json({ plan, items: normalizedItems });
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    return NextResponse.json({ error: 'Failed to fetch meal plan' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = UpdateMealPlanSchema.parse(body);

    const [plan] = await db
      .select({ id: mealPlans.id })
      .from(mealPlans)
      .where(and(eq(mealPlans.id, id), eq(mealPlans.userId, session.user.id)))
      .limit(1);

    if (!plan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    const updates: Partial<typeof mealPlans.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof data.name === 'string') {
      updates.name = data.name.trim();
    }

    if (typeof data.description === 'string') {
      updates.description = data.description.trim();
    } else if (data.description === null) {
      updates.description = null;
    }

    if (typeof data.weekStartDate === 'string') {
      const parsedDate = new Date(data.weekStartDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid week start date' }, { status: 400 });
      }
      updates.weekStartDate = normalizeWeekStart(parsedDate);
    }

    if (typeof data.status === 'string') {
      updates.status = data.status;
    }

    if (typeof data.isTemplate === 'boolean') {
      updates.isTemplate = data.isTemplate;
    }

    if (typeof data.servings === 'number') {
      updates.servings = data.servings;
    }

    if (data.dietaryPreferences !== undefined) {
      updates.dietaryPreferences = data.dietaryPreferences;
    }

    if (data.budget !== undefined) {
      updates.budget = data.budget !== null ? String(data.budget) : null;
    }

    const [updated] = await db
      .update(mealPlans)
      .set(updates)
      .where(and(eq(mealPlans.id, id), eq(mealPlans.userId, session.user.id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }

    console.error('Error updating meal plan:', error);
    return NextResponse.json({ error: 'Failed to update meal plan' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [plan] = await db
      .select({ id: mealPlans.id })
      .from(mealPlans)
      .where(and(eq(mealPlans.id, id), eq(mealPlans.userId, session.user.id)))
      .limit(1);

    if (!plan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    await db.delete(mealPlans).where(and(eq(mealPlans.id, id), eq(mealPlans.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json({ error: 'Failed to delete meal plan' }, { status: 500 });
  }
}
