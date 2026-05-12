import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { mealPlans, mealPlanItems } from '@/src/db/schemas';
import { and, desc, eq, sql } from 'drizzle-orm';
import { incrementUsage as incrementUsageWithUser } from '@/src/utils/subscription';

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

const CreateMealPlanSchema = z.object({
  name: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  weekStartDate: z.string().min(1),
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

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    const status = statusParam ? MealPlanStatusSchema.parse(statusParam) : undefined;

    const query = db
      .select({
        id: mealPlans.id,
        userId: mealPlans.userId,
        name: mealPlans.name,
        description: mealPlans.description,
        weekStartDate: mealPlans.weekStartDate,
        status: mealPlans.status,
        isTemplate: mealPlans.isTemplate,
        servings: mealPlans.servings,
        dietaryPreferences: mealPlans.dietaryPreferences,
        budget: mealPlans.budget,
        metadata: mealPlans.metadata,
        createdAt: mealPlans.createdAt,
        updatedAt: mealPlans.updatedAt,
        itemsCount: sql<number>`count(${mealPlanItems.id})`,
        completedCount: sql<number>`coalesce(sum(case when ${mealPlanItems.isCompleted} then 1 else 0 end), 0)`,
      })
      .from(mealPlans)
      .leftJoin(mealPlanItems, eq(mealPlans.id, mealPlanItems.mealPlanId))
      .where(
        status
          ? and(eq(mealPlans.userId, session.user.id), eq(mealPlans.status, status))
          : eq(mealPlans.userId, session.user.id)
      )
      .groupBy(mealPlans.id)
      .orderBy(desc(mealPlans.weekStartDate));

    const results = await query;

    const normalized = results.map((plan) => ({
      ...plan,
      itemsCount: Number(plan.itemsCount || 0),
      completedCount: Number(plan.completedCount || 0),
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }

    console.error('Error fetching meal plans:', error);
    return NextResponse.json({ error: 'Failed to fetch meal plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = CreateMealPlanSchema.parse(body);

    const parsedDate = new Date(data.weekStartDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid week start date' }, { status: 400 });
    }

    const weekStartDate = normalizeWeekStart(parsedDate);

    const defaultName = `Week of ${weekStartDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;

    const [plan] = await db
      .insert(mealPlans)
      .values({
        userId: session.user.id,
        name: data.name?.trim() || defaultName,
        description: data.description?.trim() || null,
        weekStartDate,
        status: data.status || 'active',
        isTemplate: data.isTemplate || false,
        servings: data.servings,
        dietaryPreferences: data.dietaryPreferences,
        budget: data.budget !== undefined && data.budget !== null ? String(data.budget) : null,
      })
      .returning();

    await incrementUsageWithUser(session.user.id, 'mealPlansCount');

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }

    console.error('Error creating meal plan:', error);
    return NextResponse.json({ error: 'Failed to create meal plan' }, { status: 500 });
  }
}
