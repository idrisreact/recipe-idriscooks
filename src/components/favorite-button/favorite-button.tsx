import { useState } from "react";
import { Heart, HeartOff } from "lucide-react";
import { useFavorites } from "../../hooks/use-favorites";

interface FavoriteButtonProps {
  recipeId: number;
  className?: string;
  size?: number;
}

export function FavoriteButton({
  recipeId,
  className = "",
  size = 24,
}: FavoriteButtonProps) {
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async () => {
    setIsLoading(true);

    try {
      if (isFavorited(recipeId)) {
        await removeFromFavorites(recipeId);
      } else {
        await addToFavorites(recipeId);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const favorited = isFavorited(recipeId);

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`transition-colors duration-200 hover:scale-110 ${
        favorited
          ? "text-red-500 hover:text-red-600"
          : "text-gray-400 hover:text-red-500"
      } ${className}`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      {favorited ? (
        <Heart size={size} fill="currentColor" />
      ) : (
        <HeartOff size={size} />
      )}
    </button>
  );
}
