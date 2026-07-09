'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center">
      <div className="wrapper-narrow flex flex-col items-start gap-8 py-24">
        <span className="eyebrow-rule">Error 500</span>
        <h1 className="font-serif text-5xl md:text-7xl leading-none text-[var(--ink)]">
          The kitchen hit a <span className="italic text-[var(--tomato)]">snag</span>.
        </h1>
        <p className="body-lg text-[var(--ink-65)] max-w-md">
          Something went wrong on our side. Try again — if it keeps happening, come back in a little
          while.
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
