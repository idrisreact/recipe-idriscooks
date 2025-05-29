"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid";

export function ScrollIndicator() {
  const arrow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!arrow.current) return;

    gsap.to(arrow.current, {
      y: -10, // move up 10px
      duration: 1, // over 1 second
      ease: "power1.inOut",
      repeat: -1, // loop forever
      yoyo: true, // reverse on each repeat
    });
  }, []);

  return (
    <div
      ref={arrow}
      className="
        absolute bottom-8 left-1/2 transform -translate-x-1/2
        bg-white/20 hover:bg-white/40 text-white p-2 rounded-full
        cursor-pointer
        transition
      "
      onClick={() =>
        window.scrollTo({ top: window.innerHeight * 0.8, behavior: "smooth" })
      }
    >
      <ChevronDoubleDownIcon className="w-6 h-6" />
    </div>
  );
}
