import { Recipe } from '@/src/types/recipes.types';

/**
 * Generates Recipe schema markup (JSON-LD) for Google
 * @see https://schema.org/Recipe
 * @see https://developers.google.com/search/docs/appearance/structured-data/recipe
 */
export function generateRecipeSchema(recipe: Recipe, url: string) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.imageUrl,
    url: url,
    author: {
      '@type': 'Person',
      name: recipe.author?.name || 'Idris Cooks',
    },
    datePublished: new Date().toISOString(), // You might want to add a createdAt field to your schema
    prepTime: recipe.prepTime ? `PT${recipe.prepTime}M` : undefined,
    cookTime: recipe.cookTime ? `PT${recipe.cookTime}M` : undefined,
    totalTime: totalTime > 0 ? `PT${totalTime}M` : undefined,
    recipeYield: recipe.servings?.toString() || '1',
    recipeIngredient: recipe.ingredients?.map(
      (ing) => `${ing.quantity} ${ing.unit} ${ing.name}`
    ) || [],
    recipeInstructions: recipe.steps?.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })) || [],
    keywords: recipe.tags?.join(', ') || '',
    recipeCategory: recipe.tags?.[0] || 'Main Course',
    recipeCuisine: recipe.tags?.find(tag =>
      ['Italian', 'Mexican', 'Chinese', 'Indian', 'French', 'Japanese', 'Thai'].includes(tag)
    ) || undefined,
  };
}

/**
 * Generates canonical URL for a page
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://idriscooks.vercel.app';
  return `${baseUrl}${path}`;
}

/**
 * Generates Open Graph image URL (can be enhanced with dynamic OG image generation later)
 */
export function getOgImageUrl(imageUrl?: string): string {
  if (imageUrl) {
    return imageUrl;
  }
  // Fallback to default OG image
  return getCanonicalUrl('/og-image.jpg');
}
