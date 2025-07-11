import { useState, useEffect } from 'react';
import { FavoriteRecipeWithRecipe, AddToFavoritesRequest, RemoveFromFavoritesRequest } from '../types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipeWithRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/favorites');
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      
      const data = await response.json();
      setFavorites(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (recipeId: number) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId } as AddToFavoritesRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to add to favorites');
      }

      // Refresh the favorites list
      await fetchFavorites();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (recipeId: number) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId } as RemoveFromFavoritesRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      // Refresh the favorites list
      await fetchFavorites();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from favorites');
    }
  };

  const isFavorited = (recipeId: number) => {
    return favorites.some(favorite => favorite.recipeId === recipeId);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    refetch: fetchFavorites,
  };
} 