'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/src/hooks/use-prefers-reduced-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px. */
  y?: number;
  duration?: number;
  delay?: number;
  /** Applies when children carry data-reveal-child. */
  stagger?: number;
  start?: string;
}

/**
 * Scroll-triggered entrance. Animates the wrapper, or staggers any
 * descendants marked with data-reveal-child. Animates transform/opacity
 * only (no layout shift); renders content as-is under reduced motion.
 */
export const Reveal = ({
  children,
  className,
  y = 32,
  duration = 0.9,
  delay = 0,
  stagger = 0.08,
  start = 'top 85%',
}: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return;

    const staggerChildren = element.querySelectorAll('[data-reveal-child]');
    const targets = staggerChildren.length > 0 ? staggerChildren : element;

    const context = gsap.context(() => {
      gsap.from(targets, {
        autoAlpha: 0,
        y,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
        },
      });
    }, element);

    return () => context.revert();
  }, [prefersReducedMotion, y, duration, delay, stagger, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
