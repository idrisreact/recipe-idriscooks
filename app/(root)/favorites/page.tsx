"use client";

import { useFavorites } from "@/src/hooks/use-favorites";
import { Card } from "@/src/components/card/card";
import { Text } from "@/src/components/ui/Text";
import { Heading } from "@/src/components/heading/heading";
import { VerticalSpace } from "@/src/components/ui/VerticalSpace";
import { useRouter } from "next/navigation";
import { Heart, Clock, Users, Share2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipePreviewModal } from "@/src/components/recipe-server-component/recipe-preview-modal";
import { PDFGenerator } from "@/src/components/recipe-server-component/pdf-generator";
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
        <Button onClick={() => window.location.reload()}>Try Again</Button>
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
          <Button onClick={() => router.push("/recipes")}>
            Browse Recipes
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <Text className="text-gray-600">
              {favorites.length} favorite recipe
              {favorites.length !== 1 ? "s" : ""}
            </Text>
            <PDFGenerator
              recipes={favorites.map((f) => f.recipe)}
              title="My Favorite Recipes"
            />
          </div>

          <div className="flex gap-5 flex-wrap">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative group">
                <Card
                  backgroundImage={favorite.recipe.imageUrl}
                  heading={favorite.recipe.title}
                  lead={favorite.recipe.description.slice(0, 50) + "..."}
                  secondaryLead={favorite.recipe.tags?.[0] || "No tags"}
                  onClick={() =>
                    router.push(`/recipes/category/${favorite.recipe.title}`)
                  }
                />

                {/* Recipe Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await toggleFavorite(favorite.recipe.id);
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareRecipe(favorite.recipe);
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewRecipe(favorite.recipe);
                        setIsPreviewOpen(true);
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                </div>

                {/* Recipe Info Overlay */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2 text-white text-xs">
                    <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      {favorite.recipe.cookTime}m
                    </div>
                    <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                      <Users className="w-3 h-3" />
                      {favorite.recipe.servings}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
