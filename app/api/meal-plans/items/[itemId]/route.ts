import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { mealPlanItems, mealPlans } from '@/src/db/schemas';
import { and, eq } from 'drizzle-orm';

const UpdateMealPlanItemSchema = z.object({
  isCompleted: z.boolean().optional(),
  notes: z.string().trim().max(500).optional().nullable(),
  servings: z.number().int().positive().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = UpdateMealPlanItemSchema.parse(body);

    const [item] = await db
      .select({ id: mealPlanItems.id, mealPlanId: mealPlanItems.mealPlanId })
      .from(mealPlanItems)
      .innerJoin(mealPlans, eq(mealPlans.id, mealPlanItems.mealPlanId))
      .where(and(eq(mealPlanItems.id, itemId), eq(mealPlans.userId, session.user.id)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: 'Meal plan item not found' }, { status: 404 });
    }

    const updates: Partial<typeof mealPlanItems.$inferInsert> = {};

    if (typeof data.isCompleted === 'boolean') {
      updates.isCompleted = data.isCompleted;
      updates.completedAt = data.isCompleted ? new Date() : null;
    }

    if (typeof data.notes === 'string') {
      updates.notes = data.notes.trim();
    } else if (data.notes === null) {
      updates.notes = null;
    }

    if (typeof data.servings === 'number') {
      updates.servings = data.servings;
    }

    const [updated] = await db
      .update(mealPlanItems)
      .set(updates)
      .where(eq(mealPlanItems.id, itemId))
      .returning();

    await db.update(mealPlans).set({ updatedAt: new Date() }).where(eq(mealPlans.id, item.mealPlanId));

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }

    console.error('Error updating meal plan item:', error);
    return NextResponse.json({ error: 'Failed to update meal plan item' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [item] = await db
      .select({ id: mealPlanItems.id, mealPlanId: mealPlanItems.mealPlanId })
      .from(mealPlanItems)
      .innerJoin(mealPlans, eq(mealPlans.id, mealPlanItems.mealPlanId))
      .where(and(eq(mealPlanItems.id, itemId), eq(mealPlans.userId, session.user.id)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: 'Meal plan item not found' }, { status: 404 });
    }

    await db.delete(mealPlanItems).where(eq(mealPlanItems.id, itemId));

    await db.update(mealPlans).set({ updatedAt: new Date() }).where(eq(mealPlans.id, item.mealPlanId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal plan item:', error);
    return NextResponse.json({ error: 'Failed to delete meal plan item' }, { status: 500 });
  }
}
