import Image from "next/image";
import { ReactNode } from "react";

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
  avatar?: {
    src: string;
    alt: string;
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
  const { variant, className = "", onClick, children } = props;

  if (variant === 'recipe') {
    const { backgroundImage, title, subtitle, avatar, metadata, actions } = props;
    return (
      <article
        className={`relative w-64 h-80 rounded-lg overflow-hidden bg-center bg-cover cursor-pointer ${className}`}
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-label={title}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Actions overlay */}
        {actions && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}

        {/* Metadata overlay */}
        {metadata && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {metadata}
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-lg font-semibold">{title}</h2>

          {(subtitle || avatar) && (
            <div className="mt-2 flex items-center space-x-2">
              {avatar && (
                <Image
                  src={avatar.src}
                  alt={avatar.alt}
                  width={40}
                  height={40}
                  quality={50}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              )}
              {subtitle && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{subtitle}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {children}
      </article>
    );
  }

  if (variant === 'feature') {
    const { bgColor = "bg-gray-200", label, badge, overlayText } = props;
    return (
      <div
        className={`relative w-64 h-80 rounded-2xl overflow-hidden shadow-md flex flex-col justify-end items-center ${bgColor} ${className}`}
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
      <div className={`rounded-lg shadow-md ${className}`} onClick={onClick}>
        {content}
        {children}
      </div>
    );
  }

  return null;
};