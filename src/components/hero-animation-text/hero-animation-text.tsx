"use client";
import { useEffect } from "react";
import gsap from "gsap";

export function BouncingText() {
  useEffect(() => {
    gsap.fromTo(
      ".bouncing-text",
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "bounce.out" }
    );
  }, []);

  return (
    <h1 className="text-4xl flex sm:w-full bouncing-text text-center md:text-5xl">
      Cook Like Idris: Bold, Premium, Unforgettable
    </h1>
  );
}
