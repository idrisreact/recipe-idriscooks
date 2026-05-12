'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Plus, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useShoppingLists,
  useCreateShoppingList,
  useDeleteShoppingList,
  useClearCompletedItems,
  useToggleItemCompleted,
  useDeleteItem,
} from '@/src/hooks/use-shopping-list';

const formatQuantity = (quantity: number | string): string => {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return String(quantity);
  if (num % 1 === 0) return String(Math.round(num));
  return num.toFixed(1);
};

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
      const next = new Set(prev);
      if (next.has(listId)) next.delete(listId);
      else next.add(listId);
      return next;
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
    <main className="bg-[var(--cream)] min-h-screen">
      <section className="pt-36 lg:pt-40">
        <div className="wrapper pb-12 lg:pb-16">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-link mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <p className="eyebrow-rule">Shopping / Lists</p>
          <h1 className="display-m mt-6 max-w-3xl">
            The list, before the <span className="italic-tomato">market</span>.
          </h1>
          <p className="body-lg mt-6 max-w-2xl">
            Build a list from any recipe, tick things off as you go, and keep a clean record of
            what you actually bought.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="wrapper max-w-4xl">
          {isLoading ? (
            <LoadingState />
          ) : !lists || lists.length === 0 ? (
            <EmptyState onCreate={() => setShowNewListInput(true)} />
          ) : (
            <div className="flex flex-col gap-6">
              {lists.map((list) => {
                const isExpanded = expandedLists.has(list.id);
                const totalItems = list.items?.length || 0;
                const completedItems =
                  list.items?.filter((item) => item.isCompleted).length || 0;
                const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                return (
                  <article
                    key={list.id}
                    className="border-t border-[var(--ink)] bg-[var(--cream)]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleListExpanded(list.id)}
                      className="flex w-full items-start justify-between gap-6 px-1 pt-5 pb-4 text-left transition-colors hover:bg-[var(--parchment)]"
                    >
                      <div className="flex-1">
                        <p className="mono-label text-[var(--tomato)]">
                          {completedItems} / {totalItems} done
                        </p>
                        <h2 className="subhead mt-2">{list.name}</h2>
                      </div>
                      <div className="pt-2">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-[var(--ink-60)]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[var(--ink-60)]" />
                        )}
                      </div>
                    </button>

                    <div className="mt-2 h-px w-full bg-[var(--ink-line)]">
                      <motion.div
                        className="h-px bg-[var(--tomato)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {isExpanded && (
                      <div className="pt-6 pb-2">
                        {list.items && list.items.length > 0 ? (
                          <ul className="flex flex-col">
                            {list.items.map((item) => (
                              <li
                                key={item.id}
                                className="group flex items-center gap-4 border-b border-[var(--ink-line)] py-4"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleItem(item.id, item.isCompleted)}
                                  aria-label={
                                    item.isCompleted ? 'Mark as not done' : 'Mark as done'
                                  }
                                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center border transition-colors ${
                                    item.isCompleted
                                      ? 'border-[var(--ink)] bg-[var(--ink)]'
                                      : 'border-[var(--ink)] bg-transparent hover:bg-[var(--parchment)]'
                                  }`}
                                >
                                  {item.isCompleted && (
                                    <Check className="h-3.5 w-3.5 text-[var(--cream)]" />
                                  )}
                                </button>

                                <div className="flex-1">
                                  <p
                                    className={`body-md ${
                                      item.isCompleted
                                        ? 'text-[var(--ink-50)] line-through'
                                        : 'text-[var(--ink)]'
                                    }`}
                                  >
                                    <span className="mono-label mr-2 text-[var(--ink-60)]">
                                      {formatQuantity(item.quantity)}
                                      {item.unit && ` ${item.unit}`}
                                    </span>
                                    {item.name}
                                  </p>
                                  {item.category && (
                                    <p className="eyebrow mt-1 text-[var(--ink-50)]">
                                      {item.category}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  aria-label="Remove item"
                                  className="p-2 text-[var(--ink-50)] opacity-0 transition-opacity hover:text-[var(--tomato)] group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="body-sm py-8 text-center">
                            No items in this list yet.
                          </p>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--ink-line)] pt-6">
                          <button
                            type="button"
                            onClick={() => handleClearCompleted(list.id)}
                            disabled={completedItems === 0}
                            className="btn-link disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            Clear completed
                          </button>
                          <span className="text-[var(--ink-line)]">/</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteList(list.id)}
                            className="btn-link"
                            style={{ color: 'var(--tomato)' }}
                          >
                            Delete list
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {showNewListInput ? (
            <div className="mt-10 border-t border-[var(--ink)] pt-8">
              <p className="eyebrow">New list</p>
              <h3 className="subhead mt-3">Name your list.</h3>
              {createError && (
                <p className="mono-label mt-4 text-[var(--tomato)]">{createError}</p>
              )}
              <input
                type="text"
                value={newListName}
                onChange={(e) => {
                  setNewListName(e.target.value);
                  setCreateError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                placeholder="e.g. Sunday roast"
                className="mt-6 w-full border-b border-[var(--ink)] bg-transparent py-3 text-lg text-[var(--ink)] placeholder-[var(--ink-50)] outline-none focus:border-[var(--tomato)]"
                autoFocus
              />
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleCreateList}
                  disabled={!newListName.trim()}
                  className="btn-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create list
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewListInput(false);
                    setNewListName('');
                    setCreateError(null);
                  }}
                  className="btn-link"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            lists &&
            lists.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNewListInput(true)}
                className="mt-10 flex w-full items-center justify-center gap-3 border border-dashed border-[var(--ink)] px-6 py-8 transition-colors hover:bg-[var(--parchment)]"
              >
                <Plus className="h-4 w-4 text-[var(--ink)]" />
                <span className="mono-label text-[var(--ink)]">Add another list</span>
              </button>
            )
          )}
        </div>
      </section>
    </main>
  );
}

const LoadingState = () => (
  <div className="flex flex-col gap-6 py-8">
    {[0, 1, 2].map((i) => (
      <div key={i} className="border-t border-[var(--ink-line)] pt-5">
        <div className="h-3 w-20 animate-pulse bg-[var(--parchment)]" />
        <div className="mt-3 h-7 w-2/3 animate-pulse bg-[var(--parchment)]" />
        <div className="mt-5 h-px w-full bg-[var(--ink-line)]" />
      </div>
    ))}
  </div>
);

const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="border-t border-[var(--ink)] py-16 text-center">
    <p className="eyebrow">No lists yet</p>
    <h2 className="display-s mt-4">
      Start with a <span className="italic-tomato">single list</span>.
    </h2>
    <p className="body-lg mx-auto mt-6 max-w-md">
      Build a list from any recipe, or write one from scratch for tonight&apos;s dinner.
    </p>
    <button type="button" onClick={onCreate} className="btn-ink mt-10">
      Create your first list
      <Plus className="h-4 w-4" />
    </button>
  </div>
);
