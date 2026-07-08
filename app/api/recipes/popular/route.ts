import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { recipes, favoriteRecipes } from '@/src/db/schemas';
import { desc, eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const favoriteCount = sql<number>`count(${favoriteRecipes.id})`;

    const popular = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        description: recipes.description,
        imageUrl: recipes.imageUrl,
        servings: recipes.servings,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        tags: recipes.tags,
        favoriteCount,
      })
      .from(recipes)
      .leftJoin(favoriteRecipes, eq(recipes.id, favoriteRecipes.recipeId))
      .groupBy(recipes.id)
      .orderBy(desc(favoriteCount))
      .limit(4);

    const normalized = popular.map((recipe) => ({
      ...recipe,
      favoriteCount: Number(recipe.favoriteCount || 0),
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching popular recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
