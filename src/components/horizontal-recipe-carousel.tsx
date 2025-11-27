'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
}

interface HorizontalRecipeCarouselProps {
  recipes: Recipe[];
  title: string;
  subtitle?: string;
}

export function HorizontalRecipeCarousel({
  recipes,
  title,
  subtitle,
}: HorizontalRecipeCarouselProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal animation
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 80,
      duration: 1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="wrapper mb-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="heading-lg mb-4">{title}</h2>
            {subtitle && <p className="body-md max-w-2xl">{subtitle}</p>}
          </div>
          <Link href="/recipes" className="hidden md:block group">
            <div className="flex items-center gap-2 text-white hover:text-[var(--primary)] transition-colors uppercase tracking-wide font-medium">
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="wrapper-xl">
        <div ref={carouselRef} className="horizontal-scroll">
          {recipes.map((recipe, index) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="horizontal-scroll-item w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[35vw] xl:w-[28vw]"
            >
              <div className="editorial-card h-[500px] group">
                {/* Recipe Image */}
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fill
                  className="editorial-card-image"
                  quality={90}
                />

                {/* Content Overlay */}
                <div className="editorial-card-content">
                  {recipe.category && (
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-xs uppercase tracking-wider text-white mb-4">
                      {recipe.category}
                    </span>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 uppercase tracking-tight">
                    {recipe.title}
                  </h3>
                  <p className="text-white/70 line-clamp-2 mb-4">{recipe.description}</p>

                  <div className="flex items-center gap-2 text-white group-hover:text-[var(--primary)] transition-colors">
                    <span className="text-sm uppercase tracking-wide font-medium">View Recipe</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Number Badge */}
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile View All Link */}
      <div className="wrapper mt-8 md:hidden">
        <Link href="/recipes" className="group w-full flex items-center justify-center gap-2 py-4 border-2 border-white/20 hover:border-white/40 text-white hover:text-[var(--primary)] transition-all uppercase tracking-wide font-medium">
          View All Recipes
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
