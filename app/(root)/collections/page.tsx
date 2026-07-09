'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/src/utils/auth-client';
import { SignInModal } from '@/src/components/auth/sign-in-modal/SignInModal';
import { PageHeader } from '@/src/components/ui/page-header';
import { EmptyState } from '@/src/components/ui/empty-state';
import { SkeletonGrid } from '@/src/components/ui/skeleton';
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
} from '@/src/hooks/use-collections';
import type { CollectionSummary } from '@/src/hooks/use-collections';

const SWATCHES = ['#C8472D', '#6B7548', '#1C1A17', '#8B7355', '#F5B7A3'];

function CollectionsContent() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { data: collections = [], isLoading, error } = useCollections();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
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
      setColor(SWATCHES[0]);
      setShowCreate(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create collection');
    }
  };

  const handleDelete = async (collection: CollectionSummary) => {
    const confirmed = window.confirm(`Delete "${collection.name}"? This can't be undone.`);
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
        <SkeletonGrid count={4} itemClassName="h-24" className="flex flex-col gap-8" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="wrapper page">
        <PageHeader
          eyebrow="The archive"
          title="Collections"
          description="Group recipes by theme, occasion, or mood — your own chapters of the cookbook."
        />
        <EmptyState
          eyebrow="Sign in required"
          title={
            <>
              Your chapters are waiting to be{' '}
              <span className="italic text-[var(--tomato)]">written</span>.
            </>
          }
          description="Sign in to create collections and organize the recipes you cook most."
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

  return (
    <div className="wrapper page">
      <PageHeader
        eyebrow="The archive"
        title="Collections"
        description="Group recipes by theme, occasion, or mood — your own chapters of the cookbook."
        aside={
          <button type="button" onClick={() => setShowCreate((prev) => !prev)} className="btn-ink">
            {showCreate ? 'Close' : 'New collection'}
          </button>
        }
      />

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-8 bg-[var(--parchment)] p-8 md:p-10 max-w-2xl"
        >
          <span className="eyebrow-rule">New collection</span>

          <div className="flex flex-col gap-3">
            <label htmlFor="collection-name" className="field-label">
              Name
            </label>
            <input
              id="collection-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="field-input"
              placeholder="Weekend favorites"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="collection-description" className="field-label">
              Description <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="collection-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="field-input resize-none"
              placeholder="Recipes I cook on repeat."
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="field-label">Marker</span>
            <div className="flex gap-3">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  aria-label={`Use color ${swatch}`}
                  aria-pressed={color === swatch}
                  className="h-8 w-8 border transition-transform"
                  style={{
                    backgroundColor: swatch,
                    borderColor: color === swatch ? 'var(--ink)' : 'transparent',
                    transform: color === swatch ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {formError && <p className="field-error">{formError}</p>}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createCollection.isPending}
              className="btn-ink disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {createCollection.isPending ? 'Creating…' : 'Create collection'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-link">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <SkeletonGrid count={4} itemClassName="h-24" className="flex flex-col gap-8" />
      ) : errorMessage ? (
        <EmptyState
          eyebrow="Something went wrong"
          title="The archive wouldn't open."
          description={errorMessage}
          action={
            <button type="button" onClick={() => window.location.reload()} className="btn-ink">
              Try again
            </button>
          }
        />
      ) : collections.length === 0 ? (
        <EmptyState
          eyebrow="Empty shelf"
          title={
            <>
              No collections <span className="italic text-[var(--tomato)]">yet</span>.
            </>
          }
          description="Create a collection to group recipes by theme, occasion, or mood."
          action={
            <button type="button" onClick={() => setShowCreate(true)} className="btn-ink">
              Create your first collection
            </button>
          }
        />
      ) : (
        <ol className="flex flex-col">
          {collections.map((collection, index) => (
            <li
              key={collection.id}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-6 border-t border-[var(--ink-line)] py-8 last:border-b"
            >
              <span className="mono-label flex items-center gap-4">
                {String(index + 1).padStart(2, '0')}
                <span
                  className="inline-block h-2.5 w-2.5"
                  style={{ backgroundColor: collection.color || SWATCHES[0] }}
                  aria-hidden="true"
                />
              </span>
              <div className="flex flex-col gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => router.push(`/collections/${collection.id}`)}
                  className="text-left font-serif text-3xl md:text-4xl leading-tight text-[var(--ink)] transition-colors group-hover:text-[var(--tomato)]"
                >
                  {collection.name}
                </button>
                {collection.description && (
                  <p className="text-sm text-[var(--ink-65)] max-w-xl">{collection.description}</p>
                )}
                <p className="mono-label">
                  {collection.recipeCount} recipe{collection.recipeCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => router.push(`/collections/${collection.id}`)}
                  className="btn-link"
                >
                  Open →
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(collection)}
                  className="text-sm text-[var(--ink-50)] transition-colors hover:text-[var(--tomato)]"
                  aria-label={`Delete ${collection.name}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function CollectionsPage() {
  return <CollectionsContent />;
}
