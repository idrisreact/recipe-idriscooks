'use client';

import { Lock, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRecipeAccessPrice, getSavingsDisplay, PRICING } from '@/src/config/pricing';
import { useCheckout } from '@/src/hooks/use-checkout';
import { useAuth } from '@/src/components/auth/auth-components';

interface RecipeAccessButtonProps {
  hasAccess: boolean;
}

export function RecipeAccessButton({ hasAccess }: RecipeAccessButtonProps) {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { isLoading, initiateCheckout } = useCheckout({
    checkoutUrl: '/api/stripe/checkout/recipe-access',
    onError: (error) => {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    },
  });

  const handleClick = () => {
    if (!session) {
      router.push('/sign-up');
      return;
    }
    initiateCheckout();
  };

  if (hasAccess) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
        <Check className="w-5 h-5" />
        <span>You have full access</span>
      </div>
    );
  }

  const pricing = getRecipeAccessPrice();
  const savings = getSavingsDisplay();
  const isSpecial = PRICING.recipeAccess.isLaunchSpecial;

  return (
    <div className="space-y-2 w-full">
      {isSpecial && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-semibold">
            {'badge' in pricing ? pricing.badge : '🎉 Limited Time'} • Save {savings}
          </span>
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={isLoading || authLoading}
        className="w-full flex flex-col items-center gap-1 px-6 py-4 bg-[var(--primary)] text-white rounded-lg font-bold hover:bg-[var(--primary-dark)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          <span className="text-lg uppercase tracking-wide">
            {isLoading || authLoading ? 'Loading...' : `Get Full Access - ${pricing.display}`}
          </span>
        </div>
        {isSpecial && (
          <span className="text-white/80 text-xs line-through">
            Regular: {PRICING.recipeAccess.regular.display}
          </span>
        )}
      </button>
    </div>
  );
}
