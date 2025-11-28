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
        className={`relative w-full h-[400px] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-2xl ${className}`}
        aria-labelledby={`recipe-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
      >
        {/* Background Image with Zoom Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Actions (Top Right) */}
        {actions && (
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            {actions}
          </div>
        )}

        {/* Metadata (Top Left) */}
        {metadata && (
          <div
            className="absolute top-4 left-4 z-20"
            aria-label="Recipe details"
          >
            {metadata}
          </div>
        )}

        {/* Content (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
          {/* Author */}
          {author && (
            <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              {author.image ? (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={24}
                  height={24}
                  className="rounded-full border border-white/20"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-[10px] font-bold text-white">
                  {author.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                by {author.name}
              </span>
            </div>
          )}

          <h2
            id={`recipe-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-[var(--primary)] transition-colors duration-300"
          >
            {title}
          </h2>

          {subtitle && (
            <p className="text-white/70 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              {subtitle}
            </p>
          )}
          
          <div className="h-1 w-12 bg-[var(--primary)] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>

        {children}
      </article>
    );
  }

  if (variant === 'feature') {
    const { bgColor = 'bg-gray-200', label, badge, overlayText } = props;
    return (
      <div
        className={`relative w-full max-w-sm h-80 rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-end items-center ${bgColor} ${className}`}
        onClick={onClick}
      >
        {badge && (
          <span className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
            {badge}
          </span>
        )}
        {label && (
          <span className="absolute bottom-3 left-3 bg-white/80 text-gray-800 text-xs px-3 py-1 rounded-full font-medium z-10">
            {label}
          </span>
        )}
        {overlayText && (
          <span className="absolute bottom-8 left-3 right-3 text-gray-800 text-lg font-bold drop-shadow-lg z-10 text-center">
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
      <div className={`murakamicity-card ${className}`} onClick={onClick}>
        {content}
        {children}
      </div>
    );
  }

  return null;
};
