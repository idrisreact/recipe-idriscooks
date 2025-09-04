import React from 'react';

export interface MurakamicityCardProps {
  /** Card variant */
  variant?: 'default' | 'recipe' | 'elevated' | 'bordered';
  /** Card padding */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Card content */
  children: React.ReactNode;
  /** Background image URL for recipe cards */
  backgroundImage?: string;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Interactive card that responds to hover */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/** Murakamicity design system card component */
export const MurakamicityCard = ({
  variant = 'default',
  padding = 'medium',
  children,
  backgroundImage,
  title,
  subtitle,
  interactive = false,
  onClick,
  className = '',
  ...props
}: MurakamicityCardProps) => {
  const baseClasses = [
    'rounded-lg',
    'transition-all',
    'duration-200',
  ];

  const paddingClasses = {
    none: [],
    small: ['p-3'],
    medium: ['p-4'],
    large: ['p-6'],
  };

  const variantClasses = {
    default: [
      'bg-white',
      'border',
      'border-gray-200',
      'shadow-sm',
    ],
    recipe: [
      'bg-white',
      'border',
      'border-gray-200',
      'shadow-md',
      'overflow-hidden',
      'relative',
    ],
    elevated: [
      'bg-white',
      'shadow-lg',
      'border',
      'border-gray-100',
    ],
    bordered: [
      'bg-white',
      'border-2',
      'border-[#F20094]',
      'shadow-sm',
    ],
  };

  const interactiveClasses = interactive ? [
    'cursor-pointer',
    'hover:scale-105',
    'hover:shadow-xl',
    'active:scale-95',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-[#F20094]',
    'focus:ring-offset-2',
  ] : [];

  const allClasses = [
    ...baseClasses,
    ...paddingClasses[padding],
    ...variantClasses[variant],
    ...interactiveClasses,
    className,
  ].join(' ');

  const cardContent = (
    <>
      {backgroundImage && variant === 'recipe' && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      )}
      
      {(title || subtitle) && (
        <div className={`${backgroundImage ? 'relative z-10 text-white' : ''} mb-4`}>
          {title && (
            <h3 className={`font-semibold text-lg ${backgroundImage ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-sm mt-1 ${backgroundImage ? 'text-white/90' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={backgroundImage ? 'relative z-10' : ''}>
        {children}
      </div>
    </>
  );

  if (interactive) {
    return (
      <div
        className={allClasses}
        onClick={onClick}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        {...props}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div className={allClasses} {...props}>
      {cardContent}
    </div>
  );
};