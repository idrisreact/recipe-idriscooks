"use client";
import { Recipe } from "@/src/types/recipes.types";
import { Text } from "@/src/components/ui/Text";

interface RecipeContentProps {
  recipe: Recipe;
}

export function RecipeContent({ recipe }: RecipeContentProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Ingredients */}
      <div>
        <Text as="h2" className="text-2xl font-bold mb-4">
          Ingredients
        </Text>
        <ul className="space-y-3">
          {recipe.ingredients?.map((ingredient, index) => (
            <li
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
              <Text className="font-medium">
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </Text>
            </li>
          )) || <Text className="text-gray-500">No ingredients listed</Text>}
        </ul>
      </div>

      {/* Instructions */}
      <div>
        <Text as="h2" className="text-2xl font-bold mb-4">
          Instructions
        </Text>
        <ol className="space-y-4">
          {recipe.steps?.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <Text className="leading-relaxed">{step}</Text>
            </li>
          )) || <Text className="text-gray-500">No steps listed</Text>}
        </ol>
      </div>
    </div>
  );
}
