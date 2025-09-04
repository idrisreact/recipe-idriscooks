'use client';
import { Recipe } from '@/src/types/recipes.types';
import { X, Clock, Users, Heart, Share2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Text } from '@/src/components/ui/Text';
import { useState, useEffect, useRef } from 'react';
import { authClient } from '@/src/utils/auth-client';
import { SignInOverlay } from './sign-in-overlay';

interface RecipePreviewModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onFavorite: (recipeId: number) => void | Promise<void>;
  isFavorited: boolean;
  onNavigate: (recipe: Recipe) => void;
}

export const RecipePreviewModal = ({
  recipe,
  isOpen,
  onClose,
  onFavorite,
  isFavorited,
  onNavigate,
}: RecipePreviewModalProps) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const { data: session } = authClient.useSession();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab') {
          if (focusableElements.length === 0) return;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleKeyDown);
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !recipe) return null;

  const shareRecipe = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.origin + `/recipes/category/${recipe.title}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${recipe.title} - ${window.location.origin}/recipes/category/${recipe.title}`
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-preview-title"
      >
        {!session && <SignInOverlay onClose={onClose} />}
        {}
        <div
          className="relative h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${recipe.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => await onFavorite(recipe.id)}
              className="murakamicity-button-outline bg-background/90 hover:bg-background"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorited ? 'fill-primary text-primary' : 'text-foreground'
                }`}
              />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={shareRecipe}
              className="murakamicity-button-outline bg-background/90 hover:bg-background"
            >
              <Share2 className="w-4 h-4 text-foreground" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onClose}
              className="murakamicity-button-outline bg-background/90 hover:bg-background"
            >
              <X className="w-4 h-4 text-foreground" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <Text as="h2" className="text-2xl font-bold mb-2">
              {recipe.title}
            </Text>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.cookTime}m
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings} servings
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          <Text className="text-muted-foreground mb-6">{recipe.description}</Text>

          {}
          <div className="flex gap-4 mb-4 border-b border-border">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'ingredients'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('steps')}
              className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'steps'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Steps
            </button>
          </div>

          {}
          {activeTab === 'ingredients' && (
            <div>
              <Text as="h3" className="font-semibold mb-3">
                Ingredients
              </Text>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <Text className="text-foreground">
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </Text>
                  </li>
                )) || <Text className="text-muted-foreground">No ingredients listed</Text>}
              </ul>
            </div>
          )}

          {activeTab === 'steps' && (
            <div>
              <Text as="h3" className="font-semibold mb-3">
                Instructions
              </Text>
              <ol className="space-y-3">
                {recipe.steps?.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <Text className="text-foreground">{step}</Text>
                  </li>
                )) || <Text className="text-muted-foreground">No steps listed</Text>}
              </ol>
            </div>
          )}

          {}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-6">
              <Text as="h3" className="font-semibold mb-2">
                Tags
              </Text>
              <div className="flex gap-2 flex-wrap">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {}
        <div className="p-6 border-t border-border bg-muted">
          <div className="flex gap-3">
            <Button onClick={() => onNavigate(recipe)} className="flex-1 murakamicity-button">
              <BookOpen className="w-4 h-4 mr-2" />
              View Full Recipe
            </Button>
            <Button variant="outline" onClick={onClose} className="murakamicity-button-outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
