import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/components/auth/auth-components';

interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: string;
  unit: string | null;
  category: string | null;
  estimatedPrice: string | null;
  actualPrice: string | null;
  isCompleted: boolean;
  isPriority: boolean;
  notes: string | null;
  recipeIds: number[] | null;
  sortOrder: number;
  completedAt: Date | null;
  createdAt: Date;
}

interface ShoppingList {
  id: string;
  userId: string;
  mealPlanId: string | null;
  name: string;
  status: string;
  estimatedCost: string | null;
  actualCost: string | null;
  store: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  items?: ShoppingListItem[];
}

export function useShoppingLists() {
  const { session } = useAuth();

  return useQuery<ShoppingList[]>({
    queryKey: ['shopping-lists'],
    queryFn: async () => {
      const response = await fetch('/api/shopping-list');
      if (!response.ok) throw new Error('Failed to fetch shopping lists');
      return response.json();
    },
    enabled: !!session,
  });
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; mealPlanId?: string }) => {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create shopping list');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      const response = await fetch(`/api/shopping-list/${listId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete shopping list');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useClearCompletedItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      const response = await fetch(`/api/shopping-list/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clearCompleted' }),
      });
      if (!response.ok) throw new Error('Failed to clear completed items');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useAddRecipeToShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, recipeId }: { listId: string; recipeId: number }) => {
      const response = await fetch(`/api/shopping-list/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add recipe to shopping list');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useToggleItemCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) => {
      const response = await fetch(`/api/shopping-list/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      });
      if (!response.ok) throw new Error('Failed to toggle item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/shopping-list/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}
