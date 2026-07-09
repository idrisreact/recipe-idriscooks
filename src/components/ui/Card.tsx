import Image from 'next/image';
import { ReactNode } from 'react';

interface BaseCardProps {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

interface RecipeCardProps extends BaseCardProps {
  variant: 'recipe';
  backgroundImage: string;
  title: string;
  subtitle?: string;
  author?: {
    name: string;
    image?: string;
  };
  metadata?: ReactNode;
  actions?: ReactNode;
}

interface FeatureCardProps extends BaseCardProps {
  variant: 'feature';
  bgColor?: string;
  label?: string;
  badge?: string;
  overlayText?: string;
}

interface BasicCardProps extends BaseCardProps {
  variant: 'basic';
  content: ReactNode;
}

type CardProps = RecipeCardProps | FeatureCardProps | BasicCardProps;

export const Card = (props: CardProps) => {
  const { variant, className = '', onClick, children } = props;

  if (variant === 'recipe') {
    const { backgroundImage, title, subtitle, author, metadata, actions } = props;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <article
        className={`group w-full cursor-pointer border-t border-[var(--ink)] pt-3 transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
        aria-labelledby={`recipe-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
      >
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em]">
          <span className="text-[var(--olive)]">Recipe</span>
          {metadata && <div aria-label="Recipe details">{metadata}</div>}
        </div>

        <div className="mt-4 h-[260px] w-full overflow-hidden bg-[var(--parchment)] sm:h-[300px]">
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        </div>

        <div className="pt-5">
          {author && (
            <div className="mb-3 flex items-center gap-2">
              {author.image ? (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={20}
                  height={20}
                  className="rounded-full border border-[var(--ink-line)]"
                />
              ) : (
                <div className="w-5 h-5 border border-[var(--tomato)] flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[var(--tomato)]">
                    {author.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--ink-50)]">
                {author.name}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id={`recipe-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="font-serif text-3xl font-normal leading-[1.08] text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--tomato)]"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink-65)]">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="shrink-0 opacity-100 transition-opacity">{actions}</div>}
          </div>
        </div>

        {children}
      </article>
    );
  }

  if (variant === 'feature') {
    const { bgColor = 'bg-[var(--card)]', label, badge, overlayText } = props;
    return (
      <div
        className={`card-editorial relative w-full max-w-sm aspect-[3/4] cursor-pointer group ${bgColor} ${className}`}
        onClick={onClick}
      >
        {badge && (
          <span className="absolute top-4 right-4 caption text-[var(--primary)] z-10">{badge}</span>
        )}
        {label && (
          <span className="absolute bottom-4 left-4 caption text-white/60 z-10">{label}</span>
        )}
        {overlayText && (
          <span className="absolute bottom-12 left-4 right-4 font-serif text-xl font-semibold text-white z-10">
            {overlayText}
          </span>
        )}
        {children}
      </div>
    );
  }

  if (variant === 'basic') {
    const { content } = props;
    return (
      <div className={`card-editorial p-6 ${className}`} onClick={onClick}>
        {content}
        {children}
      </div>
    );
  }

  return null;
};
