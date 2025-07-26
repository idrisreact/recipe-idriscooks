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
  activeColor = "text-red-500",
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
      className={`bg-white/90 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] ${className}`}
    >
      <Icon 
        className={`w-4 h-4 ${
          isActive ? `fill-current ${activeColor}` : "text-gray-600"
        }`}
        aria-hidden="true"
      />
    </Button>
  );
};