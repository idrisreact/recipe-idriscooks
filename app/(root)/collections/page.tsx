'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, Plus, Trash2, LogIn, FolderOpen } from 'lucide-react';
import { authClient } from '@/src/utils/auth-client';
import { SignInModal } from '@/src/components/auth/sign-in-modal/SignInModal';
import { Heading } from '@/src/components/common/heading/heading';
import { Text } from '@/src/components/ui/Text';
import { VerticalSpace } from '@/src/components/ui/VerticalSpace';
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
} from '@/src/hooks/use-collections';
import type { CollectionSummary } from '@/src/hooks/use-collections';

function CollectionsContent() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { data: collections = [], isLoading, error } = useCollections();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [formError, setFormError] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const errorMessage = error instanceof Error ? error.message : null;

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Collection name is required');
      return;
    }

    try {
      await createCollection.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      setName('');
      setDescription('');
      setColor('#3B82F6');
      setShowCreate(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create collection');
    }
  };

  const handleDelete = async (collection: CollectionSummary) => {
    const confirmed = window.confirm(`Delete "${collection.name}"? This can’t be undone.`);
    if (!confirmed) return;

    try {
      await deleteCollection.mutateAsync(collection.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete collection');
    }
  };

  if (isPending) {
    return (
      <div className="wrapper page">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-4"></div>
            <Text>Loading...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="wrapper page">
        <div className="text-center py-16">
          <LogIn className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <Text as="h1" variant="heading" className="mb-4">
            Sign in to manage collections
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create recipe collections to organize your favorites and plan your meals.
          </Text>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowSignInModal(true)}
              className="murakamicity-button flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => router.push('/recipes')}
              className="murakamicity-button-outline flex items-center gap-2"
            >
              Browse Recipes
            </button>
          </div>
        </div>

        {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
      </div>
    );
  }

  return (
    <div className="wrapper page">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <Heading title="My Collections" subTitle="Organize recipes your way" />
          <button
            onClick={() => setShowCreate((prev) => !prev)}
            className="murakamicity-button flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showCreate ? 'Close' : 'New Collection'}
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="murakamicity-card p-6 max-w-2xl">
            <h2 className="text-xl font-semibold text-primary mb-6">Create Collection</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Weekend Favorites"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Recipes I cook on repeat."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-10 w-16 border border-border rounded"
                />
              </div>
            </div>

            {formError && <p className="text-sm text-destructive mt-4">{formError}</p>}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={createCollection.isPending}
                className="murakamicity-button flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createCollection.isPending ? 'Creating...' : 'Create Collection'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="murakamicity-button-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <VerticalSpace space="16" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="murakamicity-card p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="text-center">
          <Text as="h2" className="text-destructive mb-4" variant="subheading">
            Failed to load collections
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            {errorMessage}
          </Text>
          <button onClick={() => window.location.reload()} className="murakamicity-button">
            Try Again
          </button>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <Text as="h2" variant="subheading" className="mb-4">
            No collections yet
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create a collection to group recipes by theme, occasion, or mood.
          </Text>
          <button
            onClick={() => setShowCreate(true)}
            className="murakamicity-button flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="murakamicity-card p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-3 w-3 rounded-full"
                      style={{ backgroundColor: collection.color || '#3B82F6' }}
                    />
                    <h3 className="text-lg font-semibold text-foreground">{collection.name}</h3>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {collection.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(collection)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Delete ${collection.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Folder className="w-4 h-4" />
                {collection.recipeCount} recipe{collection.recipeCount === 1 ? '' : 's'}
              </div>

              <div className="mt-auto flex gap-3">
                <button
                  onClick={() => router.push(`/collections/${collection.id}`)}
                  className="murakamicity-button-outline flex-1"
                >
                  View Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CollectionsPage() {
  return <CollectionsContent />;
}
