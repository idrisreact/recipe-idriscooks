'use client';

import { useState } from 'react';
import { Lock, Check } from 'lucide-react';

interface RecipeAccessButtonProps {
  hasAccess: boolean;
}

export function RecipeAccessButton({ hasAccess }: RecipeAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/stripe/checkout/recipe-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  if (hasAccess) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
        <Check className="w-5 h-5" />
        <span>You have full access</span>
      </div>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-bold uppercase tracking-wide hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Lock className="w-5 h-5" />
      <span>{isLoading ? 'Loading...' : 'Get Full Access - £10'}</span>
    </button>
  );
}
