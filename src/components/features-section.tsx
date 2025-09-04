'use client';

import React from 'react';
import { Card } from '@/src/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/src/components/ui/Text';
import RecentRecipesSection from './recent-recipes-section';

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
      <section className="wrapper my-16">
        <Text as="h2" variant="heading" className="text-center mb-6">
          Most Popular Recipes
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="murakamicity-card p-4 animate-pulse">
              <div className="h-32 bg-muted rounded-sm mb-3"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    );

  if (error)
    return (
      <section className="wrapper my-16">
        <Text className="text-center text-destructive">Failed to load popular recipes</Text>
      </section>
    );

  if (!recipes?.length) return null;

  return (
    <section className="wrapper my-16">
      <Text as="h2" variant="heading" className="text-center mb-6">
        Most Popular Recipes
      </Text>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="relative cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() => router.push(`/recipes/category/${encodeURIComponent(recipe.title)}`)}
          >
            <Card
              variant="recipe"
              backgroundImage={recipe.image_url}
              title={recipe.title}
              subtitle={recipe.description?.slice(0, 50) + '...'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function FeaturesSection() {
  return (
    <>
      <MostPopularRecipes />

      <section className="wrapper my-20 flex flex-col items-center">
        <Text as="h2" variant="heading" className="text-center mb-4">
          Become a true <span className="text-primary">chef</span> with our recipes.
        </Text>
        <Text variant="large" className="text-muted-foreground text-center mb-16 max-w-2xl">
          We are a home to variety of recipes worldwide for you to learn.
        </Text>
      </section>

      <RecentRecipesSection />
    </>
  );
}
