'use client';

import { useRouter } from 'next/navigation';
import { useCheckout } from '@/src/hooks/use-checkout';
import { useAuth } from '@/src/components/auth/auth-components';
import { getRecipeAccessPrice } from '@/src/config/pricing';

/** Editorial checkout CTA for the lifetime access offer. */
export const LifetimeCheckoutButton = () => {
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
      router.push('/sign-up?redirect=/pricing');
      return;
    }
    initiateCheckout();
  };

  const pricing = getRecipeAccessPrice();

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || authLoading}
      className="btn-tomato w-full disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading || authLoading ? 'One moment…' : `Get lifetime access — ${pricing.display}`}
    </button>
  );
};
