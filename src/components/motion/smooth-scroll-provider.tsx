'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/src/hooks/use-prefers-reduced-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Lenis on native scroll (not a transform wrapper), so fixed headers and
 * position: sticky keep working. Synced with ScrollTrigger via the GSAP ticker.
 * Inner scroll containers must opt out with data-lenis-prevent.
 */
export const SmoothScrollProvider = ({ children }: { children: ReactNode }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.12,
      anchors: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    // Layout changes across routes invalidate trigger positions.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname]);

  return <>{children}</>;
};
