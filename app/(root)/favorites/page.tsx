"use client";

import { useFavorites } from "@/src/hooks/use-favorites";
import { Card } from "@/src/components/ui/Card";
import { ActionButton } from "@/src/components/ui/ActionButton";
import { RecipeMetadata } from "@/src/components/ui/RecipeMetadata";
import { Text } from "@/src/components/ui/Text";
import { Heading } from "@/src/components/common/heading/heading";
import { VerticalSpace } from "@/src/components/ui/VerticalSpace";
import { useRouter } from "next/navigation";
import { Heart, Share2, Eye } from "lucide-react";
import { RecipePreviewModal } from "@/src/components/recipe-server-component/recipe-preview-modal";
// import dynamic from "next/dynamic";

// Temporarily disabled PDF functionality due to build issues
// const PDFGenerator = dynamic(() => import("@/src/components/recipe-server-component/pdf-generator").then(mod => ({ default: mod.PDFGenerator })), {
//   ssr: false,
//   loading: () => <div>Loading PDF generator...</div>
// });
import { useState } from "react";
import { Recipe } from "@/src/types/recipes.types";

export default function FavoritesPage() {
  const { favorites, loading, error, removeFromFavorites, isFavorited } =
    useFavorites();
  const router = useRouter();
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const toggleFavorite = async (recipeId: number) => {
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    }
  };

  console.log(favorites);
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

  if (loading) {
    return (
      <div className="mx-auto lg:w-4xl">
        <Heading title="My Favorites" subTitle="Your saved recipes" />
        <VerticalSpace space="16" />
        <div className="flex gap-5 flex-wrap">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-64 h-80 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto lg:w-4xl text-center">
        <Heading title="My Favorites" subTitle="Your saved recipes" />
        <VerticalSpace space="16" />
        <Text as="h2" className="text-red-600 mb-4">
          Failed to load favorites
        </Text>
        <Text className="text-gray-600 mb-4">{error}</Text>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto lg:w-4xl">
      <Heading title="My Favorites" subTitle="Your saved recipes" />
      <VerticalSpace space="16" />

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <Text as="h2" className="text-gray-600 mb-2">
            No favorites yet
          </Text>
          <Text className="text-gray-500 mb-6">
            Start exploring recipes and add them to your favorites!
          </Text>
          <button 
            onClick={() => router.push("/recipes")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Recipes
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <Text className="text-gray-600">
              {favorites.length} favorite recipe
              {favorites.length !== 1 ? "s" : ""}
            </Text>
            {/* Temporarily disabled PDF functionality due to build issues */}
            {/* <PDFGenerator
              recipes={favorites.map((f) => f.recipe)}
              title="My Favorite Recipes"
            /> */}
          </div>

          <div className="flex gap-5 flex-wrap">
            {favorites.map((favorite) => {
              const actions = (
                <div className="flex gap-2">
                  <ActionButton
                    icon={Heart}
                    isActive={true}
                    activeColor="text-red-500"
                    ariaLabel={`Remove ${favorite.recipe.title} from favorites`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await toggleFavorite(favorite.recipe.id);
                    }}
                  />
                  <ActionButton
                    icon={Share2}
                    ariaLabel={`Share ${favorite.recipe.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      shareRecipe(favorite.recipe);
                    }}
                  />
                  <ActionButton
                    icon={Eye}
                    ariaLabel={`Preview ${favorite.recipe.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewRecipe(favorite.recipe);
                      setIsPreviewOpen(true);
                    }}
                  />
                </div>
              );

              const metadata = (
                <RecipeMetadata
                  cookTime={favorite.recipe.cookTime}
                  servings={favorite.recipe.servings}
                  variant="overlay"
                />
              );

              return (
                <div key={favorite.id} className="group">
                  <Card
                    variant="recipe"
                    backgroundImage={favorite.recipe.imageUrl}
                    title={favorite.recipe.title}
                    subtitle={favorite.recipe.description.slice(0, 50) + "..."}
                    onClick={() =>
                      router.push(`/recipes/category/${favorite.recipe.title}`)
                    }
                    actions={actions}
                    metadata={metadata}
                  />
                </div>
              );
            })}
          </div>

          {/* Recipe Preview Modal */}
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
        </>
      )}
    </div>
  );
}
