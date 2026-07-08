import type { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Seconds per full loop. */
  speed?: number;
  reverse?: boolean;
}

/**
 * CSS-driven infinite marquee (see .marquee styles in globals.css).
 * The second copy exists only to make the loop seamless.
 */
export const Marquee = ({ children, className, speed = 30, reverse = false }: MarqueeProps) => {
  const trackStyle = {
    animationDuration: `${speed}s`,
    animationDirection: reverse ? ('reverse' as const) : ('normal' as const),
  };

  return (
    <div className={`marquee ${className ?? ''}`}>
      <div className="marquee-track" style={trackStyle}>
        {children}
      </div>
      <div className="marquee-track" style={trackStyle} aria-hidden="true">
        {children}
      </div>
    </div>
  );
};
