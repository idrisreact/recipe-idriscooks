import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { shoppingLists, shoppingListItems } from '@/src/db/schemas/premium-features.schema';
import { eq, and } from 'drizzle-orm';

// DELETE - Delete a shopping list
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the shopping list (cascade will delete items)
    await db
      .delete(shoppingLists)
      .where(and(eq(shoppingLists.id, id), eq(shoppingLists.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return NextResponse.json({ error: 'Failed to delete shopping list' }, { status: 500 });
  }
}

// PATCH - Update shopping list (e.g., clear completed items, change name)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, name, status } = body;

    if (action === 'clearCompleted') {
      // Delete all completed items
      await db
        .delete(shoppingListItems)
        .where(
          and(eq(shoppingListItems.shoppingListId, id), eq(shoppingListItems.isCompleted, true))
        );

      return NextResponse.json({ success: true });
    }

    // Update list properties
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(shoppingLists)
      .set(updateData)
      .where(and(eq(shoppingLists.id, id), eq(shoppingLists.userId, session.user.id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return NextResponse.json({ error: 'Failed to update shopping list' }, { status: 500 });
  }
}
