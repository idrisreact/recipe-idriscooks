import { Text } from "@/src/components/ui/Text";

interface RecipeEmptyStateProps {
  searchTerm?: string;
}

export function RecipeEmptyState({ searchTerm }: RecipeEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Text as="h2" className="text-gray-600 mb-2">
        No recipes found
      </Text>
      <Text className="text-gray-500">
        {searchTerm
          ? `No recipes match "${searchTerm}"`
          : "Try adjusting your search or filters"}
      </Text>
    </div>
  );
}
