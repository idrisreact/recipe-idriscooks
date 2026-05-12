'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import { Recipe } from '@/src/types/recipes.types';
import { useState } from 'react';
import { RecipePreviewModal } from './recipe-preview-modal';
import { useFavorites } from '@/src/hooks/use-favorites';
import { useRecipes } from '@/src/hooks/use-recipes';
import { RecipeWelcomeHeader } from './recipe-welcome-header';
import { RecipeFilters } from './recipe-filters';
import { RecipeCard } from '@/src/components/recipe/recipe-card';
import { RecipeLoadingSkeleton } from './recipe-loading-skeleton';
import { RecipeEmptyState } from './recipe-empty-state';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LogRocket from 'logrocket';

import { Session } from '@/src/types';

interface Props {
  session: Session | null;
}

export const Recipes = ({ session }: Props) => {
  const { signIn } = useAuth();
  const router = useRouter();
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();
  const {
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    selectedTags,
    showFilters,
    setShowFilters,
    search,
    setSearch,
    recipes,
    allTags,
    isLoading,
    isError,
    error,
    toggleTag,
  } = useRecipes();

  const toggleFavorite = async (recipeId: number) => {
    LogRocket.track('Recipe Fav clicked', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    } else {
      await addToFavorites(recipeId);
    }
  };

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

  if (isError) {
    return (
      <div className="text-center py-16">
        <span className="eyebrow text-destructive mb-4 block">Error</span>
        <h2 className="subhead mb-4">Failed to load recipes</h2>
        <p className="body-md mb-8">{error?.message || 'Something went wrong'}</p>
        <button onClick={() => window.location.reload()} className="btn-ink">
          Try Again
        </button>
      </div>
    );
  }

  const visibleRecipes = session ? recipes : recipes.slice(0, 3);

  return (
    <div className="w-full">
      <RecipeWelcomeHeader session={session} onSignIn={signIn} />

      <RecipeFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        allTags={allTags}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        resultsCount={recipes.length}
      />

      {isLoading ? (
        <RecipeLoadingSkeleton />
      ) : visibleRecipes.length === 0 ? (
        <RecipeEmptyState searchTerm={search} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={
            viewMode === 'list'
              ? 'flex flex-col gap-6'
              : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
          }
        >
          {visibleRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <RecipeCard
                recipe={recipe}
                isFavorited={isFavorited(recipe.id)}
                onToggleFavorite={toggleFavorite}
                onShare={shareRecipe}
                onPreview={(recipe) => {
                  setPreviewRecipe(recipe);
                  setIsPreviewOpen(true);
                }}
                onNavigate={(recipe) => router.push(`/recipes/category/${recipe.title}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Sign In Prompt for Non-Authenticated Users */}
      {!session && recipes.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <div className="max-w-2xl mx-auto border-t border-[var(--ink)] bg-[var(--parchment)] p-12">
            <span className="eyebrow mb-4 block">Unlock More</span>
            <h3 className="subhead mb-4">{recipes.length - 3} More Recipes Await</h3>
            <p className="body-lg mb-8">
              Sign in to access our complete collection of {recipes.length} curated recipes.
            </p>
            <button onClick={signIn} className="btn-ink group">
              Sign In to Explore
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      )}

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
  );
};
