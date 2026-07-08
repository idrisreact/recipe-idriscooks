'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGsapTimeline } from '@/src/hooks/use-gsap-animation';
import { useSessionStorage } from '@/src/hooks/use-session-storage';
import { useMotionStore } from '@/src/store/motion-store';

export default function IntroLoader() {
  const [hasSeenIntro, setHasSeenIntro] = useSessionStorage('hasSeenIntro', false);
  const setIntroDone = useMotionStore((state) => state.setIntroDone);

  useEffect(() => {
    if (hasSeenIntro) {
      setIntroDone(true);
    }
  }, [hasSeenIntro, setIntroDone]);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  const containerRef = useGsapTimeline(
    (tl) => {
      if (hasSeenIntro) return;

      gsap.set(containerRef.current, { visibility: 'visible' });
      gsap.set(logoRef.current, { scale: 0.8, opacity: 0 });
      gsap.set(textRef.current, { y: 60, opacity: 0 });
      gsap.set(taglineRef.current, { y: 30, opacity: 0 });
      gsap.set(lineRef.current, { scaleX: 0 });

      // Kept tight: the curtain delays the page's first contentful paint,
      // so the whole sequence must stay well under ~2.5s.
      tl.to(logoRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: 'power3.out',
        delay: 0.1,
      })
        .to(
          lineRef.current,
          {
            scaleX: 1,
            duration: 0.35,
            ease: 'power2.out',
          },
          '-=0.25'
        )
        .to(
          textRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: 'power3.out',
          },
          '-=0.2'
        )
        .to(
          taglineRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            ease: 'power3.out',
          },
          '-=0.25'
        )
        .to([logoRef.current, textRef.current, taglineRef.current, lineRef.current], {
          opacity: 0,
          y: -40,
          duration: 0.4,
          ease: 'power3.in',
          stagger: 0.04,
          delay: 0.4,
        })
        .to(curtainRef.current, {
          yPercent: -100,
          duration: 0.7,
          ease: 'power4.inOut',
          onStart: () => setIntroDone(true),
        })
        .to(containerRef.current, {
          display: 'none',
          duration: 0,
          onComplete: () => setHasSeenIntro(true),
        });
    },
    [hasSeenIntro]
  );

  if (hasSeenIntro) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center invisible"
    >
      {/* Curtain */}
      <div ref={curtainRef} className="absolute inset-0 bg-[var(--cream)] w-full h-full" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Decorative Line Above */}
        <div ref={lineRef} className="w-12 h-px bg-[var(--olive)] mb-8 origin-center" />

        {/* Logo Mark */}
        <div
          ref={logoRef}
          className="w-16 h-16 border border-[var(--ink)] flex items-center justify-center mb-6"
        >
          <span className="font-serif text-3xl font-normal text-[var(--tomato)]">IC</span>
        </div>

        <div ref={textRef} className="text-center mb-4">
          <p className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-[var(--ink)]">
            Idris <span className="italic text-[var(--tomato)]">cooks</span>
          </p>
        </div>

        <div ref={taglineRef}>
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[var(--olive)]">
            Tested, not fussy
          </p>
        </div>
      </div>
    </div>
  );
}
