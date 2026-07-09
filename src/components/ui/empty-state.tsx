import Link from 'next/link';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  /** Custom action node, used instead of actionLabel/actionHref. */
  action?: ReactNode;
}

/** Editorial empty state: mono eyebrow, serif headline, single CTA. */
export const EmptyState = ({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-start gap-6 border-t border-[var(--ink-line)] py-20">
    <span className="eyebrow-rule">{eyebrow}</span>
    <h2 className="font-serif text-4xl md:text-5xl leading-tight text-[var(--ink)] max-w-xl">
      {title}
    </h2>
    {description && <p className="body-lg text-[var(--ink-65)] max-w-md">{description}</p>}
    {action}
    {!action && actionLabel && actionHref && (
      <Link href={actionHref} className="btn-ink">
        {actionLabel}
      </Link>
    )}
  </div>
);
