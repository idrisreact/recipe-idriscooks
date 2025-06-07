// components/ui/IconButton.tsx
import React from "react";
import clsx from "clsx";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  children,
  className,
  ...buttonProps
}) => {
  return (
    <button
      {...buttonProps}
      className={clsx(
        // base styles
        "flex items-center justify-center space-x-2 py-2 px-4 border-2 rounded-md transition",
        // you can add any variant classes here, or pass via `className`
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
