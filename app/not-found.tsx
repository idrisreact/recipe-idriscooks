import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center">
      <div className="wrapper-narrow flex flex-col items-start gap-8 py-24">
        <span className="eyebrow-rule">Error 404</span>
        <h1 className="font-serif text-5xl md:text-7xl leading-none text-[var(--ink)]">
          This recipe isn&apos;t in the <span className="italic text-[var(--tomato)]">book</span>.
        </h1>
        <p className="body-lg text-[var(--ink-65)] max-w-md">
          The page you&apos;re after has been moved, renamed, or never existed. The archive is still
          full of good things to cook.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/recipes" className="btn-ink">
            Browse recipes
          </Link>
          <Link href="/" className="btn-link">
            Back to the kitchen
          </Link>
        </div>
      </div>
    </div>
  );
}
