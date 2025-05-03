"use client"
import { useEffect } from "react";
import gsap from "gsap";

export  function BouncingText() {
  useEffect(() => {
    // GSAP bounce animation for the heading text
    gsap.fromTo(
      ".bouncing-text", // Targeting the class
      { y: -100, opacity: 0 }, // Initial state: 100px above, hidden
      { y: 0, opacity: 1, duration: 1, ease: "bounce.out" } // Final state: on screen with a bounce effect
    );
  }, []);

  return (
  
          <h1 className="text-5xl flex sm:w-full md:w-1/2  bouncing-text">
            Taste Perfection: Premium Recipes Curated by Idris
          </h1>
       
  );
}