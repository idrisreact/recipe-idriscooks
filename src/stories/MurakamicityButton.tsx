import React from 'react';

export interface MurakamicityButtonProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Button contents */
  children: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS classes */
  className?: string;
}

/** Murakamicity design system button component */
export const MurakamicityButton = ({
  variant = 'primary',
  size = 'medium',
  children,
  disabled = false,
  fullWidth = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}: MurakamicityButtonProps) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-[#F20094]',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
  ];

  const sizeClasses = {
    small: ['px-3', 'py-1.5', 'text-sm'],
    medium: ['px-4', 'py-2', 'text-base'],
    large: ['px-6', 'py-3', 'text-lg'],
  };

  const variantClasses = {
    primary: [
      'bg-[#F20094]',
      'text-white',
      'border',
      'border-[#F20094]',
      'hover:bg-[#D1007A]',
      'hover:border-[#D1007A]',
      'active:scale-95',
      'shadow-sm',
      'hover:shadow-md',
    ],
    secondary: [
      'bg-[#6B7280]',
      'text-white',
      'border',
      'border-[#6B7280]',
      'hover:bg-[#4B5563]',
      'hover:border-[#4B5563]',
      'active:scale-95',
      'shadow-sm',
      'hover:shadow-md',
    ],
    outline: [
      'bg-transparent',
      'text-[#F20094]',
      'border-2',
      'border-[#F20094]',
      'hover:bg-[#F20094]',
      'hover:text-white',
      'active:scale-95',
    ],
    ghost: [
      'bg-transparent',
      'text-[#F20094]',
      'border',
      'border-transparent',
      'hover:bg-[#F20094]/10',
      'active:scale-95',
    ],
  };

  const fullWidthClass = fullWidth ? ['w-full'] : [];

  const allClasses = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    ...fullWidthClass,
    className,
  ].join(' ');

  return (
    <button
      type={type}
      className={allClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};