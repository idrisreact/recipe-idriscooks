'use client';

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '@/src/hooks/use-prefers-reduced-motion';

interface TransitionContextValue {
  navigate: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export const usePageTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within a TransitionProvider');
  }
  return context;
};

/**
 * Ink curtain route transitions. AnimatePresence exit animations require
 * freezing the App Router context, and the View Transitions API has no stable
 * Next integration yet — a curtain that covers, pushes, then reveals on
 * pathname change is deterministic and matches the intro loader's language.
 * Browser back/forward bypasses it entirely.
 */
export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  const overlayRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<string | null>(null);
  const failsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    pendingRef.current = null;
    if (failsafeRef.current) {
      clearTimeout(failsafeRef.current);
      failsafeRef.current = null;
    }

    gsap.to(overlay, {
      yPercent: -100,
      duration: 0.65,
      ease: 'power4.inOut',
      delay: 0.15,
      onComplete: () => {
        gsap.set(overlay, { display: 'none', yPercent: 100 });
      },
    });
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const overlay = overlayRef.current;

      if (prefersReducedMotion || !overlay || pendingRef.current || href === pathname) {
        router.push(href);
        return;
      }

      pendingRef.current = href;
      gsap.set(overlay, { display: 'flex', yPercent: 100 });
      gsap.to(overlay, {
        yPercent: 0,
        duration: 0.55,
        ease: 'power4.inOut',
        onComplete: () => {
          router.push(href);
          // If the route never resolves (error page took over, push failed),
          // lift the curtain rather than trapping the user.
          failsafeRef.current = setTimeout(reveal, 4000);
        },
      });
    },
    [prefersReducedMotion, pathname, router, reveal]
  );

  useEffect(() => {
    if (pendingRef.current) {
      reveal();
    }
  }, [pathname, reveal]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 z-[9998] hidden items-center justify-center bg-[var(--ink)]"
      >
        <span className="font-serif text-2xl text-[var(--cream)]">
          Idris <span className="italic text-[var(--peach)]">cooks</span>
        </span>
      </div>
    </TransitionContext.Provider>
  );
};
