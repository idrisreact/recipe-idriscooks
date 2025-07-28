import { Clock, Users } from "lucide-react";

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
  className = ""
}: RecipeMetadataProps) => {
  const baseStyle = "flex items-center gap-1 text-sm";
  const variantStyles = {
    overlay: "bg-black/70 px-2 py-1 rounded text-white shadow-sm",
    inline: "text-gray-700",
    badge: "bg-gray-200 px-3 py-1 rounded-full text-gray-800"
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