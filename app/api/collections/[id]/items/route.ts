import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { recipeCollections, recipeCollectionItems, recipes } from '@/src/db/schemas';
import { and, eq, sql } from 'drizzle-orm';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [collection] = await db
      .select({ id: recipeCollections.id })
      .from(recipeCollections)
      .where(and(eq(recipeCollections.id, id), eq(recipeCollections.userId, session.user.id)))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const body = await request.json();
    const { recipeId, notes } = body as { recipeId?: number; notes?: string };

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    const existingItem = await db
      .select({ id: recipeCollectionItems.id })
      .from(recipeCollectionItems)
      .where(and(eq(recipeCollectionItems.collectionId, id), eq(recipeCollectionItems.recipeId, recipeId)))
      .limit(1);

    if (existingItem.length > 0) {
      return NextResponse.json(
        { error: 'This recipe is already in the collection' },
        { status: 400 }
      );
    }

    const [recipe] = await db.select({ id: recipes.id }).from(recipes).where(eq(recipes.id, recipeId)).limit(1);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(recipeCollectionItems)
      .where(eq(recipeCollectionItems.collectionId, id));

    const sortOrder = Number(count) || 0;

    const [item] = await db
      .insert(recipeCollectionItems)
      .values({
        collectionId: id,
        recipeId,
        notes: notes?.trim() || null,
        sortOrder,
      })
      .returning();

    await db
      .update(recipeCollections)
      .set({ updatedAt: new Date() })
      .where(eq(recipeCollections.id, id));

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding recipe to collection:', error);
    return NextResponse.json({ error: 'Failed to add recipe to collection' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [collection] = await db
      .select({ id: recipeCollections.id })
      .from(recipeCollections)
      .where(and(eq(recipeCollections.id, id), eq(recipeCollections.userId, session.user.id)))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const body = await request.json();
    const { recipeId } = body as { recipeId?: number };

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(recipeCollectionItems)
      .where(and(eq(recipeCollectionItems.collectionId, id), eq(recipeCollectionItems.recipeId, recipeId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Recipe not found in collection' }, { status: 404 });
    }

    await db
      .update(recipeCollections)
      .set({ updatedAt: new Date() })
      .where(eq(recipeCollections.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing recipe from collection:', error);
    return NextResponse.json({ error: 'Failed to remove recipe from collection' }, { status: 500 });
  }
}
