import { ByTagIndex, RecipesData } from '../types/recipes.types';

export function groupRecipesByTag(data: RecipesData): ByTagIndex {
  const byTag: ByTagIndex = {};

  for (const recipe of data.recipes) {
    for (const tag of recipe.tags) {
      if (!byTag[tag]) {
        byTag[tag] = [];
      }
      byTag[tag].push({ id: recipe.id, title: recipe.title });
    }
  }

  return byTag;
}

export const getTagsByKeys = (object: ByTagIndex) =>
  Object.keys(object).map((val) => val.toLowerCase());
