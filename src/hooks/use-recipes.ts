import { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { RecipeResponse } from "@/src/types/recipes.types";
import { useDebounce } from "./use-debounce";

type SortOption = "newest" | "oldest" | "title" | "cookTime" | "servings";
type ViewMode = "grid" | "list";

export function useRecipes() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: recipes = { data: [], count: 0, search: "" },
    isLoading,
    isError,
    error,
  } = useQuery<RecipeResponse>({
    queryKey: ["recipes", debouncedSearch],
    queryFn: async () => {
      const url = new URL("/api/recipes", window.location.origin);
      if (debouncedSearch.length >= 3) {
        url.searchParams.set("search", debouncedSearch);
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      return res.json() as Promise<RecipeResponse>;
    },
    enabled: debouncedSearch.length === 0 || debouncedSearch.length >= 3,
    placeholderData: keepPreviousData,
  });

  // Extract unique tags from recipes
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.data.forEach((recipe) => {
      recipe.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [recipes.data]);

  // Filter and sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes.data;

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((recipe) =>
        recipe.tags?.some((tag) => selectedTags.includes(tag))
      );
    }

    // Sort recipes
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.id - a.id;
        case "oldest":
          return a.id - b.id;
        case "title":
          return a.title.localeCompare(b.title);
        case "cookTime":
          return a.cookTime - b.cookTime;
        case "servings":
          return a.servings - b.servings;
        default:
          return 0;
      }
    });
  }, [recipes.data, sortBy, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return {
    // State
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    selectedTags,
    showFilters,
    setShowFilters,
    search,
    setSearch,
    
    // Data
    recipes: filteredAndSortedRecipes,
    allTags,
    isLoading,
    isError,
    error,
    
    // Actions
    toggleTag,
  };
} 