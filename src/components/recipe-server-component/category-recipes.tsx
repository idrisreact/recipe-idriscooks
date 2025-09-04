'use client';

import { Session } from '@/src/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/src/types/recipes.types';
import { useState } from 'react';
import { RecipePreviewModal } from './recipe-preview-modal';
import { useFavorites } from '@/src/hooks/use-favorites';
import { RecipeCard } from '@/src/components/recipe/recipe-card';
import { RecipeEmptyState } from './recipe-empty-state';

interface CategoryRecipesProps {
  session: Session | null;
  recipes: Recipe[];
  category: string;
}

export function CategoryRecipes({ recipes, category }: CategoryRecipesProps) {
  const router = useRouter();
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const toggleFavorite = async (recipeId: number) => {
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    } else {
      await addToFavorites(recipeId);
    }
  };

  const shareRecipe = (recipe: Recipe) => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.origin + `/recipes/category/${recipe.title}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${recipe.title} - ${window.location.origin}/recipes/category/${recipe.title}`
      );
    }
  };

  return (
    <div className="mx-auto lg:w-4xl">
      {}
      <div className="flex justify-end mb-6">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {}
      {recipes.length === 0 ? (
        <RecipeEmptyState searchTerm={category} />
      ) : (
        <div className={`flex gap-5 ${viewMode === 'list' ? 'flex-col' : 'flex-wrap'}`}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorited={isFavorited(recipe.id)}
              onToggleFavorite={toggleFavorite}
              onShare={shareRecipe}
              onPreview={(recipe) => {
                setPreviewRecipe(recipe);
                setIsPreviewOpen(true);
              }}
              onNavigate={(recipe) => router.push(`/recipes/category/${recipe.title}`)}
            />
          ))}
        </div>
      )}

      {}
      <RecipePreviewModal
        recipe={previewRecipe}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onFavorite={toggleFavorite}
        isFavorited={!!(previewRecipe && isFavorited(previewRecipe.id))}
        onNavigate={(recipe) => {
          setIsPreviewOpen(false);
          router.push(`/recipes/category/${recipe.title}`);
        }}
      />
    </div>
  );
}
