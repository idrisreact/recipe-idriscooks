"use client";
import { Recipe } from "@/src/types/recipes.types";
import { Session } from "@/src/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Text } from "@/src/components/ui/Text";
import { useFavorites } from "@/src/hooks/use-favorites";
import { ArrowLeft } from "lucide-react";
import { RecipeHeader } from "./recipe-header";
import { RecipeContent } from "./recipe-content";
import { RecipeTags } from "./recipe-tags";
import { RecipeActions } from "./recipe-actions";
import { SignInOverlay } from "./sign-in-overlay";

interface SingleRecipeViewProps {
  session: Session | null;
  recipe: Recipe;
}

export function SingleRecipeView({ session, recipe }: SingleRecipeViewProps) {
  const router = useRouter();

  // Use the custom hooks
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  // Toggle favorite
  const toggleFavorite = async (recipeId: number) => {
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    } else {
      await addToFavorites(recipeId);
    }
  };

  // Share recipe
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
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/recipes")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Button>
      </div>

      {/* Recipe Header */}
      <RecipeHeader
        recipe={recipe}
        isFavorited={isFavorited(recipe.id)}
        onToggleFavorite={toggleFavorite}
        onShare={shareRecipe}
      />

      {/* Recipe Description */}
      <div className="mb-8">
        <Text className="text-lg text-gray-600 leading-relaxed">
          {recipe.description}
        </Text>
      </div>

      {/* Recipe Content - Blurred for non-logged in users */}
      <div className="relative">
        <div
          className={`transition-all duration-300 ${
            !session ? "blur-sm opacity-60" : ""
          }`}
        >
          <RecipeContent recipe={recipe} />
          <RecipeTags recipe={recipe} />
          <RecipeActions />
        </div>

        {/* Sign In Overlay for non-logged in users */}
        {!session && <SignInOverlay position="top" />}
      </div>
    </div>
  );
}
