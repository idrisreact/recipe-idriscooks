'use client';

import { useRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '@/src/hooks/use-prefers-reduced-motion';

interface MagneticProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 0–1: how far the element follows the cursor. */
  strength?: number;
}

/** Pulls its child toward the cursor while hovered; springs back on leave. */
export const Magnetic = ({ children, strength = 0.3, className, ...props }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power3.out',
    });
  };

  const handleMouseLeave = () => {
    const element = ref.current;
    if (!element) return;

    gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <div
      ref={ref}
      className={`inline-block ${className ?? ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};
