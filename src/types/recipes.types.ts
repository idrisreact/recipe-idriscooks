export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  author?: {
    name: string;
    image?: string;
  };
}

export interface RecipesData {
  recipes: Recipe[];
}

export type ByTagIndex = Record<
  string,
  {
    id: number;
    title: string;
  }[]
>;

export type RecipeResponse = {
  data: Recipe[];
  count: number;
  search: string;
};
