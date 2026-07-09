'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, SplitTextReveal } from '@/src/components/motion';
import { usePrefersReducedMotion } from '@/src/hooks/use-prefers-reduced-motion';

const CateringHero3D = dynamic(() => import('./catering-hero-3d'), {
  ssr: false,
  loading: () => null,
});

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export const CateringHero = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setCanRender3D(false);
      return;
    }
    // Desktop-only: on touch devices the pointer parallax adds nothing and
    // WebGL (often software-rendered) burns the CPU budget.
    const desktopPointer = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
    const capableHardware = (navigator.hardwareConcurrency ?? 8) > 4;
    setCanRender3D(desktopPointer && capableHardware && supportsWebGL());
  }, [prefersReducedMotion]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--cream)] pt-28 md:pt-24">
      {/* Scene layer */}
      <div className="absolute inset-0 lg:left-[38%]">
        {canRender3D ? (
          <CateringHero3D />
        ) : (
          <div className="relative h-full w-full opacity-90">
            <Image
              src="/images/food background.png"
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 62vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--cream)] via-[var(--cream)]/40 to-transparent" />
          </div>
        )}
      </div>

      {/* Copy layer */}
      <div className="wrapper relative z-10 flex min-h-[calc(100vh-7rem)] flex-col justify-between pb-16 pt-10">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow-rule">Catering / Private dining</p>
          </Reveal>
          <SplitTextReveal as="h1" className="display-xl mt-8">
            Your table,
            <br />
            <span className="italic-tomato">properly</span> fed.
          </SplitTextReveal>
          <Reveal delay={0.4}>
            <p className="body-lg mt-8 max-w-[440px]">
              Dinners, parties, and corporate tables cooked with the same rule as the archive:
              tested, seasonal, never fussy. You host — the kitchen travels to you.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.6} className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Link href="#inquire" className="btn-tomato group w-fit">
            Start an inquiry
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="#menus" className="btn-link w-fit">
            See how it works
          </Link>
        </Reveal>
      </div>
    </section>
  );
};
