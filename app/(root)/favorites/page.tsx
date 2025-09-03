"use client";

import { useFavorites } from "@/src/hooks/use-favorites";
import { Card } from "@/src/components/ui/Card";
import { ActionButton } from "@/src/components/ui/ActionButton";
import { RecipeMetadata } from "@/src/components/ui/RecipeMetadata";
import { Text } from "@/src/components/ui/Text";
import { Heading } from "@/src/components/common/heading/heading";
import { VerticalSpace } from "@/src/components/ui/VerticalSpace";
import { useRouter } from "next/navigation";
import { Heart, Share2, Eye, LogIn } from "lucide-react";
import { RecipePreviewModal } from "@/src/components/recipe-server-component/recipe-preview-modal";
import { useState } from "react";
import { Recipe } from "@/src/types/recipes.types";
import { authClient } from "@/src/utils/auth-client";
import { SignInModal } from "@/src/components/auth/sign-in-modal/SignInModal";

export default function FavoritesPage() {
  const { data: session, isPending } = authClient.useSession();
  const { favorites, loading, error, removeFromFavorites, isFavorited } =
    useFavorites();
  const router = useRouter();
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const toggleFavorite = async (recipeId: number) => {
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    }
  };

  // Show loading while checking authentication
  if (isPending) {
    return (
      <div className="wrapper page">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-4"></div>
            <Text>Loading...</Text>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in prompt for unauthenticated users
  if (!session) {
    return (
      <div className="wrapper page">
        <div className="text-center py-16">
          <LogIn className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <Text as="h1" variant="heading" className="mb-4">
            Sign in to view your favorites
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create an account or sign in to save your favorite recipes and access them anytime.
          </Text>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowSignInModal(true)}
              className="murakamicity-button flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => router.push("/recipes")}
              className="murakamicity-button-outline flex items-center gap-2"
            >
              Browse Recipes
            </button>
          </div>
        </div>
        
        {showSignInModal && (
          <SignInModal onClose={() => setShowSignInModal(false)} />
        )}
      </div>
    );
  }

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
      <div className="wrapper page">
        <Heading title="My Favorites" subTitle="Your saved recipes" />
        <VerticalSpace space="16" />
        <div className="recipe-grid">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-full h-80 bg-muted rounded-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper page text-center">
        <Heading title="My Favorites" subTitle="Your saved recipes" />
        <VerticalSpace space="16" />
        <Text as="h2" className="text-destructive mb-4" variant="subheading">
          Failed to load favorites
        </Text>
        <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</Text>
        <button 
          onClick={() => window.location.reload()}
          className="murakamicity-button mx-auto"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="wrapper page">
      <Heading title="My Favorites" subTitle="Your saved recipes" />
      <VerticalSpace space="16" />

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <Text as="h2" variant="subheading" className="mb-4">
            No favorites yet
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start exploring recipes and add them to your favorites!
          </Text>
          <button 
            onClick={() => router.push("/recipes")}
            className="murakamicity-button flex items-center gap-2 mx-auto"
          >
            <Heart className="w-4 h-4" />
            Browse Recipes
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <Text variant="large" className="text-muted-foreground font-medium">
              {favorites.length} favorite recipe
              {favorites.length !== 1 ? "s" : ""}
            </Text>
          </div>

          <div className="recipe-grid">
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
