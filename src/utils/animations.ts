/**
 * Luxury Animation Utilities
 * Sophisticated animation presets for Awwwards-level interactions
 */

import { Variants } from 'framer-motion';

// Easing curves - Premium feel
export const easings = {
  smooth: [0.43, 0.13, 0.23, 0.96],
  snappy: [0.22, 1, 0.36, 1],
  gentle: [0.25, 0.46, 0.45, 0.94],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springGentle: { type: 'spring', stiffness: 200, damping: 25 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 20 },
};

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: easings.gentle }
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easings.smooth }
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easings.smooth }
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easings.gentle }
  },
};

// Stagger container for children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// Slide animations
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easings.smooth }
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easings.smooth }
  },
};

// Card hover animations
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -8,
    transition: { duration: 0.3, ease: easings.snappy }
  },
};

export const cardHoverSubtle: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.01,
    y: -4,
    transition: { duration: 0.3, ease: easings.gentle }
  },
};

// Scale animations
export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: easings.snappy }
  },
};

export const scaleUp: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.3, ease: easings.gentle }
  },
};

// Text reveal animations
export const textReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    clipPath: 'inset(0 0 100% 0)',
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.8, ease: easings.smooth }
  },
};

// Button animations
export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: easings.gentle },
};

// Rotation animations
export const rotate3D: Variants = {
  rest: {
    rotateX: 0,
    rotateY: 0,
  },
  hover: {
    rotateX: 5,
    rotateY: 5,
    transition: { duration: 0.3, ease: easings.gentle },
  },
};

// Blur animations
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: easings.gentle }
  },
};

// Navigation animations
export const navAnimation: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: easings.smooth }
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: { duration: 0.4, ease: easings.smooth }
  },
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easings.gentle }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: easings.gentle }
  },
};

// Parallax scroll animation helper
export const parallaxScroll = (offset: number = 0.5) => ({
  y: offset * 100,
  transition: { duration: 0 },
});

// Magnetic hover effect (for buttons/cards)
export const magneticHover = {
  rest: { x: 0, y: 0 },
  hover: (custom: { x: number; y: number }) => ({
    x: custom.x * 0.3,
    y: custom.y * 0.3,
    transition: { duration: 0.2, ease: easings.gentle },
  }),
};

// Shimmer effect animation
export const shimmerAnimation = {
  animate: {
    x: ['200%', '-200%'],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'linear',
    },
  },
};

// Floating animation
export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Pulse animation
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
