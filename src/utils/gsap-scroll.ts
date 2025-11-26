/**
 * GSAP Scroll Utilities
 * For creating immersive scroll-triggered animations like Invesco QQQ
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Fade in element on scroll
 */
export const fadeInOnScroll = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      ...options,
    },
  });
};

/**
 * Reveal animation - slides up and fades in
 */
export const revealOnScroll = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    y: 100,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 87%',
      toggleActions: 'play none none reverse',
      ...options,
    },
  });
};

/**
 * Stagger reveal for multiple elements
 */
export const staggerReveal = (
  elements: string | Element[],
  staggerDelay = 0.1,
  options = {}
) => {
  return gsap.from(elements, {
    opacity: 0,
    y: 60,
    duration: 0.8,
    stagger: staggerDelay,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: elements,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
      ...options,
    },
  });
};

/**
 * Parallax effect - slower background movement
 */
export const parallaxScroll = (
  element: string | Element,
  speed = 0.5,
  options = {}
) => {
  return gsap.to(element, {
    y: () => window.innerHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      ...options,
    },
  });
};

/**
 * Scale up on scroll
 */
export const scaleOnScroll = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    scale: 0.8,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      ...options,
    },
  });
};

/**
 * Pin section while scrolling
 */
export const pinSection = (
  element: string | Element,
  duration = '100%',
  options = {}
) => {
  return ScrollTrigger.create({
    trigger: element,
    start: 'top top',
    end: `+=${duration}`,
    pin: true,
    ...options,
  });
};

/**
 * Horizontal scroll section
 */
export const horizontalScroll = (
  container: string | Element,
  scrollDistance: number,
  options = {}
) => {
  const sections = gsap.utils.toArray(`${container} > *`);

  return gsap.to(sections, {
    xPercent: -100 * (sections.length - 1),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      snap: 1 / (sections.length - 1),
      end: () => `+=${scrollDistance}`,
      ...options,
    },
  });
};

/**
 * Text reveal animation - clip path
 */
export const textRevealScroll = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    clipPath: 'inset(0 0 100% 0)',
    y: 50,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
      ...options,
    },
  });
};

/**
 * Video play on scroll into view
 */
export const videoPlayOnScroll = (videoElement: HTMLVideoElement, options = {}) => {
  return ScrollTrigger.create({
    trigger: videoElement,
    start: 'top 80%',
    end: 'bottom 20%',
    onEnter: () => videoElement.play(),
    onLeave: () => videoElement.pause(),
    onEnterBack: () => videoElement.play(),
    onLeaveBack: () => videoElement.pause(),
    ...options,
  });
};

/**
 * Refresh ScrollTrigger instances
 */
export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};

/**
 * Kill all ScrollTrigger instances
 */
export const killAllScrollTriggers = () => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

export { gsap, ScrollTrigger };
