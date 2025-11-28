import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { shoppingListItems, shoppingLists } from '@/src/db/schemas/premium-features.schema';
import { eq, and } from 'drizzle-orm';

// PATCH - Toggle item completed status or update item
export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isCompleted, name, quantity, unit, category, isPriority, notes } = body;

    // First, verify the item belongs to a list owned by the user
    const [item] = await db
      .select({
        item: shoppingListItems,
        list: shoppingLists,
      })
      .from(shoppingListItems)
      .innerJoin(shoppingLists, eq(shoppingListItems.shoppingListId, shoppingLists.id))
      .where(and(eq(shoppingListItems.id, itemId), eq(shoppingLists.userId, session.user.id)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = isCompleted ? new Date() : null;
    }
    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = String(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (category !== undefined) updateData.category = category;
    if (isPriority !== undefined) updateData.isPriority = isPriority;
    if (notes !== undefined) updateData.notes = notes;

    const [updated] = await db
      .update(shoppingListItems)
      .set(updateData)
      .where(eq(shoppingListItems.id, itemId))
      .returning();

    // Update parent list's updatedAt timestamp
    await db
      .update(shoppingLists)
      .set({ updatedAt: new Date() })
      .where(eq(shoppingLists.id, item.item.shoppingListId));

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE - Remove an item from the shopping list
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the item belongs to a list owned by the user
    const [item] = await db
      .select({
        item: shoppingListItems,
        list: shoppingLists,
      })
      .from(shoppingListItems)
      .innerJoin(shoppingLists, eq(shoppingListItems.shoppingListId, shoppingLists.id))
      .where(and(eq(shoppingListItems.id, itemId), eq(shoppingLists.userId, session.user.id)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await db.delete(shoppingListItems).where(eq(shoppingListItems.id, itemId));

    // Update parent list's updatedAt timestamp
    await db
      .update(shoppingLists)
      .set({ updatedAt: new Date() })
      .where(eq(shoppingLists.id, item.item.shoppingListId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
