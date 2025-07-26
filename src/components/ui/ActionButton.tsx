import { Button } from "../../../components/ui/button";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
  activeColor?: string;
  className?: string;
}

export const ActionButton = ({ 
  icon: Icon, 
  onClick, 
  isActive, 
  activeColor = "text-red-500",
  className = ""
}: ActionButtonProps) => {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={onClick}
      className={`bg-white/90 hover:bg-white ${className}`}
    >
      <Icon 
        className={`w-4 h-4 ${
          isActive ? `fill-current ${activeColor}` : "text-gray-600"
        }`} 
      />
    </Button>
  );
};