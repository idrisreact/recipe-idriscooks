'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function IntroLoader() {
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we've already shown the intro in this session
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setIsComplete(true);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsComplete(true);
          sessionStorage.setItem('hasSeenIntro', 'true');
        },
      });

      // Initial state
      gsap.set(containerRef.current, { visibility: 'visible' });
      gsap.set(textRef.current, { y: 100, opacity: 0 });

      tl.to(textRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out',
        delay: 0.5,
      })
        .to(textRef.current, {
          y: -100,
          opacity: 0,
          duration: 0.8,
          ease: 'power4.in',
          delay: 1.5,
        })
        .to(curtainRef.current, {
          height: 0,
          duration: 1.2,
          ease: 'power4.inOut',
        })
        .to(containerRef.current, {
          display: 'none',
          duration: 0,
        });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (isComplete) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center invisible"
    >
      <div ref={curtainRef} className="absolute inset-0 bg-black w-full h-full" />
      <div className="relative z-10 overflow-hidden">
        <div ref={textRef} className="text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest">
            Idris Cooks
          </h1>
          <p className="mt-4 text-lg md:text-xl text-[var(--primary)] font-light tracking-[0.2em] uppercase">
            Culinary Excellence
          </p>
        </div>
      </div>
    </div>
  );
}
