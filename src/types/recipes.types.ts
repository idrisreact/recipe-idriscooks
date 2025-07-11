// types.ts
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
  }
  
  export interface RecipesData {
    recipes: Recipe[];
  }
  
  // The output shape: map from tag name → array of { id, title }
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