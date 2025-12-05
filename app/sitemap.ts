import { MetadataRoute } from 'next';
import { db } from '@/src/db';
import { recipes } from '@/src/db/schemas';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://idriscooks.vercel.app';

  // Fetch all recipes from the database
  const allRecipes = await db.select().from(recipes);

  // Generate recipe pages URLs
  const recipeUrls: MetadataRoute.Sitemap = allRecipes.map((recipe) => ({
    url: `${baseUrl}/recipes/category/${encodeURIComponent(recipe.title)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  return [...staticPages, ...recipeUrls];
}
