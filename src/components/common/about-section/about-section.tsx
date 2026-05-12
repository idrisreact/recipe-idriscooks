'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ChefHat, Users, Clock, LucideIcon } from 'lucide-react';

const Hero = () => (
  <section className="bg-[var(--cream)] pt-28 md:pt-24">
    <div className="grid min-h-[calc(100vh-6rem)] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col justify-between px-6 pb-12 pt-12 sm:px-8 lg:px-16 lg:pb-16 lg:pt-[72px] xl:px-24">
        <div>
          <p className="eyebrow-rule">The Story / About</p>
          <h1 className="display-xl mt-8 max-w-4xl">
            idris
            <br />
            <span className="italic-tomato">cooks</span>,
            <br />
            in the kitchen.
          </h1>
          <p className="body-lg mt-8 max-w-[460px]">
            A culinary artist building a small archive of dishes worth cooking. No life stories
            before the recipe. No 47-ingredient lists. Just the way I actually cook.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
          <Link href="/recipes" className="btn-ink group w-fit">
            Browse recipes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer noopener"
            className="btn-link w-fit"
          >
            Follow along on Instagram
          </a>
        </div>
      </div>

      <div className="relative min-h-[520px] lg:min-h-full">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/idris-cooks-13.png"
            alt="Idris Cooks at work in the kitchen"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="absolute bottom-8 left-6 right-6 z-10 border-t-2 border-[var(--tomato)] bg-[var(--cream)] p-5 sm:left-auto sm:right-auto sm:w-[280px] lg:-left-12 lg:bottom-14">
          <p className="eyebrow">Currently</p>
          <h2 className="subhead mt-2">Cooking through spring.</h2>
          <p className="mono-label mt-3 text-[var(--ink-60)]">Issue 14 / Spring</p>
        </div>
      </div>
    </div>
  </section>
);

const Bio = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section className="bg-[var(--parchment)] px-6 py-16 sm:px-8 lg:px-16 lg:py-20 xl:px-24">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative aspect-[3/4] overflow-hidden bg-[var(--cream)]"
        >
          <Image
            src="/images/idriscooks-cartoon.png"
            alt="Idris portrait"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </motion.div>

        <div className="space-y-8">
          <p className="eyebrow">Bio / In short</p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="display-s"
          >
            More than just cooking. <span className="italic">It&apos;s a practice.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="space-y-5"
          >
            <p className="body-lg">
              Welcome to my kitchen. I&apos;m passionate about making cooking feel fun, accessible,
              and worth the effort - whether you&apos;re a complete beginner or you&apos;ve been at
              this for years.
            </p>
            <p className="body-lg">
              What started as a simple curiosity has turned into a global community of food lovers.
              I believe food is the ultimate connector: it bridges cultures, generations, and
              hearts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="pt-2"
          >
            <Link href="/recipes" className="btn-link">
              See what I&apos;m cooking now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface StatProps {
  value: string;
  label: string;
  icon: LucideIcon;
}

const StatItem = ({ value, label, icon: Icon }: StatProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="border-t border-[var(--ink)] pt-5"
    >
      <Icon className="h-5 w-5 text-[var(--tomato)]" strokeWidth={1.5} />
      <p className="heading mt-8 text-[3rem] leading-none">{value}</p>
      <p className="mono-label mt-3 text-[var(--ink-60)]">{label}</p>
    </motion.article>
  );
};

const Stats = () => (
  <section className="bg-[var(--cream)] px-6 py-16 sm:px-8 lg:px-16 lg:py-20 xl:px-24">
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col gap-4 border-b border-[var(--ink)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">By the numbers</p>
          <h2 className="display-s mt-3">A little context.</h2>
        </div>
        <p className="body-sm max-w-md text-[var(--ink-60)]">
          Numbers I keep an eye on, but not the reason any of this happens.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-9 md:grid-cols-3">
        <StatItem value="17K+" label="Followers" icon={Users} />
        <StatItem value="100+" label="Recipes tested" icon={ChefHat} />
        <StatItem value="8+" label="Years cooking" icon={Clock} />
      </div>
    </div>
  </section>
);

interface PhilosophyProps {
  number: string;
  title: string;
  desc: string;
}

const PhilosophyItem = ({ number, title, desc }: PhilosophyProps) => (
  <article className="border-t border-[var(--ink)] py-10 transition-colors hover:bg-[var(--parchment)]">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[80px_1fr_320px] md:items-baseline">
      <span className="mono-label text-[var(--tomato)]">{number}</span>
      <h3 className="heading">{title}</h3>
      <p className="body-md md:text-right">{desc}</p>
    </div>
  </article>
);

const Philosophy = () => (
  <section className="bg-[var(--parchment)] px-6 py-16 sm:px-8 lg:px-16 lg:py-20 xl:px-24">
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow">Philosophy</p>
        <h2 className="display-s mt-3">
          The art of <span className="italic">modern cooking</span>.
        </h2>
      </div>

      <div className="border-b border-[var(--ink)]">
        <PhilosophyItem
          number="01"
          title="Simplicity"
          desc="Great food doesn't have to be complicated. Focus on quality ingredients and precise technique."
        />
        <PhilosophyItem
          number="02"
          title="Innovation"
          desc="Pushing the boundaries while respecting tradition. Every recipe is a small experiment."
        />
        <PhilosophyItem
          number="03"
          title="Community"
          desc="Food brings us together. The good stuff comes from sharing the table."
        />
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="bg-[var(--ink)] px-6 py-16 text-[var(--cream)] sm:px-8 lg:px-16 lg:py-20 xl:px-24">
    <div className="mx-auto flex max-w-[1440px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="eyebrow-peach">Ready when you are.</p>
        <h2 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.01em] text-[var(--cream)] sm:text-6xl lg:text-7xl">
          Start cooking.
        </h2>
        <p className="mt-6 max-w-xl text-[17px] leading-7 text-[var(--cream-70)]">
          The archive is small on purpose. Every recipe earned its spot.
        </p>
      </div>
      <Link href="/recipes" className="btn-cream group w-fit">
        Browse recipes
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  </section>
);

export const AboutSection = () => (
  <main>
    <Hero />
    <Bio />
    <Stats />
    <Philosophy />
    <CTA />
  </main>
);
