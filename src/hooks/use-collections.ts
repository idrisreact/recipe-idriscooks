import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/components/auth/auth-components';
import { Recipe } from '@/src/types/recipes.types';

export interface CollectionSummary {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isPublic: boolean;
  isDefault: boolean;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  recipeCount: number;
}

export interface CollectionItemWithRecipe {
  id: string;
  collectionId: string;
  recipeId: number;
  addedAt: Date;
  notes?: string | null;
  sortOrder: number;
  recipe: Recipe;
}

export interface CollectionDetailResponse {
  collection: CollectionSummary;
  items: CollectionItemWithRecipe[];
}

export function useCollections() {
  const { session } = useAuth();

  return useQuery<CollectionSummary[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await fetch('/api/collections');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch collections');
      }
      return response.json();
    },
    enabled: !!session,
  });
}

export function useCollection(collectionId: string) {
  const { session } = useAuth();

  return useQuery<CollectionDetailResponse>({
    queryKey: ['collection', collectionId],
    queryFn: async () => {
      const response = await fetch(`/api/collections/${collectionId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch collection');
      }
      return response.json();
    },
    enabled: !!session && !!collectionId,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      color?: string;
      isPublic?: boolean;
      tags?: string[];
    }) => {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create collection');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string }) => {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update collection');
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', variables.id] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete collection');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useAddRecipeToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, recipeId }: { collectionId: string; recipeId: number }) => {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add recipe to collection');
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
    },
  });
}

export function useRemoveRecipeFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, recipeId }: { collectionId: string; recipeId: number }) => {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove recipe from collection');
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
    },
  });
}
