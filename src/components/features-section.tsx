'use client';

import React from 'react';
import { Card } from '@/src/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/src/components/ui/Text';
import RecentRecipesSection from './recent-recipes-section';
import { ChefHat, Utensils, Clock, Users, ArrowRight } from 'lucide-react';

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
      <section className="wrapper my-20">
        <div className="flex flex-col items-center mb-12">
          <Text as="h2" variant="heading" className="text-center mb-4">
            Most Popular Recipes
          </Text>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg overflow-hidden shadow-lg border border-border/50 animate-pulse">
              <div className="h-48 bg-muted"></div>
              <div className="p-4 space-y-3">
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

  return (
    <section className="wrapper my-20">
      <div className="flex flex-col items-center mb-12">
        <Text as="h2" variant="heading" className="text-center mb-4">
          Most Popular Recipes
        </Text>
        <div className="h-1 w-20 bg-primary rounded-full"></div>
        <p className="text-muted-foreground mt-4 text-center max-w-2xl">
          Discover the dishes that our community loves the most. Tried, tested, and tasted by thousands.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-lg overflow-hidden"
            onClick={() => router.push(`/recipes/category/${encodeURIComponent(recipe.title)}`)}
          >
            <Card
              variant="recipe"
              backgroundImage={recipe.image_url}
              title={recipe.title}
              subtitle={recipe.description?.slice(0, 60) + (recipe.description?.length > 60 ? '...' : '')}
              className="h-full border-none"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const features = [
    {
      icon: <ChefHat className="w-8 h-8 text-primary" />,
      title: "Expert Chefs",
      description: "Learn from the best with recipes curated by professional chefs."
    },
    {
      icon: <Utensils className="w-8 h-8 text-primary" />,
      title: "Quality Ingredients",
      description: "We focus on using fresh, high-quality ingredients for every dish."
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Quick & Easy",
      description: "Find recipes that fit your schedule, from 15-minute meals to slow-cooked feasts."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Community",
      description: "Join a vibrant community of food lovers and share your culinary journey."
    }
  ];

  return (
    <section className="bg-muted/30 py-20">
      <div className="wrapper">
        <div className="text-center mb-16">
          <Text as="h2" variant="heading" className="mb-4">Why Choose Idris Cooks?</Text>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're more than just a recipe site. We're your partner in the kitchen.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors duration-300 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
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

      <section className="wrapper my-24 relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center py-20 px-6">
          <ChefHat className="w-16 h-16 text-primary mb-6 opacity-80" />
          <Text as="h2" variant="heading" className="mb-6 max-w-3xl">
            Become a true <span className="text-primary">chef</span> with our recipes.
          </Text>
          <Text variant="large" className="text-muted-foreground mb-10 max-w-2xl">
            Unlock your culinary potential. From basics to gourmet, we have everything you need to succeed in the kitchen.
          </Text>
          <button className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/25">
            Start Cooking Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <RecentRecipesSection />
    </>
  );
}
