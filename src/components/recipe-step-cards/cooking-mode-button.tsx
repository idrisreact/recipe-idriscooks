'use client';

import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { RecipeStepCards, type RecipeStep } from './recipe-step-cards';

interface CookingModeButtonProps {
  steps: RecipeStep[];
  className?: string;
}

export function CookingModeButton({ steps, className = '' }: CookingModeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-6 py-3 bg-[#F20094] hover:bg-[#d1007d] text-white rounded-lg font-semibold transition-colors ${className}`}
      >
        <ChefHat className="w-5 h-5" />
        <span>Start Cooking Mode</span>
      </button>

      {isOpen && (
        <RecipeStepCards
          steps={steps}
          onClose={() => setIsOpen(false)}
          onComplete={() => {
            console.log('Recipe completed!');
            // Could add confetti or celebration animation here
          }}
        />
      )}
    </>
  );
}
