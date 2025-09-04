import { db } from '../db';
import { favoriteRecipes, recipes } from '../db/schemas';
import { eq, and } from 'drizzle-orm';
import { FavoriteRecipe, FavoriteRecipeWithRecipe, Ingredient } from '../types';

export async function addToFavorites(userId: string, recipeId: number): Promise<FavoriteRecipe> {
  const [favorite] = await db
    .insert(favoriteRecipes)
    .values({
      userId,
      recipeId,
    })
    .returning();

  return favorite;
}

export async function removeFromFavorites(userId: string, recipeId: number): Promise<void> {
  await db
    .delete(favoriteRecipes)
    .where(and(eq(favoriteRecipes.userId, userId), eq(favoriteRecipes.recipeId, recipeId)));
}

export async function getUserFavorites(userId: string): Promise<FavoriteRecipeWithRecipe[]> {
  const favorites = await db
    .select({
      id: favoriteRecipes.id,
      userId: favoriteRecipes.userId,
      recipeId: favoriteRecipes.recipeId,
      createdAt: favoriteRecipes.createdAt,
      updatedAt: favoriteRecipes.updatedAt,
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
    .from(favoriteRecipes)
    .innerJoin(recipes, eq(favoriteRecipes.recipeId, recipes.id))
    .where(eq(favoriteRecipes.userId, userId));

  return favorites.map((favorite) => ({
    ...favorite,
    recipe: {
      ...favorite.recipe,
      ingredients: favorite.recipe.ingredients as unknown as Ingredient[],
      steps: (favorite.recipe.steps as string[]) || [],
      tags: (favorite.recipe.tags as string[]) || [],
    },
  }));
}

export async function isRecipeFavorited(userId: string, recipeId: number): Promise<boolean> {
  const [favorite] = await db
    .select()
    .from(favoriteRecipes)
    .where(and(eq(favoriteRecipes.userId, userId), eq(favoriteRecipes.recipeId, recipeId)))
    .limit(1);

  return !!favorite;
}
