import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { shoppingLists, shoppingListItems } from '@/src/db/schemas/premium-features.schema';
import { recipes } from '@/src/db/schemas';
import { eq, and } from 'drizzle-orm';

// Type definitions
interface Ingredient {
  name?: string;
  ingredient?: string;
  quantity?: number | string;
  unit?: string | null;
}

interface ManualItem {
  name: string;
  quantity?: number | string;
  unit?: string | null;
  category?: string | null;
  recipeIds?: number[] | null;
  sortOrder?: number;
}

interface ShoppingListItemInsert {
  shoppingListId: string;
  name: string;
  quantity: string;
  unit: string | null;
  category?: string | null;
  recipeIds?: number[] | null;
  sortOrder: number;
  isCompleted: boolean;
}

// POST - Add items to a shopping list (from a recipe or manual)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: listId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the shopping list belongs to the user
    const [list] = await db
      .select()
      .from(shoppingLists)
      .where(and(eq(shoppingLists.id, listId), eq(shoppingLists.userId, session.user.id)))
      .limit(1);

    if (!list) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    }

    const body = await request.json();
    const { recipeId, items: manualItems } = body;

    let itemsToAdd: ShoppingListItemInsert[] = [];

    if (recipeId) {
      // Check if this recipe has already been added to this list
      const existingItems = await db
        .select()
        .from(shoppingListItems)
        .where(eq(shoppingListItems.shoppingListId, listId));

      const recipeAlreadyAdded = existingItems.some((item) => {
        if (!item.recipeIds) return false;
        const ids = Array.isArray(item.recipeIds) ? item.recipeIds : [];
        return ids.includes(recipeId);
      });

      if (recipeAlreadyAdded) {
        return NextResponse.json(
          { error: 'This recipe has already been added to this shopping list' },
          { status: 400 }
        );
      }

      // Fetch recipe and add its ingredients
      const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);

      if (!recipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
      }

      // Parse ingredients and prepare items
      const ingredients =
        typeof recipe.ingredients === 'string'
          ? JSON.parse(recipe.ingredients)
          : recipe.ingredients;

      if (Array.isArray(ingredients)) {
        itemsToAdd = ingredients.map(
          (ingredient: Ingredient | string, index: number): ShoppingListItemInsert => {
            if (typeof ingredient === 'string') {
              // Simple string ingredient
              return {
                shoppingListId: listId,
                name: ingredient,
                quantity: '1',
                unit: null,
                recipeIds: [recipeId],
                sortOrder: index,
                isCompleted: false,
              };
            } else {
              // Structured ingredient object
              return {
                shoppingListId: listId,
                name: ingredient.name || ingredient.ingredient || 'Unknown',
                quantity: String(ingredient.quantity || 1),
                unit: ingredient.unit || null,
                recipeIds: [recipeId],
                sortOrder: index,
                isCompleted: false,
              };
            }
          }
        );
      }
    } else if (manualItems && Array.isArray(manualItems)) {
      // Add manual items
      itemsToAdd = manualItems.map(
        (item: ManualItem, index: number): ShoppingListItemInsert => ({
          shoppingListId: listId,
          name: item.name,
          quantity: String(item.quantity || 1),
          unit: item.unit || null,
          category: item.category || null,
          recipeIds: item.recipeIds || null,
          sortOrder: item.sortOrder ?? index,
          isCompleted: false,
        })
      );
    }

    if (itemsToAdd.length === 0) {
      return NextResponse.json({ error: 'No items to add' }, { status: 400 });
    }

    // Insert items
    const newItems = await db.insert(shoppingListItems).values(itemsToAdd).returning();

    // Update list metadata
    const currentMetadata = list.metadata as Record<string, unknown> | null;
    const currentTotalItems = (currentMetadata?.totalItems as number) || 0;

    await db
      .update(shoppingLists)
      .set({
        updatedAt: new Date(),
        metadata: {
          ...currentMetadata,
          totalItems: currentTotalItems + newItems.length,
        },
      })
      .where(eq(shoppingLists.id, listId));

    return NextResponse.json({ items: newItems, count: newItems.length }, { status: 201 });
  } catch (error) {
    console.error('Error adding items to shopping list:', error);
    return NextResponse.json({ error: 'Failed to add items' }, { status: 500 });
  }
}
