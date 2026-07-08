'use client';

import Image, { type ImageProps } from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/src/hooks/use-prefers-reduced-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxImageProps extends ImageProps {
  /** Classes for the clipping frame around the image. */
  containerClassName?: string;
  /** Vertical travel in percent of image height; scale compensates so no gaps show. */
  strength?: number;
}

export const ParallaxImage = ({
  containerClassName,
  strength = 10,
  alt,
  ...props
}: ParallaxImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;

    const image = container.querySelector('img');
    if (!image) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        image,
        { yPercent: -strength, scale: 1 + (strength * 2) / 100 },
        {
          yPercent: strength,
          scale: 1 + (strength * 2) / 100,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, container);

    return () => context.revert();
  }, [prefersReducedMotion, strength]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${containerClassName ?? ''}`}>
      <Image alt={alt} {...props} />
    </div>
  );
};
