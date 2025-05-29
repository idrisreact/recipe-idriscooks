import { HTMLAttributes, ReactNode } from "react";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isPrimary?: boolean;
}

export const CtaButton = ({ children, isPrimary, ...props }: ButtonProps) => {
  return (
    <button
      className="rounded-2xl border-2 border-indigo-600 bg-black"
      {...props}
    >
      {children}
    </button>
  );
};
