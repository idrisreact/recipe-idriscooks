'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/src/hooks/use-prefers-reduced-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * The dark manifesto section — the site's one pinned scroll moment.
 * Pins for one extra viewport while the statement lines scrub in.
 * Under reduced motion it renders statically, unpinned.
 */
export const InkStatement = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.8,
        },
      });

      timeline
        .from('[data-statement-line]', {
          yPercent: 70,
          autoAlpha: 0,
          stagger: 0.3,
          ease: 'none',
        })
        .from('[data-statement-cta]', { autoAlpha: 0, y: 28, ease: 'none' }, '>-0.15');
    }, section);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-screen items-center bg-[var(--ink)] px-6 py-16 text-[var(--cream)] sm:px-8 lg:px-16 xl:px-24"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow-peach" data-statement-line>
            A small archive of good things to cook.
          </p>
          <h2 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.01em] text-[var(--cream)] sm:text-6xl lg:text-7xl">
            <span className="block overflow-hidden">
              <span className="block" data-statement-line>
                No life stories
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block" data-statement-line>
                before the <span className="italic text-[var(--peach)]">recipe</span>.
              </span>
            </span>
          </h2>
          <p
            className="mt-6 max-w-xl text-[17px] leading-7 text-[var(--cream-70)]"
            data-statement-line
          >
            No 47-ingredient lists. Just dishes that have earned a spot in the rotation.
          </p>
        </div>
        <div data-statement-cta>
          <Link href="/recipes" className="btn-cream group w-fit">
            Start with the basics
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};
