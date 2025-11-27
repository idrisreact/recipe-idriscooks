"use client";
import { Card } from "@/src/components/ui/Card";
import { ActionButton } from "@/src/components/ui/ActionButton";
import { RecipeMetadata } from "@/src/components/ui/RecipeMetadata";
import { Heart, Share2, Eye } from "lucide-react";
import { Recipe } from "@/src/types/recipes.types";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorited: boolean;
  onToggleFavorite: (recipeId: number) => Promise<void>;
  onShare: (recipe: Recipe) => void;
  onPreview: (recipe: Recipe) => void;
  onNavigate: (recipe: Recipe) => void;
}

export function RecipeCard({
  recipe,
  isFavorited,
  onToggleFavorite,
  onShare,
  onPreview,
  onNavigate,
}: RecipeCardProps) {
  const actions = (
    <div className="flex gap-2">
      <ActionButton
        icon={Heart}
        isActive={isFavorited}
        activeColor="text-red-500"
        ariaLabel={isFavorited ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`}
        onClick={async (e) => {
          e.stopPropagation();
          await onToggleFavorite(recipe.id);
        }}
      />
      <ActionButton
        icon={Share2}
        ariaLabel={`Share ${recipe.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onShare(recipe);
        }}
      />
      <ActionButton
        icon={Eye}
        ariaLabel={`Preview ${recipe.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onPreview(recipe);
        }}
      />
    </div>
  );

  const metadata = (
    <RecipeMetadata
      cookTime={recipe.cookTime}
      servings={recipe.servings}
      variant="overlay"
    />
  );

  return (
    <div className="group">
      <Card
        variant="recipe"
        backgroundImage={recipe.imageUrl}
        title={recipe.title}
        subtitle={recipe.description}
        author={recipe.author}
        onClick={() => onNavigate(recipe)}
        actions={actions}
        metadata={metadata}
      />
    </div>
  );
}
