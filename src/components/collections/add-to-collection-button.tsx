'use client';

import { useState } from 'react';
import { Bookmark, Check, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  useCollections,
  useCreateCollection,
  useAddRecipeToCollection,
} from '@/src/hooks/use-collections';
import { useAuth } from '@/src/components/auth/auth-components';

interface AddToCollectionButtonProps {
  recipeId: number;
  recipeName?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
}

export default function AddToCollectionButton({
  recipeId,
  recipeName,
  variant = 'secondary',
  className = '',
}: AddToCollectionButtonProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [showSelector, setShowSelector] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: collections } = useCollections();
  const createCollection = useCreateCollection();
  const addToCollection = useAddRecipeToCollection();

  const handleAddToCollection = async (collectionId: string) => {
    try {
      setIsAdding(true);
      await addToCollection.mutateAsync({ collectionId, recipeId });
      setShowSelector(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: unknown) {
      console.error('Failed to add recipe to collection:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add recipe to collection';
      alert(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateAndAdd = async () => {
    try {
      setIsAdding(true);
      const baseName = recipeName ? `${recipeName} Collection` : 'New Collection';
      let attemptCount = 0;
      let newCollection;

      while (!newCollection && attemptCount < 10) {
        try {
          newCollection = await createCollection.mutateAsync({
            name: attemptCount === 0 ? baseName : `${baseName} (${attemptCount})`,
          });
        } catch (err: unknown) {
          if (err instanceof Error && err.message?.includes('already exists')) {
            attemptCount++;
          } else {
            throw err;
          }
        }
      }

      if (!newCollection) {
        throw new Error('Could not create a unique collection name');
      }

      await addToCollection.mutateAsync({ collectionId: newCollection.id, recipeId });
      setShowSelector(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: unknown) {
      console.error('Failed to create collection:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add recipe to collection';
      alert(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  if (!session) return null;

  const baseButtonClasses =
    'relative flex items-center gap-2 font-bold uppercase tracking-wide transition-all';

  const variantClasses = {
    primary: 'px-6 py-3 bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] rounded-lg',
    secondary:
      'px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-black rounded-lg',
    icon: 'p-3 rounded-full hover:bg-white/10',
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (showSuccess) {
            router.push('/collections');
          } else {
            setShowSelector(!showSelector);
          }
        }}
        className={`${baseButtonClasses} ${variantClasses[variant]} ${className}`}
        disabled={isAdding}
      >
        {showSuccess ? (
          <>
            <Check className="w-5 h-5" />
            {variant !== 'icon' && <span>View Collections</span>}
          </>
        ) : (
          <>
            <Bookmark className="w-5 h-5" />
            {variant !== 'icon' && <span>Add to Collection</span>}
          </>
        )}
      </button>

      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-64 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/10">
              <p className="text-xs uppercase tracking-wide text-white/50 font-bold">
                Select Collection
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {collections && collections.length > 0 ? (
                <div className="p-2">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollection(collection.id)}
                      disabled={isAdding}
                      className="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span
                        className="inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: collection.color || '#3B82F6' }}
                      />
                      {collection.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-xs text-white/50">No collections yet.</div>
              )}

              <div className="border-t border-white/10 p-2">
                <button
                  onClick={handleCreateAndAdd}
                  disabled={isAdding}
                  className="w-full px-3 py-2 text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  Create New Collection
                </button>
              </div>
            </div>

            {isAdding && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--primary)] border-t-transparent" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showSelector && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSelector(false)} />
      )}
    </div>
  );
}
