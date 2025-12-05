import { db } from '@/src/db';
import { recipes } from '@/src/db/schemas';
import { sql, ne } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, ChefHat } from 'lucide-react';

interface SimilarRecipesProps {
  currentRecipeId: number;
  tags: string[] | null;
  limit?: number;
}

export async function SimilarRecipes({ currentRecipeId, tags, limit = 4 }: SimilarRecipesProps) {
  let recipesToShow;

  // Find recipes that share at least one tag with the current recipe (if tags exist)
  if (tags && tags.length > 0) {
    const similarRecipes = await db
      .select()
      .from(recipes)
      .where(
        sql`${recipes.id} != ${currentRecipeId} AND ${recipes.tags}::jsonb ?| array[${tags.map((t) => `'${t}'`).join(',')}]`
      )
      .limit(limit);

    recipesToShow = similarRecipes;
  }

  // If no similar recipes found by tags (or no tags), get random recipes
  if (!recipesToShow || recipesToShow.length === 0) {
    recipesToShow = await db
      .select()
      .from(recipes)
      .where(ne(recipes.id, currentRecipeId))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  if (recipesToShow.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-12 border-t border-zinc-800">
      <div className="flex items-center gap-2 mb-6">
        <ChefHat className="w-6 h-6 text-[var(--primary)]" />
        <h2 className="text-2xl font-semibold text-white">You Might Also Like</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipesToShow.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/category/${encodeURIComponent(recipe.title)}`}
            className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-[var(--primary)] transition-all hover:shadow-lg hover:shadow-[var(--primary)]/10"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-white line-clamp-2 mb-2 group-hover:text-[var(--primary)] transition-colors">
                {recipe.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">{recipe.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
