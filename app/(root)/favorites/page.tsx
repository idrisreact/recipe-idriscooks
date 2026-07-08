'use client';

import { useFavorites } from '@/src/hooks/use-favorites';
import { Card } from '@/src/components/ui/Card';
import { ActionButton } from '@/src/components/ui/ActionButton';
import { RecipeMetadata } from '@/src/components/ui/RecipeMetadata';
import { PageHeader } from '@/src/components/ui/page-header';
import { EmptyState } from '@/src/components/ui/empty-state';
import { SkeletonGrid, SkeletonPage } from '@/src/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Heart, Share2, Eye } from 'lucide-react';
import { RecipePreviewModal } from '@/src/components/recipe-server-component/recipe-preview-modal';
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import { Recipe } from '@/src/types/recipes.types';
import { authClient } from '@/src/utils/auth-client';
import { SignInModal } from '@/src/components/auth/sign-in-modal/SignInModal';
import { useSearchParams } from 'next/navigation';

const PDFGenerator = dynamic(
  () =>
    import('@/src/components/recipe-server-component/pdf-generator').then((mod) => ({
      default: mod.PDFGenerator,
    })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse w-24 h-10 bg-[var(--parchment)]" />,
  }
);

function FavoritesContent() {
  const { data: session, isPending } = authClient.useSession();
  const {
    favorites,
    loading,
    error,
    removeFromFavorites,
    isFavorited,
    page,
    setPage,
    total,
    hasMore,
  } = useFavorites();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [shouldAutoDownload, setShouldAutoDownload] = useState(false);

  const toggleFavorite = async (recipeId: number) => {
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    }
  };

  useEffect(() => {
    const downloadParam = searchParams.get('download');
    if (downloadParam === 'true' && !loading && favorites.length > 0) {
      setShouldAutoDownload(true);

      const url = new URL(window.location.href);
      url.searchParams.delete('download');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, loading, favorites.length]);

  if (isPending) {
    return <SkeletonPage />;
  }

  if (!session) {
    return (
      <div className="wrapper page">
        <PageHeader
          eyebrow="Dog-eared pages"
          title="Favorites"
          description="The recipes you come back to, saved in one place."
        />
        <EmptyState
          eyebrow="Sign in required"
          title={
            <>
              Save the ones worth <span className="italic text-[var(--tomato)]">repeating</span>.
            </>
          }
          description="Sign in to keep your favorite recipes together and export them as a PDF."
          action={
            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={() => setShowSignInModal(true)} className="btn-ink">
                Sign in
              </button>
              <button type="button" onClick={() => router.push('/recipes')} className="btn-link">
                Browse recipes instead
              </button>
            </div>
          }
        />
        {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
      </div>
    );
  }

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

  if (loading) {
    return (
      <div className="wrapper page">
        <PageHeader
          eyebrow="Dog-eared pages"
          title="Favorites"
          description="The recipes you come back to, saved in one place."
        />
        <SkeletonGrid count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper page">
        <PageHeader eyebrow="Dog-eared pages" title="Favorites" />
        <EmptyState
          eyebrow="Something went wrong"
          title="Your favorites wouldn't load."
          description={error}
          action={
            <button type="button" onClick={() => window.location.reload()} className="btn-ink">
              Try again
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="wrapper page">
      <PageHeader
        eyebrow="Dog-eared pages"
        title="Favorites"
        description="The recipes you come back to, saved in one place."
        aside={
          favorites.length > 0 ? (
            <div className="flex items-center gap-6">
              <span className="mono-label">
                {total} recipe{total !== 1 ? 's' : ''}
              </span>
              <PDFGenerator
                recipes={favorites.map((fav) => fav.recipe)}
                title="My Favorite Recipes"
                autoDownload={shouldAutoDownload}
                onAutoDownloadComplete={() => setShouldAutoDownload(false)}
              />
            </div>
          ) : undefined
        }
      />

      {favorites.length === 0 ? (
        <EmptyState
          eyebrow="Empty shelf"
          title={
            <>
              Nothing dog-eared <span className="italic text-[var(--tomato)]">yet</span>.
            </>
          }
          description="Browse the archive and save the recipes worth repeating."
          actionLabel="Browse recipes"
          actionHref="/recipes"
        />
      ) : (
        <>
          <div className="recipe-grid">
            {favorites.map((favorite) => {
              const actions = (
                <div className="flex gap-2">
                  <ActionButton
                    icon={Heart}
                    isActive={true}
                    activeColor="text-[var(--tomato)]"
                    ariaLabel={`Remove ${favorite.recipe.title} from favorites`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await toggleFavorite(favorite.recipe.id);
                    }}
                  />
                  <ActionButton
                    icon={Share2}
                    ariaLabel={`Share ${favorite.recipe.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      shareRecipe(favorite.recipe);
                    }}
                  />
                  <ActionButton
                    icon={Eye}
                    ariaLabel={`Preview ${favorite.recipe.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewRecipe(favorite.recipe);
                      setIsPreviewOpen(true);
                    }}
                  />
                </div>
              );

              const metadata = (
                <RecipeMetadata
                  cookTime={favorite.recipe.cookTime}
                  servings={favorite.recipe.servings}
                  variant="overlay"
                />
              );

              return (
                <div key={favorite.id} className="group">
                  <Card
                    variant="recipe"
                    backgroundImage={favorite.recipe.imageUrl}
                    title={favorite.recipe.title}
                    subtitle={favorite.recipe.description.slice(0, 50) + '...'}
                    onClick={() => router.push(`/recipes/category/${favorite.recipe.title}`)}
                    actions={actions}
                    metadata={metadata}
                  />
                </div>
              );
            })}
          </div>

          {total > favorites.length && (
            <nav
              className="flex items-center justify-between border-t border-[var(--ink-line)] pt-8"
              aria-label="Favorites pagination"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-link disabled:opacity-40 disabled:pointer-events-none"
              >
                ← Previous
              </button>
              <span className="mono-label">Page {page + 1}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="btn-link disabled:opacity-40 disabled:pointer-events-none"
              >
                Next →
              </button>
            </nav>
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
        </>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <FavoritesContent />
    </Suspense>
  );
}
