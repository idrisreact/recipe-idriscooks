import { useState, useCallback } from 'react';

interface UseToggleSetReturn<T> {
  items: Set<T>;
  toggle: (item: T) => void;
  add: (item: T) => void;
  remove: (item: T) => void;
  has: (item: T) => boolean;
  clear: () => void;
  toggleAll: (allItems: T[], shouldAdd: boolean) => void;
}

export function useToggleSet<T>(initialItems: T[] = []): UseToggleSetReturn<T> {
  const [items, setItems] = useState<Set<T>>(new Set(initialItems));

  const toggle = useCallback((item: T) => {
    setItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  const add = useCallback((item: T) => {
    setItems((prev) => {
      const newSet = new Set(prev);
      newSet.add(item);
      return newSet;
    });
  }, []);

  const remove = useCallback((item: T) => {
    setItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(item);
      return newSet;
    });
  }, []);

  const has = useCallback(
    (item: T) => {
      return items.has(item);
    },
    [items]
  );

  const clear = useCallback(() => {
    setItems(new Set());
  }, []);

  const toggleAll = useCallback((allItems: T[], shouldAdd: boolean) => {
    setItems((prev) => {
      const newSet = new Set(prev);
      allItems.forEach((item) => {
        if (shouldAdd) {
          newSet.add(item);
        } else {
          newSet.delete(item);
        }
      });
      return newSet;
    });
  }, []);

  return {
    items,
    toggle,
    add,
    remove,
    has,
    clear,
    toggleAll,
  };
}
