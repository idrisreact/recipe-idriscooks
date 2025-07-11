import { Recipe } from './recipes.types';

export interface FavoriteRecipe {
  id: number;
  userId: string;
  recipeId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteRecipeWithRecipe extends FavoriteRecipe {
  recipe: Recipe;
}

export interface FavoriteRecipesResponse {
  data: FavoriteRecipeWithRecipe[];
  count: number;
}

export interface AddToFavoritesRequest {
  recipeId: number;
}

export interface RemoveFromFavoritesRequest {
  recipeId: number;
} 