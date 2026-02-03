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
        className={`card-editorial relative w-full aspect-[3/4] cursor-pointer group ${className}`}
        aria-labelledby={`recipe-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
      >
        {/* Background Image with Subtle Zoom */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Gradient Overlay - Editorial Style */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

        {/* Actions (Top Right) - Refined */}
        {actions && (
          <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            {actions}
          </div>
        )}

        {/* Metadata (Top Left) */}
        {metadata && (
          <div className="absolute top-5 left-5 z-20" aria-label="Recipe details">
            {metadata}
          </div>
        )}

        {/* Content (Bottom) - Editorial Layout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          {/* Author - Subtle */}
          {author && (
            <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              {author.image ? (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={20}
                  height={20}
                  className="rounded-full border border-white/10"
                />
              ) : (
                <div className="w-5 h-5 bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[var(--primary)]">
                    {author.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-[10px] font-medium text-white/50 uppercase tracking-[0.1em]">
                {author.name}
              </span>
            </div>
          )}

          {/* Title - Serif Editorial */}
          <h2
            id={`recipe-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="font-serif text-xl lg:text-2xl font-semibold text-white mb-2 leading-tight group-hover:text-[var(--primary)] transition-colors duration-300"
          >
            {title}
          </h2>

          {/* Subtitle - Revealed on Hover */}
          {subtitle && (
            <p className="text-white/50 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 font-light">
              {subtitle}
            </p>
          )}

          {/* Accent Line */}
          <div className="h-px w-8 bg-[var(--primary)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left delay-150" />
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
