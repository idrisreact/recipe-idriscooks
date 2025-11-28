'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  useShoppingLists,
  useCreateShoppingList,
  useAddRecipeToShoppingList,
} from '@/src/hooks/use-shopping-list';
import { useAuth } from '../auth/auth-components';

interface AddToShoppingListButtonProps {
  recipeId: number;
  recipeName?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
}

export default function AddToShoppingListButton({
  recipeId,
  recipeName,
  variant = 'secondary',
  className = '',
}: AddToShoppingListButtonProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [showListSelector, setShowListSelector] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: lists } = useShoppingLists();
  const createList = useCreateShoppingList();
  const addToList = useAddRecipeToShoppingList();

  const handleAddToList = async (listId: string) => {
    try {
      setIsAdding(true);
      await addToList.mutateAsync({ listId, recipeId });
      setShowListSelector(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: unknown) {
      console.error('Failed to add to shopping list:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add to shopping list';
      if (errorMessage.includes('already been added')) {
        alert('This recipe is already in that shopping list!');
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateAndAdd = async () => {
    try {
      setIsAdding(true);
      const baseName: string = recipeName ? `${recipeName} Ingredients` : 'New Shopping List';

      // Try to create the list, if it fails due to duplicate name, try with a number suffix
      const listName = baseName;
      let attemptCount = 0;
      let newList;

      while (!newList && attemptCount < 10) {
        try {
          newList = await createList.mutateAsync({
            name: attemptCount === 0 ? listName : `${baseName} (${attemptCount})`,
          });
        } catch (err: unknown) {
          if (err instanceof Error && err.message?.includes('already exists')) {
            attemptCount++;
          } else {
            throw err;
          }
        }
      }

      if (!newList) {
        throw new Error('Could not create a unique list name');
      }

      await addToList.mutateAsync({ listId: newList.id, recipeId });
      setShowListSelector(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: unknown) {
      console.error('Failed to create list and add recipe:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add to shopping list';
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
      {/* Main Button */}
      <button
        onClick={() => {
          if (showSuccess) {
            router.push('/shopping-list');
          } else {
            setShowListSelector(!showListSelector);
          }
        }}
        className={`${baseButtonClasses} ${variantClasses[variant]} ${className}`}
        disabled={isAdding}
      >
        {showSuccess ? (
          <>
            <Check className="w-5 h-5" />
            {variant !== 'icon' && <span>View Shopping List</span>}
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            {variant !== 'icon' && <span>Add to Shopping List</span>}
          </>
        )}
      </button>

      {/* List Selector Dropdown */}
      <AnimatePresence>
        {showListSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-64 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/10">
              <p className="text-xs uppercase tracking-wide text-white/50 font-bold">
                Select Shopping List
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {lists && lists.length > 0 ? (
                <div className="p-2">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleAddToList(list.id)}
                      disabled={isAdding}
                      className="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {list.name}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Create New List Option */}
              <div className="border-t border-white/10 p-2">
                <button
                  onClick={handleCreateAndAdd}
                  disabled={isAdding}
                  className="w-full px-3 py-2 text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Create New List
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

      {/* Click outside handler */}
      {showListSelector && (
        <div className="fixed inset-0 z-40" onClick={() => setShowListSelector(false)} />
      )}
    </div>
  );
}
