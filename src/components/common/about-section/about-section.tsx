'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, ChefHat, Users, Clock, LucideIcon } from 'lucide-react';
import Link from 'next/link';

// --- Components ---

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <Image
          src="/images/idris-cooks-13.png"
          alt="Idris Taiwo Chef"
          fill
          className="object-cover brightness-[0.6]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-xs uppercase tracking-[0.2em] text-white/80 mb-6 backdrop-blur-md">
            The Story
          </span>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-6 mix-blend-overlay">
            IDRIS
            <br />
            TAIWO
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Culinary Artist & Content Creator
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-xs uppercase tracking-widest"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Scroll to Explore
      </motion.div>
    </section>
  );
};

const Bio = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section className="py-32 bg-black text-white relative overflow-hidden">
      <div className="wrapper max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[3/4] relative overflow-hidden rounded-2xl">
              <Image
                src="/images/idriscooks-cartoon.png"
                alt="Idris Cartoon"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--primary)] rounded-full blur-3xl opacity-50" />
          </motion.div>

          <div className="space-y-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold leading-tight"
            >
              More than just <span className="text-gradient-primary">cooking</span>.
              <br />
              It&apos;s an experience.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-6 text-lg text-white/60 leading-relaxed"
            >
              <p>
                Welcome to my kitchen! I&apos;m passionate about making cooking fun, accessible, and
                delicious for everyone. Whether you&apos;re a beginner or a seasoned chef,
                you&apos;ll find inspiration, tips, and a world of flavors here.
              </p>
              <p>
                My journey started with a simple curiosity and has grown into a global community of
                food lovers. I believe that food is the ultimate connector—bridging cultures,
                generations, and hearts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Image
                src="/images/idris-cooks-logo-v1.JPG"
                alt="Signature"
                width={120}
                height={60}
                className="opacity-80 invert"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: LucideIcon;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center text-center p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl hover:bg-white/10 transition-colors group"
    >
      <div className="mb-4 p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-[var(--primary)]" />
      </div>
      <h3 className="text-5xl font-black text-white mb-2">{value}</h3>
      <p className="text-sm uppercase tracking-widest text-white/50">{label}</p>
    </motion.div>
  );
};

const Stats = () => {
  return (
    <section className="py-20 bg-black border-y border-white/10">
      <div className="wrapper">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatItem value="17K+" label="Followers" icon={Users} />
          <StatItem value="100+" label="Recipes" icon={ChefHat} />
          <StatItem value="8+" label="Years Cooking" icon={Clock} />
        </div>
      </div>
    </section>
  );
};

const PhilosophyItem = ({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) => {
  return (
    <div className="group relative border-t border-white/20 py-12 transition-colors hover:bg-white/5">
      <div className="wrapper flex flex-col md:flex-row gap-8 md:items-baseline">
        <span className="text-sm font-mono text-[var(--primary)]">0{number}</span>
        <h3 className="text-3xl md:text-5xl font-bold text-white flex-1 group-hover:translate-x-4 transition-transform duration-500">
          {title}
        </h3>
        <p className="text-white/50 max-w-md md:text-right group-hover:text-white/80 transition-colors">
          {desc}
        </p>
      </div>
    </div>
  );
};

const Philosophy = () => {
  return (
    <section className="py-32 bg-black">
      <div className="wrapper mb-20">
        <span className="text-[var(--primary)] uppercase tracking-widest text-sm font-bold">
          Philosophy
        </span>
        <h2 className="text-4xl md:text-6xl font-bold text-white mt-4">
          The Art of <br />
          Modern Cooking
        </h2>
      </div>

      <div className="border-b border-white/20">
        <PhilosophyItem
          number="1"
          title="Simplicity"
          desc="Great food doesn't have to be complicated. We focus on quality ingredients and precise techniques."
        />
        <PhilosophyItem
          number="2"
          title="Innovation"
          desc="Pushing boundaries while respecting tradition. Every recipe is a new experiment."
        />
        <PhilosophyItem
          number="3"
          title="Community"
          desc="Food brings us together. We build connections through shared culinary experiences."
        />
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-40 bg-black text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/food-background.png')] opacity-20 bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="wrapper relative z-10">
        <h2 className="text-5xl md:text-8xl font-black text-white mb-12 tracking-tight">
          READY TO <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-white">
            START COOKING?
          </span>
        </h2>

        <Link href="/recipes">
          <button className="group relative px-12 py-6 bg-white text-black rounded-full text-xl font-bold overflow-hidden transition-all hover:scale-105">
            <span className="relative z-10 flex items-center gap-3">
              Browse Recipes <ArrowRight className="w-6 h-6" />
            </span>
            <div className="absolute inset-0 bg-[var(--primary)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Browse Recipes <ArrowRight className="w-6 h-6" />
            </span>
          </button>
        </Link>
      </div>
    </section>
  );
};

export const AboutSection = () => {
  return (
    <main className="bg-black min-h-screen">
      <Hero />
      <Bio />
      <Stats />
      <Philosophy />
      <CTA />
    </main>
  );
};
