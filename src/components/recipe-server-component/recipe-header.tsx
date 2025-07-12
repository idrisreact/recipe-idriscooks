"use client";
import { Recipe } from "@/src/types/recipes.types";
import { Button } from "@/components/ui/button";
import { Text } from "@/src/components/ui/Text";
import { Heart, Clock, Users, Share2 } from "lucide-react";

interface RecipeHeaderProps {
  recipe: Recipe;
  isFavorited: boolean;
  onToggleFavorite: (recipeId: number) => Promise<void>;
  onShare: () => void;
}

export function RecipeHeader({
  recipe,
  isFavorited,
  onToggleFavorite,
  onShare,
}: RecipeHeaderProps) {
  return (
    <div
      className="relative h-64 md:h-80 bg-cover bg-center rounded-lg mb-8"
      style={{ backgroundImage: `url(${recipe.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-lg" />
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => await onToggleFavorite(recipe.id)}
          className="bg-white/90 hover:bg-white"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onShare}
          className="bg-white/90 hover:bg-white"
        >
          <Share2 className="w-4 h-4 text-gray-600" />
        </Button>
      </div>
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <Text as="h1" className="text-3xl md:text-4xl font-bold mb-3">
          {recipe.title}
        </Text>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.cookTime}m cook time
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {recipe.servings} servings
          </div>
        </div>
      </div>
    </div>
  );
}
