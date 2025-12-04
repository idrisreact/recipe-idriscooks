import { useState, useCallback } from 'react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface UseShareOptions {
  fallbackToCopy?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseShareReturn {
  share: (data: ShareData) => Promise<void>;
  isSharing: boolean;
  error: Error | null;
  isSupported: boolean;
}

export function useShare({
  fallbackToCopy = true,
  onSuccess,
  onError,
}: UseShareOptions = {}): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' && typeof navigator.share !== 'undefined';

  const share = useCallback(
    async (data: ShareData) => {
      setIsSharing(true);
      setError(null);

      try {
        if (isSupported && navigator.share) {
          await navigator.share(data);
          onSuccess?.();
        } else if (fallbackToCopy && data.url) {
          const textToCopy = data.title
            ? `${data.title} - ${data.url}`
            : data.url;
          await navigator.clipboard.writeText(textToCopy);
          onSuccess?.();
        } else {
          throw new Error('Web Share API not supported and no fallback available');
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          onError?.(err);
        }
      } finally {
        setIsSharing(false);
      }
    },
    [isSupported, fallbackToCopy, onSuccess, onError]
  );

  return {
    share,
    isSharing,
    error,
    isSupported,
  };
}
