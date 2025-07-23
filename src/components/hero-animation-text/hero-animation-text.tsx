"use client";
import { useEffect, ReactNode } from "react";
import gsap from "gsap";

export function BouncingText({ children }: { children?: ReactNode }) {
  useEffect(() => {
    gsap.fromTo(
      ".bouncing-text",
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "bounce.out" }
    );
  }, []);

  return (
    <h1 className="text-4xl flex text-brand-orange sm:w-full bouncing-text text-center md:text-5xl">
      {children || "Cook Like Idris: Bold, Premium, Unforgettable"}
    </h1>
  );
}
