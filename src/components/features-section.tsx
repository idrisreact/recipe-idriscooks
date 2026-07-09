'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/src/components/ui/Text';
import RecentRecipesSection from './recent-recipes-section';
import { ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

function MostPopularRecipes() {
  interface PopularRecipe {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    tags?: string[];
    favoriteCount: number;
  }

  const router = useRouter();

  const {
    data: recipes,
    isLoading,
    error,
  } = useQuery<PopularRecipe[]>({
    queryKey: ['popular-recipes'],
    queryFn: () => fetch('/api/recipes/popular').then((res) => res.json()),
  });

  if (isLoading)
    return (
      <section className="section-padded">
        <div className="wrapper">
          <div className="max-w-2xl mb-16">
            <span className="kicker mb-4">Popular</span>
            <h2 className="headline-xl text-white">Most Loved Recipes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-editorial animate-pulse">
                <div className="aspect-[3/4] bg-[var(--muted)]"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="section-padded">
        <div className="wrapper">
          <Text className="text-center text-destructive">Failed to load popular recipes</Text>
        </div>
      </section>
    );

  if (!recipes?.length) return null;

  return (
    <section className="section-padded bg-[var(--background-elevated)]">
      <div className="wrapper mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="kicker mb-4 block"
            >
              Popular
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="headline-xl text-white mb-4"
            >
              Most Loved
              <br />
              <span className="text-gradient">Recipes</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="body-lg"
            >
              The dishes that have captured hearts and taste buds alike.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/recipes" className="btn-link">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div className="wrapper-wide">
        <div className="horizontal-scroll gap-4 lg:gap-6 pb-6" data-lenis-prevent>
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="horizontal-scroll-item w-[80vw] sm:w-[60vw] md:w-[45vw] lg:w-[30vw] xl:w-[25vw] cursor-pointer group"
              onClick={() => router.push(`/recipes/category/${encodeURIComponent(recipe.title)}`)}
            >
              <div className="card-editorial aspect-[3/4] relative">
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${recipe.imageUrl})` }}
                />
                <div className="img-overlay" />

                {/* Number */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <span className="text-[80px] font-serif font-bold text-white/10 leading-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  {recipe.tags && recipe.tags[0] && (
                    <span className="caption text-[var(--primary)] mb-3">{recipe.tags[0]}</span>
                  )}
                  <h3 className="headline-sm text-white mb-2 line-clamp-2">{recipe.title}</h3>
                  <p className="body-md line-clamp-2 mb-4">{recipe.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="btn-link text-xs">
                      View Recipe
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{recipe.favoriteCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll Hint */}
        <div className="text-center mt-6">
          <span className="caption">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const features = [
    {
      number: '01',
      title: 'Expert Chefs',
      description: 'Learn from world-class culinary professionals with decades of experience.',
    },
    {
      number: '02',
      title: 'Fresh Ingredients',
      description: 'Premium quality, locally-sourced produce for authentic flavors.',
    },
    {
      number: '03',
      title: 'Quick Recipes',
      description: 'From 15-minute meals to slow-cooked perfection, recipes for every moment.',
    },
    {
      number: '04',
      title: 'Global Community',
      description: 'Join thousands of passionate food lovers sharing their culinary journeys.',
    },
  ];

  return (
    <section className="section-padded">
      <div className="wrapper">
        {/* Header */}
        <div className="max-w-2xl mb-16 lg:mb-24">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="kicker mb-4 block"
          >
            Why Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="headline-xl text-white mb-6"
          >
            The Idris Cooks
            <br />
            <span className="text-gradient">Difference</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="body-lg"
          >
            Where innovation meets tradition. Experience culinary excellence crafted by experts.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.03]">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-feature group bg-[var(--background)]"
            >
              <div className="flex items-start gap-8">
                {/* Number */}
                <span className="font-serif text-6xl lg:text-7xl font-bold text-[var(--primary)]/20 group-hover:text-[var(--primary)]/40 transition-colors leading-none">
                  {feature.number}
                </span>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="headline-sm text-white mb-4 group-hover:text-[var(--primary)] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="body-md">{feature.description}</p>
                </div>
              </div>

              {/* Hover Line */}
              <div className="absolute bottom-0 left-0 w-full h-px bg-[var(--primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="section-half bg-[var(--background-elevated)] border-y border-white/[0.03]">
      <div className="wrapper">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="kicker mb-6 block"
          >
            Ready to Cook?
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="headline-hero text-white mb-8"
          >
            Start Your
            <br />
            <span className="text-gradient">Journey</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="pull-quote mb-12"
          >
            &ldquo;The kitchen is where innovation happens. Where ingredients become art.&rdquo;
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/recipes">
              <button className="btn-primary group">
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <Link href="/about">
              <button className="btn-outline">Learn More</button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function FeaturesSection() {
  return (
    <>
      <WhyChooseUs />
      <MostPopularRecipes />
      <CTASection />
      <RecentRecipesSection />
    </>
  );
}
