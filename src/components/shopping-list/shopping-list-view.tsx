'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, ShoppingCart, Plus, ChevronDown, ChevronUp } from 'lucide-react';
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

interface ShoppingListViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingListView({ isOpen, onClose }: ShoppingListViewProps) {
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());
  const [newListName, setNewListName] = useState('');
  const [showNewListInput, setShowNewListInput] = useState(false);

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
    await createList.mutateAsync({ name: newListName });
    setNewListName('');
    setShowNewListInput(false);
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#0a0a0a] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-[#111] to-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-[var(--primary)]" />
                <h2 className="text-2xl font-black uppercase tracking-wider text-white">
                  Shopping Lists
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
                </div>
              ) : !lists || lists.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 mb-6">No shopping lists yet</p>
                  <button
                    onClick={() => setShowNewListInput(true)}
                    className="px-6 py-3 bg-[var(--primary)] text-white font-bold uppercase tracking-wide rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
                  >
                    Create Your First List
                  </button>
                </div>
              ) : (
                <>
                  {lists.map((list) => {
                    const isExpanded = expandedLists.has(list.id);
                    const totalItems = list.items?.length || 0;
                    const completedItems =
                      list.items?.filter((item) => item.isCompleted).length || 0;
                    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                    return (
                      <div key={list.id} className="luxury-card p-0 overflow-hidden">
                        {/* List Header */}
                        <div
                          className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => toggleListExpanded(list.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-white">{list.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white/50">
                                {completedItems}/{totalItems}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-white/50" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-white/50" />
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[var(--primary)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>

                        {/* List Items */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-white/10"
                            >
                              {list.items && list.items.length > 0 ? (
                                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                                  {list.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                      {/* Checkbox */}
                                      <button
                                        onClick={() => handleToggleItem(item.id, item.isCompleted)}
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                          item.isCompleted
                                            ? 'bg-[var(--primary)] border-[var(--primary)]'
                                            : 'border-white/30 hover:border-[var(--primary)]'
                                        }`}
                                      >
                                        {item.isCompleted && (
                                          <Check className="w-3 h-3 text-white" />
                                        )}
                                      </button>

                                      {/* Item Details */}
                                      <div className="flex-1">
                                        <p
                                          className={`text-sm ${
                                            item.isCompleted
                                              ? 'text-white/40 line-through'
                                              : 'text-white/90'
                                          }`}
                                        >
                                          {formatQuantity(item.quantity)}{' '}
                                          {item.unit && `${item.unit} `}
                                          {item.name}
                                        </p>
                                      </div>

                                      {/* Delete Button */}
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="p-4 text-center text-white/40 text-sm">
                                  No items in this list
                                </p>
                              )}

                              {/* List Actions */}
                              <div className="p-4 border-t border-white/10 flex gap-2">
                                <button
                                  onClick={() => handleClearCompleted(list.id)}
                                  disabled={completedItems === 0}
                                  className="flex-1 px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  Clear Completed
                                </button>
                                <button
                                  onClick={() => handleDeleteList(list.id)}
                                  className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  Delete List
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </>
              )}

              {/* New List Input */}
              {showNewListInput ? (
                <div className="luxury-card p-4">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                    placeholder="List name..."
                    className="w-full bg-transparent border-b border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[var(--primary)] mb-3 pb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateList}
                      disabled={!newListName.trim()}
                      className="flex-1 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewListInput(false);
                        setNewListName('');
                      }}
                      className="px-4 py-2 text-white/70 hover:bg-white/5 rounded-lg transition-colors"
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
                    className="w-full p-4 border-2 border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:border-[var(--primary)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    New List
                  </button>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
