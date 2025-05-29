"use client";

interface ContainerProps {
  children: React.ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
  return <div className="mx-auto w-full px-4 max-w-screen-lg">{children}</div>;
};
