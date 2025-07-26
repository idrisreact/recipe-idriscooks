"use client";
import { Recipe } from "@/src/types/recipes.types";
import { Text } from "@/src/components/ui/Text";
import { useRouter } from "next/navigation";

interface RecipeTagsProps {
  recipe: Recipe;
}

export function RecipeTags({ recipe }: RecipeTagsProps) {
  const router = useRouter();

  if (!recipe.tags || recipe.tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t">
      <Text as="h3" className="font-semibold mb-3">
        Tags
      </Text>
      <div className="flex gap-2 flex-wrap">
        {recipe.tags.map((tag, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
            onClick={() =>
              router.push(`/recipes?tag=${encodeURIComponent(tag)}`)
            }
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
