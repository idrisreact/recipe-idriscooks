"use client";
import { Card } from "@/src/components/card/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Users, Share2, Eye } from "lucide-react";
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
  return (
    <div className="relative group">
      <Card
        backgroundImage={recipe.imageUrl}
        heading={recipe.title}
        lead={recipe.description.slice(0, 50) + "..."}
        secondaryLead={recipe.tags?.[0] || "No tags"}
        onClick={() => onNavigate(recipe)}
      />

      {/* Recipe Actions Overlay */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={async (e) => {
              e.stopPropagation();
              await onToggleFavorite(recipe.id);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              onShare(recipe);
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
              onPreview(recipe);
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
            {recipe.cookTime}m
          </div>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
            <Users className="w-3 h-3" />
            {recipe.servings}
          </div>
        </div>
      </div>
    </div>
  );
}
