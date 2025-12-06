import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxConfig {
  opacity?: number;
  y?: number;
  scrollTrigger?: {
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: boolean;
  };
}

interface AnimationConfig {
  opacity?: number;
  y?: number;
  duration?: number;
  ease?: string;
  delay?: number;
}

export function useGsapParallax<T extends HTMLElement>(config: ParallaxConfig) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.set(element, { opacity: 1, y: 0 });

    const tween = gsap.to(element, {
      ...config,
      scrollTrigger: {
        trigger: element,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        ...config.scrollTrigger,
      },
    });

    return () => {
      tween.kill();
      if (element) {
        gsap.set(element, { clearProps: 'all' });
      }
    };
  }, [config]);

  return ref;
}

export function useGsapAnimation<T extends HTMLElement>(
  animationConfig: AnimationConfig,
  from: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.set(element, { opacity: 1, y: 0 });

    const tween = from
      ? gsap.from(element, animationConfig)
      : gsap.to(element, animationConfig);

    return () => {
      tween.kill();
      if (element) {
        gsap.set(element, { clearProps: 'all' });
      }
    };
  }, [animationConfig, from]);

  return ref;
}

export function useGsapTimeline(
  setupTimeline: (timeline: gsap.core.Timeline) => void,
  dependencies: unknown[] = []
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline();
      setupTimeline(timeline);
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupTimeline, ...dependencies]);

  return containerRef;
}
