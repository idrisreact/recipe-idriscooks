'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FolderOpen, Trash2 } from 'lucide-react';
import { Heading } from '@/src/components/common/heading/heading';
import { Text } from '@/src/components/ui/Text';
import { VerticalSpace } from '@/src/components/ui/VerticalSpace';
import { Card } from '@/src/components/ui/Card';
import { RecipeMetadata } from '@/src/components/ui/RecipeMetadata';
import { ActionButton } from '@/src/components/ui/ActionButton';
import {
  useCollection,
  useDeleteCollection,
  useRemoveRecipeFromCollection,
} from '@/src/hooks/use-collections';

export default function CollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params?.id as string;

  const { data, isLoading, error } = useCollection(collectionId);
  const deleteCollection = useDeleteCollection();
  const removeRecipe = useRemoveRecipeFromCollection();

  const errorMessage = error instanceof Error ? error.message : null;
  const collection = data?.collection;
  const items = data?.items ?? [];

  const handleDeleteCollection = async () => {
    if (!collection) return;
    const confirmed = window.confirm(`Delete "${collection.name}"? This can’t be undone.`);
    if (!confirmed) return;

    try {
      await deleteCollection.mutateAsync(collection.id);
      router.push('/collections');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete collection');
    }
  };

  const handleRemoveRecipe = async (recipeId: number, recipeTitle: string) => {
    if (!collection) return;
    const confirmed = window.confirm(`Remove "${recipeTitle}" from this collection?`);
    if (!confirmed) return;

    try {
      await removeRecipe.mutateAsync({ collectionId: collection.id, recipeId });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove recipe');
    }
  };

  if (isLoading) {
    return (
      <div className="wrapper page">
        <div className="murakamicity-card p-6 animate-pulse h-40" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="wrapper page text-center">
        <Text as="h2" className="text-destructive mb-4" variant="subheading">
          Failed to load collection
        </Text>
        <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
          {errorMessage}
        </Text>
        <button onClick={() => router.push('/collections')} className="murakamicity-button">
          Back to Collections
        </button>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="wrapper page text-center">
        <Text as="h2" className="text-muted-foreground mb-4" variant="subheading">
          Collection not found
        </Text>
        <button onClick={() => router.push('/collections')} className="murakamicity-button">
          Back to Collections
        </button>
      </div>
    );
  }

  return (
    <div className="wrapper page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => router.push('/collections')}
          className="murakamicity-button-outline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </button>
        <button
          onClick={handleDeleteCollection}
          className="murakamicity-button-outline flex items-center gap-2 text-destructive border-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Delete Collection
        </button>
      </div>

      <VerticalSpace space="12" />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <Heading title={collection.name} subTitle={collection.description || 'Your saved recipes'} />
        <div className="text-sm text-muted-foreground">
          {collection.recipeCount} recipe{collection.recipeCount === 1 ? '' : 's'}
        </div>
      </div>

      <VerticalSpace space="16" />

      {items.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <Text as="h2" variant="subheading" className="mb-4">
            No recipes yet
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start adding recipes to build your collection.
          </Text>
          <button onClick={() => router.push('/recipes')} className="murakamicity-button">
            Browse Recipes
          </button>
        </div>
      ) : (
        <div className="recipe-grid">
          {items.map((item) => {
            const actions = (
              <div className="flex gap-2">
                <ActionButton
                  icon={Trash2}
                  ariaLabel={`Remove ${item.recipe.title} from ${collection.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveRecipe(item.recipeId, item.recipe.title);
                  }}
                />
              </div>
            );

            const metadata = (
              <RecipeMetadata
                cookTime={item.recipe.cookTime}
                servings={item.recipe.servings}
                variant="overlay"
              />
            );

            return (
              <div key={item.id} className="group">
                <Card
                  variant="recipe"
                  backgroundImage={item.recipe.imageUrl}
                  title={item.recipe.title}
                  subtitle={item.recipe.description.slice(0, 50) + '...'}
                  onClick={() => router.push(`/recipes/category/${item.recipe.title}`)}
                  actions={actions}
                  metadata={metadata}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
