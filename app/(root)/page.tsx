'use client';

import Image from 'next/image';
import Link from 'next/link';
import FeaturesSection from '@/src/components/features-section';
import { useGsapParallax, useGsapAnimation } from '@/src/hooks/use-gsap-animation';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const heroRef = useGsapParallax<HTMLDivElement>({
    opacity: 0,
    y: -50,
  });

  const headingRef = useGsapAnimation<HTMLHeadingElement>(
    {
      opacity: 0,
      y: 80,
      duration: 1.4,
      ease: 'power4.out',
      delay: 0.4,
    },
    true
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION - Bold Editorial Cinematic
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="section-hero">
        {/* Background Image with Cinematic Treatment */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/food background.png"
            alt="Culinary Excellence"
            fill
            className="img-cover"
            priority
            quality={95}
          />
          {/* Multi-layer overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-transparent" />
          <div className="img-vignette" />
        </div>

        {/* Hero Content - Asymmetric Editorial Layout */}
        <div className="wrapper relative z-10 flex flex-col items-start justify-center min-h-screen py-32">
          {/* Kicker */}
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="kicker mb-6"
          >
            The Art of Culinary Excellence
          </motion.p>

          {/* Main Headline - Left Aligned, Massive */}
          <h1 ref={headingRef} className="headline-massive text-white max-w-5xl mb-8">
            Where Every
            <br />
            <span className="text-gradient">Dish Tells</span>
            <br />A Story
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="body-xl max-w-xl mb-12"
          >
            Discover recipes that transform ordinary ingredients into extraordinary experiences.
          </motion.p>

          {/* CTA Buttons - Editorial Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/recipes">
              <button className="btn-primary group">
                Explore Recipes
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <Link href="/about">
              <button className="btn-outline">Our Story</button>
            </Link>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="absolute bottom-32 left-6 sm:left-8 lg:left-16 xl:left-24 w-24 h-px bg-[var(--primary)] origin-left"
          />
        </div>

        {/* Scroll Indicator - Refined */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
        >
          <span className="caption">Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="w-4 h-4 text-white/40" />
          </motion.div>
        </motion.div>

        {/* Side Text - Editorial Detail */}
        <div className="hidden lg:block absolute right-16 xl:right-24 top-1/2 -translate-y-1/2 z-10">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-col items-end gap-2"
          >
            <span className="caption">Est. 2024</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          QUOTE SECTION - Editorial Pull Quote
      ═══════════════════════════════════════════════════════════════ */}
      <section className="section-half bg-[var(--background-elevated)] border-y border-white/[0.03]">
        <div className="wrapper">
          <div className="max-w-4xl mx-auto text-center">
            {/* Decorative Quote Mark */}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block text-[var(--primary)]/20 text-[120px] leading-none font-serif mb-[-60px]"
            >
              &ldquo;
            </motion.span>

            <motion.blockquote
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="pull-quote mb-12"
            >
              Every recipe tells a story. Every dish is an opportunity to innovate, to surprise, and
              to bring people together around what matters most.
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-6"
            >
              <div className="h-px w-12 bg-[var(--primary)]" />
              <p className="caption text-[var(--primary)]">Idris Cooks Philosophy</p>
              <div className="h-px w-12 bg-[var(--primary)]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED SECTION - Asymmetric Editorial Grid
      ═══════════════════════════════════════════════════════════════ */}
      <section className="section-padded">
        <div className="wrapper">
          {/* Section Header - Left Aligned */}
          <div className="max-w-2xl mb-16">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="kicker mb-4"
            >
              Featured
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="headline-xl text-white mb-6"
            >
              Curated for You
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="body-lg"
            >
              Handpicked recipes from our collection, designed to inspire your next culinary
              adventure.
            </motion.p>
          </div>

          {/* Asymmetric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Large Featured Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 group"
            >
              <Link href="/recipes" className="block">
                <div className="card-editorial aspect-[4/3] lg:aspect-[16/10]">
                  <Image
                    src="/images/food background.png"
                    alt="Featured Recipe"
                    fill
                    className="img-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="img-overlay" />
                  <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end">
                    <span className="caption text-[var(--primary)] mb-3">Latest Creation</span>
                    <h3 className="headline-md text-white mb-3">Seasonal Specials</h3>
                    <p className="body-md max-w-md mb-6">
                      Discover recipes that celebrate the best ingredients of the season.
                    </p>
                    <span className="btn-link w-fit">
                      View Collection
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Stacked Cards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group flex-1"
              >
                <Link href="/recipes" className="block h-full">
                  <div className="card-editorial h-full min-h-[200px]">
                    <Image
                      src="/images/food background.png"
                      alt="Quick Recipes"
                      fill
                      className="img-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="img-overlay" />
                    <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                      <span className="caption text-[var(--primary)] mb-2">Quick & Easy</span>
                      <h3 className="headline-sm text-white">30-Minute Meals</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group flex-1"
              >
                <Link href="/recipes" className="block h-full">
                  <div className="card-editorial h-full min-h-[200px]">
                    <Image
                      src="/images/food background.png"
                      alt="Techniques"
                      fill
                      className="img-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="img-overlay" />
                    <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                      <span className="caption text-[var(--primary)] mb-2">Master Class</span>
                      <h3 className="headline-sm text-white">Essential Techniques</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* View All Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex justify-center"
          >
            <Link href="/recipes" className="btn-link">
              View All Recipes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-accent" />

      {/* Features Section */}
      <FeaturesSection />
    </>
  );
}
