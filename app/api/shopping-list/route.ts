import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/src/db';
import { shoppingLists, shoppingListItems } from '@/src/db/schemas/premium-features.schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

const CreateShoppingListSchema = z.object({
  name: z.string().trim().min(1).max(200).default('My Shopping List'),
  mealPlanId: z.string().trim().min(1).optional().nullable(),
});

// GET - Fetch all shopping lists for the current user
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lists = await db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.userId, session.user.id))
      .orderBy(desc(shoppingLists.createdAt));

    const listIds = lists.map((list) => list.id);
    const items =
      listIds.length > 0
        ? await db
            .select()
            .from(shoppingListItems)
            .where(inArray(shoppingListItems.shoppingListId, listIds))
            .orderBy(shoppingListItems.sortOrder)
        : [];

    const itemsByList = new Map<string, typeof items>();
    for (const item of items) {
      const group = itemsByList.get(item.shoppingListId);
      if (group) {
        group.push(item);
      } else {
        itemsByList.set(item.shoppingListId, [item]);
      }
    }

    const listsWithItems = lists.map((list) => ({
      ...list,
      items: itemsByList.get(list.id) ?? [],
    }));

    return NextResponse.json(listsWithItems);
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return NextResponse.json({ error: 'Failed to fetch shopping lists' }, { status: 500 });
  }
}

// POST - Create a new shopping list
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, mealPlanId } = CreateShoppingListSchema.parse(body);

    // Check for duplicate list names
    const existingLists = await db
      .select()
      .from(shoppingLists)
      .where(and(eq(shoppingLists.userId, session.user.id), eq(shoppingLists.name, name)));

    if (existingLists.length > 0) {
      return NextResponse.json(
        {
          error: `A shopping list named "${name}" already exists. Please choose a different name.`,
        },
        { status: 400 }
      );
    }

    const [newList] = await db
      .insert(shoppingLists)
      .values({
        userId: session.user.id,
        name,
        mealPlanId: mealPlanId || null,
        status: 'active',
      })
      .returning();

    return NextResponse.json(newList, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating shopping list:', error);
    return NextResponse.json({ error: 'Failed to create shopping list' }, { status: 500 });
  }
}
