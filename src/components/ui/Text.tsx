import { ReactNode } from 'react';

type ElementTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';

type TextProps<T extends ElementTag> = {
  as?: T;
  children: ReactNode;
  variant?: 'default' | 'large' | 'small' | 'xs' | 'heading' | 'subheading' | 'caption';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  opacity?: '25' | '50' | '75' | '100';
  gradient?: boolean;
} & React.ComponentPropsWithoutRef<T>;

export const Text = <T extends ElementTag = 'p'>({
  children,
  variant = 'default',
  weight = 'normal',
  opacity = '100',
  gradient = false,
  className,
  as,
  ...props
}: TextProps<T>) => {
  const Component = as ?? 'p';

  const variantClasses = {
    default: 'text-base leading-relaxed',
    large: 'text-lg leading-relaxed',
    small: 'text-sm leading-normal',
    xs: 'text-xs leading-tight',
    heading: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
    subheading: 'text-xl md:text-2xl font-semibold leading-snug',
    caption: 'text-xs uppercase tracking-wide font-medium',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  const opacityClass = `opacity-${opacity}`;
  const gradientClass = gradient ? 'murakamicity-text-gradient' : '';

  return (
    <Component
      className={[
        variantClasses[variant],
        weightClasses[weight],
        opacityClass,
        gradientClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(props as React.ComponentPropsWithoutRef<T>)}
    >
      {children}
    </Component>
  );
};
