'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="wrapper page justify-center">
      <div className="flex flex-col items-start gap-8">
        <span className="eyebrow-rule">Something went wrong</span>
        <h1 className="font-serif text-4xl md:text-6xl leading-tight text-[var(--ink)]">
          That didn&apos;t come out of the <span className="italic text-[var(--tomato)]">oven</span>{' '}
          right.
        </h1>
        <p className="body-lg text-[var(--ink-65)] max-w-md">
          An unexpected error stopped this page from loading. It&apos;s usually temporary.
        </p>
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={reset} className="btn-ink">
            Try again
          </button>
          <Link href="/" className="btn-link">
            Back to the kitchen
          </Link>
        </div>
      </div>
    </div>
  );
}
