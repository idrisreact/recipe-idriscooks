import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/src/db';
import { recipeCollections, recipeCollectionItems } from '@/src/db/schemas';
import { and, desc, eq, sql } from 'drizzle-orm';
import { canPerformAction, incrementUsage } from '@/src/lib/entitlements';

const CreateCollectionSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9A-Fa-f]{6})$/)
    .optional()
    .nullable(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).optional(),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = await db
      .select({
        id: recipeCollections.id,
        userId: recipeCollections.userId,
        name: recipeCollections.name,
        description: recipeCollections.description,
        color: recipeCollections.color,
        isPublic: recipeCollections.isPublic,
        isDefault: recipeCollections.isDefault,
        tags: recipeCollections.tags,
        metadata: recipeCollections.metadata,
        createdAt: recipeCollections.createdAt,
        updatedAt: recipeCollections.updatedAt,
        recipeCount: sql<number>`count(${recipeCollectionItems.id})`,
      })
      .from(recipeCollections)
      .leftJoin(recipeCollectionItems, eq(recipeCollections.id, recipeCollectionItems.collectionId))
      .where(eq(recipeCollections.userId, session.user.id))
      .groupBy(recipeCollections.id)
      .orderBy(desc(recipeCollections.createdAt));

    const normalized = collections.map((collection) => ({
      ...collection,
      recipeCount: Number(collection.recipeCount || 0),
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = CreateCollectionSchema.parse(body);

    const permission = await canPerformAction(session.user.id, 'createCollection');
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.reason || 'Collection limit reached' },
        { status: 403 }
      );
    }

    const name = data.name.trim();

    const existing = await db
      .select({ id: recipeCollections.id })
      .from(recipeCollections)
      .where(and(eq(recipeCollections.userId, session.user.id), eq(recipeCollections.name, name)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `A collection named "${name}" already exists.` },
        { status: 400 }
      );
    }

    const values: typeof recipeCollections.$inferInsert = {
      userId: session.user.id,
      name,
    };

    const description = data.description?.trim();
    if (description) {
      values.description = description;
    }

    const color = data.color?.trim();
    if (color) {
      values.color = color;
    }

    if (typeof data.isPublic === 'boolean') {
      values.isPublic = data.isPublic;
    }

    if (data.tags && data.tags.length > 0) {
      values.tags = data.tags;
    }

    const [collection] = await db.insert(recipeCollections).values(values).returning();

    await incrementUsage(session.user.id, 'collectionsCount');

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
