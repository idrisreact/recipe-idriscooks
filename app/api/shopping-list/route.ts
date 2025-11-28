import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { shoppingLists, shoppingListItems } from '@/src/db/schemas/premium-features.schema';
import { eq, and, desc } from 'drizzle-orm';

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

    // For each list, get its items
    const listsWithItems = await Promise.all(
      lists.map(async (list) => {
        const items = await db
          .select()
          .from(shoppingListItems)
          .where(eq(shoppingListItems.shoppingListId, list.id))
          .orderBy(shoppingListItems.sortOrder);

        return {
          ...list,
          items,
        };
      })
    );

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
    const { name = 'My Shopping List', mealPlanId } = body;

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
    console.error('Error creating shopping list:', error);
    return NextResponse.json({ error: 'Failed to create shopping list' }, { status: 500 });
  }
}
