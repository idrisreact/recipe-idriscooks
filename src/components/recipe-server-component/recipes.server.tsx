"use client";
import { Text } from "@/src/components/ui/Text";
import { Session } from "@/src/types";
import { Heading } from "../heading/heading";
import { VerticalSpace } from "../ui/VerticalSpace";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/src/hooks/use-debounce";
import { Card } from "../card/card";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { RecipeResponse, Recipe } from "@/src/types/recipes.types";
import { useState, useMemo } from "react";
import {
  Heart,
  Grid,
  List,
  Clock,
  Users,
  Star,
  Share2,
  Filter,
  X,
  Eye,
} from "lucide-react";
import { RecipePreviewModal } from "./recipe-preview-modal";
import { useFavorites } from "@/src/hooks/use-favorites";

interface Props {
  session: Session | null;
}

type FormValues = {
  search: string;
};

type SortOption = "newest" | "oldest" | "title" | "cookTime" | "servings";
type ViewMode = "grid" | "list";

const formSchema = z.object({
  search: z.string().min(3, "must be more than 3 letters long"),
});

export const Recipes = ({ session }: Props) => {
  const { signIn } = useAuth();
  const router = useRouter();

  // State management
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Use the favorites hook
  const { favorites, addToFavorites, removeFromFavorites, isFavorited } =
    useFavorites();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  const raw = form.watch("search");
  const debounced = useDebounce(raw, 500);

  const {
    data: recipes = { data: [], count: 0, search: "" },
    isLoading,
    isError,
    error,
  } = useQuery<RecipeResponse>({
    queryKey: ["recipes", debounced],
    queryFn: async () => {
      const url = new URL("/api/recipes", window.location.origin);
      if (debounced.length >= 3) {
        url.searchParams.set("search", debounced);
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      return res.json() as Promise<RecipeResponse>;
    },
    enabled: debounced.length === 0 || debounced.length >= 3,
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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="flex gap-5 flex-wrap">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="w-64 h-80 bg-gray-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );

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
    <div className="mx-auto lg:w-4xl">
      {/* Header Section */}
      {session ? (
        <Heading title="Welcome" subTitle={session.user.name} />
      ) : (
        <div className="flex flex-col gap-5">
          <Text as="h1" className="text-4xl">
            Welcome to Idris Cooks
          </Text>
          <button
            type="button"
            aria-label="Sign in with google"
            onClick={signIn}
            className="self-baseline bg-white p-2 text-black rounded-3xl border-2 text-sm cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      )}
      <VerticalSpace space="16" />

      {/* Search and Filters Section */}
      <div className="mx-auto lg:w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Form {...form}>
            <form
              action=""
              onSubmit={(e) => e.preventDefault()}
              className="flex-1 max-w-md"
            >
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-2xl">
                      Search for recipes
                    </FormLabel>
                    <VerticalSpace space="2" />
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Search for recipes..." {...field} />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => field.onChange("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              {/* Sort Options */}
              <div className="mb-4">
                <Text className="font-medium mb-2">Sort by:</Text>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "newest", label: "Newest" },
                    { value: "oldest", label: "Oldest" },
                    { value: "title", label: "Title" },
                    { value: "cookTime", label: "Cook Time" },
                    { value: "servings", label: "Servings" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(option.value as SortOption)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div>
                  <Text className="font-medium mb-2">Filter by tags:</Text>
                  <div className="flex gap-2 flex-wrap">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <Text className="text-gray-600">
            {filteredAndSortedRecipes.length} recipe
            {filteredAndSortedRecipes.length !== 1 ? "s" : ""} found
            {debounced && ` for "${debounced}"`}
          </Text>
        </div>

        {/* Recipes Grid/List */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredAndSortedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <Text as="h2" className="text-gray-600 mb-2">
              No recipes found
            </Text>
            <Text className="text-gray-500">
              {debounced
                ? `No recipes match "${debounced}"`
                : "Try adjusting your search or filters"}
            </Text>
          </div>
        ) : (
          <div
            className={`flex gap-5 ${
              viewMode === "list" ? "flex-col" : "flex-wrap"
            }`}
          >
            {filteredAndSortedRecipes.map((recipe) => (
              <div key={recipe.id} className="relative group">
                <Card
                  backgroundImage={recipe.imageUrl}
                  heading={recipe.title}
                  lead={recipe.description.slice(0, 50) + "..."}
                  secondaryLead={recipe.tags?.[0] || "No tags"}
                  onClick={() =>
                    router.push(`/recipes/category/${recipe.title}`)
                  }
                />

                {/* Recipe Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await toggleFavorite(recipe.id);
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorited(recipe.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareRecipe(recipe);
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
                        setPreviewRecipe(recipe);
                        setIsPreviewOpen(true);
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
    </div>
  );
};
