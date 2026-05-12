'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, ShoppingCart, Plus, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useShoppingLists,
  useCreateShoppingList,
  useDeleteShoppingList,
  useClearCompletedItems,
  useToggleItemCompleted,
  useDeleteItem,
} from '@/src/hooks/use-shopping-list';

// Helper function to format quantity display
function formatQuantity(quantity: number | string): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return String(quantity);

  // If it's a whole number, return without decimal
  if (num % 1 === 0) return String(Math.round(num));

  // Otherwise, round to 1 decimal place
  return num.toFixed(1);
}

export default function ShoppingListPage() {
  const router = useRouter();
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());
  const [newListName, setNewListName] = useState('');
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: lists, isLoading } = useShoppingLists();
  const createList = useCreateShoppingList();
  const deleteList = useDeleteShoppingList();
  const clearCompleted = useClearCompletedItems();
  const toggleItem = useToggleItemCompleted();
  const deleteItem = useDeleteItem();

  const toggleListExpanded = (listId: string) => {
    setExpandedLists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      setCreateError(null);
      await createList.mutateAsync({ name: newListName });
      setNewListName('');
      setShowNewListInput(false);
    } catch (error: unknown) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create shopping list');
    }
  };

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    await toggleItem.mutateAsync({ itemId, isCompleted: !currentStatus });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Remove this item?')) {
      await deleteItem.mutateAsync(itemId);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Delete this shopping list?')) {
      await deleteList.mutateAsync(listId);
    }
  };

  const handleClearCompleted = async (listId: string) => {
    if (confirm('Clear all completed items?')) {
      await clearCompleted.mutateAsync(listId);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="wrapper py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-[var(--primary)]" />
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-white">
                Shopping Lists
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : !lists || lists.length === 0 ? (
            <div className="luxury-card p-12 text-center">
              <ShoppingCart className="w-24 h-24 text-white/20 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No shopping lists yet</h2>
              <p className="text-white/50 mb-8">
                Create your first shopping list to start organizing your ingredients
              </p>
              <button
                onClick={() => setShowNewListInput(true)}
                className="px-8 py-4 bg-[var(--primary)] text-white font-bold uppercase tracking-wide rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
              >
                Create Your First List
              </button>
            </div>
          ) : (
            <>
              {lists.map((list) => {
                const isExpanded = expandedLists.has(list.id);
                const totalItems = list.items?.length || 0;
                const completedItems = list.items?.filter((item) => item.isCompleted).length || 0;
                const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                return (
                  <div key={list.id} className="luxury-card p-0 overflow-hidden">
                    {/* List Header */}
                    <div
                      className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleListExpanded(list.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-bold text-white">{list.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-lg text-white/50">
                            {completedItems}/{totalItems}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-white/50" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-white/50" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[var(--primary)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* List Items */}
                    {isExpanded && (
                      <div className="border-t border-white/10">
                        {list.items && list.items.length > 0 ? (
                          <div className="p-6 space-y-2">
                            {list.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors group"
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={() => handleToggleItem(item.id, item.isCompleted)}
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                    item.isCompleted
                                      ? 'bg-[var(--primary)] border-[var(--primary)]'
                                      : 'border-white/30 hover:border-[var(--primary)]'
                                  }`}
                                >
                                  {item.isCompleted && <Check className="w-4 h-4 text-white" />}
                                </button>

                                {/* Item Details */}
                                <div className="flex-1">
                                  <p
                                    className={`text-base ${
                                      item.isCompleted
                                        ? 'text-white/40 line-through'
                                        : 'text-white/90'
                                    }`}
                                  >
                                    {formatQuantity(item.quantity)} {item.unit && `${item.unit} `}
                                    {item.name}
                                  </p>
                                  {item.category && (
                                    <p className="text-xs text-white/40 mt-1">{item.category}</p>
                                  )}
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded flex-shrink-0"
                                >
                                  <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="p-6 text-center text-white/40 text-sm">
                            No items in this list
                          </p>
                        )}

                        {/* List Actions */}
                        <div className="p-6 border-t border-white/10 flex gap-3">
                          <button
                            onClick={() => handleClearCompleted(list.id)}
                            disabled={completedItems === 0}
                            className="flex-1 px-6 py-3 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wide"
                          >
                            Clear Completed
                          </button>
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            className="px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors uppercase tracking-wide"
                          >
                            Delete List
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* New List Input */}
          {showNewListInput ? (
            <div className="luxury-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Create New List</h3>
              {createError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{createError}</p>
                </div>
              )}
              <input
                type="text"
                value={newListName}
                onChange={(e) => {
                  setNewListName(e.target.value);
                  setCreateError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                placeholder="List name..."
                className="w-full bg-black/50 border border-white/20 text-white placeholder-white/40 px-4 py-3 rounded-lg focus:outline-none focus:border-[var(--primary)] mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateList}
                  disabled={!newListName.trim()}
                  className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  Create List
                </button>
                <button
                  onClick={() => {
                    setShowNewListInput(false);
                    setNewListName('');
                    setCreateError(null);
                  }}
                  className="px-6 py-3 text-white/70 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wide font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            lists &&
            lists.length > 0 && (
              <button
                onClick={() => setShowNewListInput(true)}
                className="w-full p-6 border-2 border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:border-[var(--primary)] transition-colors flex items-center justify-center gap-3 font-bold uppercase tracking-wide"
              >
                <Plus className="w-6 h-6" />
                Create New List
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
