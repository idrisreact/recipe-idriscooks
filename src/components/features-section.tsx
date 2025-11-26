'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/src/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/src/components/ui/Text';
import RecentRecipesSection from './recent-recipes-section';
import { ChefHat, Utensils, Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, cardHoverSubtle, fadeInScale } from '@/src/utils/animations';

function MostPopularRecipes() {
  interface PopularRecipe {
    id: number;
    title: string;
    description: string;
    image_url: string;
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
      <section className="wrapper my-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium text-white/90">Popular Recipes</span>
          </div>
          <h2 className="heading-lg mb-4">Most Popular Recipes</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="luxury-card animate-pulse">
              <div className="h-56 bg-muted rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );

  if (error)
    return (
      <section className="wrapper my-20">
        <Text className="text-center text-destructive">Failed to load popular recipes</Text>
      </section>
    );

  if (!recipes?.length) return null;

  // Transform recipes for horizontal carousel
  const carouselRecipes = recipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.image_url,
    category: recipe.tags && recipe.tags[0] ? recipe.tags[0] : undefined,
  }));

  return (
    <section className="py-24 bg-black">
      <div className="wrapper mb-16">
        <div className="max-w-4xl">
          <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 text-xs uppercase tracking-widest text-white mb-6">
            Featured
          </div>
          <h2 className="heading-xl mb-6">
            Most Popular
            <br />
            <span className="text-gradient-primary">Recipes</span>
          </h2>
          <p className="body-lg">
            Discover the dishes that our community loves the most. Tried, tested,
            and celebrated by thousands of food enthusiasts worldwide.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="wrapper-xl">
        <div className="horizontal-scroll">
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="horizontal-scroll-item w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[35vw] xl:w-[28vw] cursor-pointer"
              onClick={() => router.push(`/recipes/category/${encodeURIComponent(recipe.title)}`)}
            >
              <div className="editorial-card h-[600px] group">
                {/* Recipe Image */}
                <div
                  className="editorial-card-image"
                  style={{ backgroundImage: `url(${recipe.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />

                {/* Content Overlay */}
                <div className="editorial-card-content">
                  {recipe.tags && recipe.tags[0] && (
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-xs uppercase tracking-wider text-white mb-4">
                      {recipe.tags[0]}
                    </span>
                  )}
                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-tight leading-tight">
                    {recipe.title}
                  </h3>
                  <p className="text-white/70 line-clamp-2 mb-4 text-lg">{recipe.description}</p>

                  <div className="flex items-center gap-2 text-white group-hover:text-[var(--primary)] transition-colors">
                    <span className="text-sm uppercase tracking-wide font-bold">View Recipe</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Favorite Count */}
                  <div className="mt-6 flex items-center gap-4 text-white/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">♥</span>
                      <span className="font-medium">{recipe.favoriteCount}</span>
                    </div>
                  </div>
                </div>

                {/* Number Badge */}
                <div className="absolute top-8 left-8 w-16 h-16 bg-black/50 backdrop-blur-md border-2 border-white/30 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="wrapper mt-12 text-center">
        <p className="text-white/40 uppercase tracking-widest text-xs">
          ← Scroll to explore more →
        </p>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const features = [
    {
      title: "Expert",
      subtitle: "Chefs",
      description: "Learn from world-class culinary professionals",
      number: "01"
    },
    {
      title: "Fresh",
      subtitle: "Ingredients",
      description: "Premium quality, locally-sourced produce",
      number: "02"
    },
    {
      title: "Quick",
      subtitle: "Recipes",
      description: "From 15-minute meals to slow-cooked perfection",
      number: "03"
    },
    {
      title: "Global",
      subtitle: "Community",
      description: "Join thousands of passionate food lovers",
      number: "04"
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      <div className="wrapper">
        <div className="text-center mb-20">
          <h2 className="heading-xl mb-6">
            Why Choose
            <br />
            <span className="text-gradient-primary">Idris Cooks</span>
          </h2>
          <p className="body-lg max-w-3xl mx-auto">
            Innovation meets tradition in every recipe. Experience culinary excellence
            crafted by experts, designed for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 border-2 border-white/10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-black border-r-2 border-white/10 last:border-r-0 hover:bg-white/5 transition-all duration-500 p-10"
            >
              {/* Number */}
              <div className="text-8xl font-black text-white/5 group-hover:text-white/10 transition-all mb-6">
                {feature.number}
              </div>

              {/* Title */}
              <h3 className="text-4xl font-black uppercase text-white mb-2 leading-tight">
                {feature.title}
                <br />
                <span className="text-[var(--primary)]">{feature.subtitle}</span>
              </h3>

              {/* Description */}
              <p className="text-white/60 mt-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
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

      {/* CTA Section - Bold Editorial */}
      <section className="section-full bg-black border-y-2 border-white/10">
        <div className="wrapper text-center">
          <div className="max-w-5xl mx-auto">
            <div className="inline-block px-3 py-1 bg-[var(--primary)]/20 border border-[var(--primary)]/40 text-xs uppercase tracking-widest text-[var(--primary)] mb-8">
              Ready to Cook?
            </div>

            <h2 className="heading-hero mb-8">
              Start Your
              <br />
              <span className="text-gradient-primary">Culinary</span>
              <br />
              Journey
            </h2>

            <p className="quote-text max-w-4xl mx-auto mb-16">
              "The kitchen is where innovation happens. Where ingredients become art.
              Where passion meets precision."
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/recipes">
                <button className="group px-12 py-6 bg-white text-black font-black text-xl uppercase tracking-wide hover:bg-[var(--primary)] hover:text-white transition-all duration-300 flex items-center gap-3">
                  Get Started
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>

              <Link href="/about">
                <button className="group px-12 py-6 border-2 border-white text-white font-black text-xl uppercase tracking-wide hover:bg-white hover:text-black transition-all duration-300">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RecentRecipesSection />
    </>
  );
}
