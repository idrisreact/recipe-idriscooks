import { Button } from '../../../components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
  activeColor?: string;
  className?: string;
  ariaLabel: string;
  disabled?: boolean;
}

export const ActionButton = ({
  icon: Icon,
  onClick,
  isActive,
  activeColor = 'text-[var(--tomato)]',
  className = '',
  ariaLabel,
  disabled = false,
}: ActionButtonProps) => {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={`min-h-10 min-w-10 border border-[var(--ink-line)] bg-[var(--cream)] text-[var(--ink-60)] shadow-none transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--parchment)] hover:text-[var(--ink)] focus:ring-2 focus:ring-[var(--tomato)] focus:ring-offset-2 focus:ring-offset-[var(--cream)] ${className}`}
    >
      <Icon
        className={`w-4 h-4 ${isActive ? `fill-current ${activeColor}` : 'text-muted-foreground'}`}
        aria-hidden="true"
      />
    </Button>
  );
};
