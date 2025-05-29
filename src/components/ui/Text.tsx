import { HtmlHTMLAttributes, ReactNode } from "react";

type ElementTag = "p" | "h1" | "h2" | "h3" | "span" | "div";

type TextProps<T extends ElementTag> = {
  as?: T;
  children: ReactNode;
  opacity?: "25" | "50" | "75" | "100";
} & React.ComponentPropsWithoutRef<T>;

export const Text = <T extends ElementTag = "p">({
  children,
  opacity = "100",
  className,
  as,
  ...props
}: TextProps<T>) => {
  const Component = as ?? "p";
  const opacityClass = `opacity-${opacity}`;

  return (
    <Component
      className={[opacityClass, className].filter(Boolean).join(" ")}
      {...(props as any)}
    >
      {children}
    </Component>
  );
};
