'use client';

import { createElement, useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { usePrefersReducedMotion } from '@/src/hooks/use-prefers-reduced-motion';
import { useMotionStore } from '@/src/store/motion-store';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface SplitTextRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  start?: string;
  /** Hold the animation (e.g. until the intro loader finishes). */
  paused?: boolean;
  /** Sequence after the intro loader curtain lifts. */
  waitForIntro?: boolean;
}

/**
 * Line-masked headline reveal. autoSplit re-splits on resize/font load;
 * mask: 'lines' provides the overflow clipping, so no extra CSS is needed.
 */
export const SplitTextReveal = ({
  children,
  as = 'div',
  className,
  delay = 0,
  start = 'top 85%',
  paused = false,
  waitForIntro = false,
}: SplitTextRevealProps) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const introDone = useMotionStore((state) => state.introDone);
  const held = paused || (waitForIntro && !introDone);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion || held) return;

    let split: SplitText | null = null;
    const context = gsap.context(() => {
      split = SplitText.create(element, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        // Keep natural DOM text for screen readers; SplitText's generated
        // aria-label mangles text around <br/> and is prohibited on <p>.
        aria: 'none',
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: 'power4.out',
            stagger: 0.12,
            delay,
            scrollTrigger: {
              trigger: element,
              start,
              once: true,
            },
          }),
      });
    }, element);

    return () => {
      split?.revert();
      context.revert();
    };
  }, [prefersReducedMotion, held, delay, start]);

  return createElement(as, { ref, className }, children);
};
