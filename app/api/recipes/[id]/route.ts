import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { recipes } from '@/src/db/schemas';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id);

    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const recipe = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);

    if (recipe.length === 0) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe[0]);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
