import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  /** Rendered on the right edge of the header row (e.g. a count or CTA). */
  aside?: ReactNode;
}

/** Standard editorial page header: eyebrow, display serif title, rule. */
export const PageHeader = ({ eyebrow, title, description, aside }: PageHeaderProps) => (
  <header className="flex flex-col gap-6">
    <span className="eyebrow-rule">{eyebrow}</span>
    <div className="flex flex-wrap items-end justify-between gap-6">
      <h1 className="display-s max-w-3xl">{title}</h1>
      {aside && <div className="pb-2">{aside}</div>}
    </div>
    {description && <p className="body-lg text-[var(--ink-65)] max-w-2xl">{description}</p>}
    <div className="divider" />
  </header>
);
