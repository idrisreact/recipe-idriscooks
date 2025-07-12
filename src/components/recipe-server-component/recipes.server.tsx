"use client";
import { Text } from "@/src/components/ui/Text";
import { Session } from "@/src/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/src/types/recipes.types";
import { useState } from "react";
import { RecipePreviewModal } from "./recipe-preview-modal";
import { useFavorites } from "@/src/hooks/use-favorites";
import { useRecipes } from "@/src/hooks/use-recipes";
import { RecipeWelcomeHeader } from "./recipe-welcome-header";
import { RecipeFilters } from "./recipe-filters";
import { RecipeCard } from "./recipe-card";
import { RecipeLoadingSkeleton } from "./recipe-loading-skeleton";
import { RecipeEmptyState } from "./recipe-empty-state";
import { PDFGenerator } from "./pdf-generator";

interface Props {
  session: Session | null;
}

export const Recipes = ({ session }: Props) => {
  const { signIn } = useAuth();
  const router = useRouter();
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Use the custom hooks
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();
  const {
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    selectedTags,
    showFilters,
    setShowFilters,
    search,
    setSearch,
    recipes,
    allTags,
    isLoading,
    isError,
    error,
    toggleTag,
  } = useRecipes();

  // Toggle favorite
  const toggleFavorite = async (recipeId: number) => {
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    } else {
      await addToFavorites(recipeId);
    }
  };

  // Share recipe
  const shareRecipe = (recipe: Recipe) => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.origin + `/recipes/category/${recipe.title}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${recipe.title} - ${window.location.origin}/recipes/category/${recipe.title}`
      );
    }
  };

  // Error state
  if (isError) {
    return (
      <div className="mx-auto lg:w-4xl text-center">
        <Text as="h2" className="text-red-600 mb-4">
          Failed to load recipes
        </Text>
        <Text className="text-gray-600 mb-4">
          {error?.message || "Something went wrong"}
        </Text>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:mx-auto md:max-w-4xl">
      {/* Header Section */}
      <RecipeWelcomeHeader session={session} onSignIn={signIn} />

      {/* Search and Filters Section */}
      <RecipeFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        allTags={allTags}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        resultsCount={recipes.length}
      />

      {/* PDF Download Section */}
      {recipes.length > 0 && (
        <div className="mb-6 flex justify-end">
          <PDFGenerator recipes={recipes} title="All Recipes" />
        </div>
      )}

      {/* Recipes Grid/List */}
      {isLoading ? (
        <RecipeLoadingSkeleton />
      ) : recipes.length === 0 ? (
        <RecipeEmptyState searchTerm={search} />
      ) : (
        <div
          className={`flex gap-5 ${
            viewMode === "list" ? "flex-col" : "flex-wrap"
          }`}
        >
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`w-full ${
                viewMode === "list"
                  ? ""
                  : "md:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.33px)]"
              }`}
            >
              <RecipeCard
                recipe={recipe}
                isFavorited={isFavorited(recipe.id)}
                onToggleFavorite={toggleFavorite}
                onShare={shareRecipe}
                onPreview={(recipe) => {
                  setPreviewRecipe(recipe);
                  setIsPreviewOpen(true);
                }}
                onNavigate={(recipe) =>
                  router.push(`/recipes/category/${recipe.title}`)
                }
              />
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
};
