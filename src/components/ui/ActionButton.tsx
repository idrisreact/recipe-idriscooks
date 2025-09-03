import { Button } from "../../../components/ui/button";
import { LucideIcon } from "lucide-react";

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
  activeColor = "text-primary",
  className = "",
  ariaLabel,
  disabled = false
}: ActionButtonProps) => {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={`bg-card/90 hover:bg-card border-border hover:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background min-w-[44px] min-h-[44px] transition-all duration-200 ${className}`}
    >
      <Icon 
        className={`w-4 h-4 ${
          isActive ? `fill-current ${activeColor}` : "text-muted-foreground"
        }`}
        aria-hidden="true"
      />
    </Button>
  );
};