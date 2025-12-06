import { useState } from 'react';

interface UseCheckoutOptions {
  checkoutUrl: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

interface UseCheckoutReturn {
  isLoading: boolean;
  error: Error | null;
  initiateCheckout: () => Promise<void>;
}

export function useCheckout({
  checkoutUrl,
  onError,
  onSuccess,
}: UseCheckoutOptions): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initiateCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(checkoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.url) {
        onSuccess?.();
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Checkout failed');
      setError(error);
      onError?.(error);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    initiateCheckout,
  };
}
