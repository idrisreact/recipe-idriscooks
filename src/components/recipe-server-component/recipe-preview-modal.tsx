"use client";
import { Recipe } from "@/src/types/recipes.types";
import { X, Clock, Users, Heart, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/src/components/ui/Text";
import { useState } from "react";
import { authClient } from "@/src/utils/auth-client";
import { SignInOverlay } from "./sign-in-overlay";

interface RecipePreviewModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onFavorite: (recipeId: number) => void | Promise<void>;
  isFavorited: boolean;
  onNavigate: (recipe: Recipe) => void;
}

export const RecipePreviewModal = ({
  recipe,
  isOpen,
  onClose,
  onFavorite,
  isFavorited,
  onNavigate,
}: RecipePreviewModalProps) => {
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    "ingredients"
  );
  const { data: session } = authClient.useSession();

  if (!isOpen || !recipe) return null;

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
        {!session && <SignInOverlay onClose={onClose} />}
        {/* Header */}
        <div
          className="relative h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${recipe.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => await onFavorite(recipe.id)}
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
              onClick={shareRecipe}
              className="bg-white/90 hover:bg-white"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onClose}
              className="bg-white/90 hover:bg-white"
            >
              <X className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <Text as="h2" className="text-2xl font-bold mb-2">
              {recipe.title}
            </Text>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.cookTime}m
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings} servings
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          <Text className="text-gray-600 mb-6">{recipe.description}</Text>

          {/* Tabs */}
          <div className="flex gap-4 mb-4 border-b">
            <button
              onClick={() => setActiveTab("ingredients")}
              className={`pb-2 px-1 border-b-2 font-medium ${
                activeTab === "ingredients"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab("steps")}
              className={`pb-2 px-1 border-b-2 font-medium ${
                activeTab === "steps"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              Steps
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "ingredients" && (
            <div>
              <Text as="h3" className="font-semibold mb-3">
                Ingredients
              </Text>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <Text>
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </Text>
                  </li>
                )) || (
                  <Text className="text-gray-500">No ingredients listed</Text>
                )}
              </ul>
            </div>
          )}

          {activeTab === "steps" && (
            <div>
              <Text as="h3" className="font-semibold mb-3">
                Instructions
              </Text>
              <ol className="space-y-3">
                {recipe.steps?.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <Text>{step}</Text>
                  </li>
                )) || <Text className="text-gray-500">No steps listed</Text>}
              </ol>
            </div>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-6">
              <Text as="h3" className="font-semibold mb-2">
                Tags
              </Text>
              <div className="flex gap-2 flex-wrap">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <Button onClick={() => onNavigate(recipe)} className="flex-1">
              <BookOpen className="w-4 h-4 mr-2" />
              View Full Recipe
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
