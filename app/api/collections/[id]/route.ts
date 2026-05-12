import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/src/db';
import { recipeCollections, recipeCollectionItems, recipes } from '@/src/db/schemas';
import { and, desc, eq } from 'drizzle-orm';
import { Ingredient } from '@/src/types/recipes.types';

const UpdateCollectionSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9A-Fa-f]{6})$/)
    .optional()
    .nullable(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).optional().nullable(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [collection] = await db
      .select()
      .from(recipeCollections)
      .where(and(eq(recipeCollections.id, id), eq(recipeCollections.userId, session.user.id)))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const items = await db
      .select({
        id: recipeCollectionItems.id,
        collectionId: recipeCollectionItems.collectionId,
        recipeId: recipeCollectionItems.recipeId,
        addedAt: recipeCollectionItems.addedAt,
        notes: recipeCollectionItems.notes,
        sortOrder: recipeCollectionItems.sortOrder,
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
      .from(recipeCollectionItems)
      .innerJoin(recipes, eq(recipeCollectionItems.recipeId, recipes.id))
      .where(eq(recipeCollectionItems.collectionId, id))
      .orderBy(desc(recipeCollectionItems.addedAt));

    const normalizedItems = items.map((item) => ({
      ...item,
      recipe: {
        ...item.recipe,
        ingredients: item.recipe.ingredients as unknown as Ingredient[],
        steps: (item.recipe.steps as string[]) || [],
        tags: (item.recipe.tags as string[]) || [],
      },
    }));

    return NextResponse.json({
      collection: {
        ...collection,
        recipeCount: normalizedItems.length,
      },
      items: normalizedItems,
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
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
    const data = UpdateCollectionSchema.parse(body);

    const [collection] = await db
      .select()
      .from(recipeCollections)
      .where(and(eq(recipeCollections.id, id), eq(recipeCollections.userId, session.user.id)))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (data.name && data.name.trim() !== collection.name) {
      const existing = await db
        .select({ id: recipeCollections.id })
        .from(recipeCollections)
        .where(
          and(
            eq(recipeCollections.userId, session.user.id),
            eq(recipeCollections.name, data.name.trim())
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: `A collection named "${data.name.trim()}" already exists.` },
          { status: 400 }
        );
      }
    }

    const updates: Partial<typeof recipeCollections.$inferInsert> = {
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

    if (typeof data.color === 'string') {
      updates.color = data.color.trim();
    }

    if (typeof data.isPublic === 'boolean') {
      updates.isPublic = data.isPublic;
    }

    if (Array.isArray(data.tags)) {
      updates.tags = data.tags;
    } else if (data.tags === null) {
      updates.tags = null;
    }

    const [updated] = await db
      .update(recipeCollections)
      .set(updates)
      .where(and(eq(recipeCollections.id, id), eq(recipeCollections.userId, session.user.id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating collection:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    await db
      .delete(recipeCollections)
      .where(and(eq(recipeCollections.id, id), eq(recipeCollections.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
