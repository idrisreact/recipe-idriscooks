'use client';

import Image from 'next/image';
import Link from 'next/link';
import FeaturesSection from '@/src/components/features-section';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Play, ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Reset elements to initial state
    gsap.set(headingRef.current, { opacity: 1, y: 0 });
    gsap.set(heroRef.current, { opacity: 1, y: 0 });

    // Hero parallax effect
    const parallaxTween = gsap.to(heroRef.current, {
      opacity: 0,
      y: -100,
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Heading reveal
    const headingTween = gsap.from(headingRef.current, {
      opacity: 0,
      y: 100,
      duration: 1.2,
      ease: 'power4.out',
      delay: 0.3,
    });

    // Cleanup function
    return () => {
      parallaxTween.kill();
      headingTween.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      // Reset to visible state on cleanup
      gsap.set(headingRef.current, { clearProps: 'all' });
      gsap.set(heroRef.current, { clearProps: 'all' });
    };
  }, []);

  return (
    <>
      {/* Hero Section - Bold Editorial with Video Background */}
      <section ref={heroRef} className="section-full">
        {/* Video/Image Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/food background.png"
            alt="Culinary Excellence"
            fill
            className="video-background"
            priority
            quality={95}
          />
          <div className="video-overlay" />
        </div>

        {/* Hero Content */}
        <div className="wrapper relative z-10 text-center">
          <h1 ref={headingRef} className="heading-hero text-white mb-8 max-w-6xl mx-auto">
            Culinary
            <br />
            <span className="text-gradient-primary">Innovation</span>
            <br />
            Starts Here
          </h1>

          <p className="body-lg max-w-3xl mx-auto mb-12">
            "Innovation, to me, is about pushing boundaries and creating
            experiences that transform the way we taste, feel, and connect with food."
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/recipes">
              <button className="group relative px-10 py-5 bg-white text-black font-bold text-lg uppercase tracking-wide hover:bg-[var(--primary)] hover:text-white transition-all duration-300 flex items-center gap-3">
                Explore Recipes
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <button className="group flex items-center gap-3 text-white font-medium text-lg uppercase tracking-wide hover:text-[var(--primary)] transition-colors">
              <div className="w-12 h-12 rounded-full border-2 border-white group-hover:border-[var(--primary)] flex items-center justify-center transition-colors">
                <Play className="w-5 h-5 ml-1" />
              </div>
              Watch Story
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/70" />
        </div>
      </section>

      {/* Quote Section - Full Width */}
      <section className="section-half bg-black border-y-2 border-white/10">
        <div className="wrapper text-center">
          <p className="quote-text max-w-5xl mx-auto">
            "Every recipe tells a story. Every dish is an opportunity to innovate,
            to surprise, and to bring people together around what matters most."
          </p>
          <p className="text-white/50 mt-8 uppercase tracking-widest text-sm">
            — Chef's Philosophy
          </p>
        </div>
      </section>

      <FeaturesSection />
    </>
  );
}
