'use client';
import { Recipe } from '@/src/types/recipes.types';
import { Session } from '@/src/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Text } from '@/src/components/ui/Text';
import { useFavorites } from '@/src/hooks/use-favorites';
import { ArrowLeft } from 'lucide-react';
import { RecipeHeader } from '@/src/components/recipe/recipe-header';
import { RecipeContent } from '@/src/components/recipe/recipe-content';
import { RecipeTags } from '@/src/components/recipe/recipe-tags';
import { RecipeActions } from '@/src/components/recipe/recipe-actions';
import { SignInOverlay } from './sign-in-overlay';

interface SingleRecipeViewProps {
  session: Session | null;
  recipe: Recipe;
  canView: boolean;
}

export function SingleRecipeView({ recipe, canView }: SingleRecipeViewProps) {
  const router = useRouter();

  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const toggleFavorite = async (recipeId: number) => {
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    } else {
      await addToFavorites(recipeId);
    }
  };

  const shareRecipe = () => {
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
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/recipes')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Button>
      </div>

      {}
      <RecipeHeader
        recipe={recipe}
        isFavorited={isFavorited(recipe.id)}
        onToggleFavorite={toggleFavorite}
        onShare={shareRecipe}
      />

      {}
      <div className="mb-8">
        <Text className="text-lg text-gray-600 leading-relaxed">{recipe.description}</Text>
      </div>

      {}
      <div className="relative">
        {canView ? (
          <>
            <RecipeContent recipe={recipe} />
            <RecipeTags recipe={recipe} />
            <RecipeActions />
          </>
        ) : (
          <SignInOverlay position="top" />
        )}
      </div>
    </div>
  );
}
