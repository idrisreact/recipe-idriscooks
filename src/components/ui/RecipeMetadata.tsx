import { Clock, Users } from 'lucide-react';

interface RecipeMetadataProps {
  cookTime: number;
  servings: number;
  variant?: 'overlay' | 'inline' | 'badge';
  className?: string;
}

export const RecipeMetadata = ({
  cookTime,
  servings,
  variant = 'inline',
  className = '',
}: RecipeMetadataProps) => {
  const baseStyle = 'flex items-center gap-1 text-sm';
  const variantStyles = {
    overlay: 'text-[var(--ink-50)]',
    inline: 'text-[var(--ink-75)]',
    badge: 'border border-[var(--ink)] px-3 py-1 rounded-full text-[var(--ink)]',
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className={`${baseStyle} ${variantStyles[variant]}`}>
        <Clock className="w-3 h-3" />
        {cookTime}m
      </div>
      <div className={`${baseStyle} ${variantStyles[variant]}`}>
        <Users className="w-3 h-3" />
        {servings}
      </div>
    </div>
  );
};
