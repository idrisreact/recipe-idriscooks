import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  FavoriteRecipeWithRecipe,
  AddToFavoritesRequest,
  RemoveFromFavoritesRequest,
} from '../types';

interface PaginatedFavoritesResponse {
  data: FavoriteRecipeWithRecipe[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const FAVORITES_PAGE_SIZE = 20;

export function useFavorites() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const {
    data: response,
    isLoading: loading,
    error: queryError,
  } = useQuery<PaginatedFavoritesResponse>({
    queryKey: ['favorites', page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(FAVORITES_PAGE_SIZE),
        offset: String(page * FAVORITES_PAGE_SIZE),
      });
      const res = await fetch(`/api/favorites?${params}`);
      if (!res.ok) {
        throw new Error('Failed to fetch favorites');
      }
      return res.json();
    },
    placeholderData: keepPreviousData,
  });

  const addMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId } as AddToFavoritesRequest),
      });
      if (!res.ok) {
        throw new Error('Failed to add to favorites');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId } as RemoveFromFavoritesRequest),
      });
      if (!res.ok) {
        throw new Error('Failed to remove from favorites');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const favorites = response?.data ?? [];
  const total = response?.total ?? 0;
  const hasMore = response?.hasMore ?? false;
  const error =
    queryError?.message ?? addMutation.error?.message ?? removeMutation.error?.message ?? null;

  const isFavorited = useCallback(
    (recipeId: number) => favorites.some((fav) => fav.recipeId === recipeId),
    [favorites]
  );

  const addToFavorites = useCallback(
    (recipeId: number) => addMutation.mutateAsync(recipeId),
    [addMutation]
  );

  const removeFromFavorites = useCallback(
    (recipeId: number) => removeMutation.mutateAsync(recipeId),
    [removeMutation]
  );

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    page,
    setPage,
    total,
    hasMore,
  };
}
