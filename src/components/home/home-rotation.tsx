'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Recipe } from '@/src/types/recipes.types';

type RotationFilter = 'all' | '30 min' | 'slow' | 'one pan' | 'vegetarian';

const filters: { label: string; value: RotationFilter }[] = [
  { label: 'All', value: 'all' },
  { label: '30 min', value: '30 min' },
  { label: 'Slow', value: 'slow' },
  { label: 'One pan', value: 'one pan' },
  { label: 'Vegetarian', value: 'vegetarian' },
];

const matches = (recipe: Recipe, filter: RotationFilter): boolean => {
  if (filter === 'all') return true;
  const tags = (recipe.tags ?? []).map((t) => t.toLowerCase());
  const cookTime = recipe.cookTime ?? 0;
  if (filter === '30 min') return cookTime > 0 && cookTime <= 30;
  if (filter === 'slow') return cookTime >= 120 || tags.includes('slow');
  return tags.some((t) => t.includes(filter));
};

const formatTime = (mins: number): string => {
  if (!mins) return '';
  if (mins < 60) return `${mins} min`;
  const hr = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hr} hr ${rem} min` : `${hr} hr`;
};

const tagFor = (recipe: Recipe, index: number): string => {
  if (index === 0) return 'Featured';
  const tag = recipe.tags?.[0];
  return tag ? tag : 'Recipe';
};

interface Props {
  recipes: Recipe[];
}

export const HomeRotation = ({ recipes }: Props) => {
  const [activeFilter, setActiveFilter] = useState<RotationFilter>('all');

  const visibleRecipes = useMemo(() => {
    const filtered = recipes.filter((r) => matches(r, activeFilter));
    const source = filtered.length ? filtered : recipes;
    return source.slice(0, 3);
  }, [recipes, activeFilter]);

  return (
    <section className="bg-[var(--cream)] px-6 py-16 sm:px-8 lg:px-16 lg:py-[72px] xl:px-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-8 border-b border-[var(--ink)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">What I am cooking / May</p>
            <h2 className="display-s mt-3">
              This month's <span className="italic">rotation</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`chip ${activeFilter === filter.value ? 'chip-active' : ''}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-9 lg:grid-cols-[1.3fr_1fr_1fr]">
          {visibleRecipes.map((recipe, index) => (
            <RotationCard
              key={`${recipe.id}-${activeFilter}`}
              recipe={recipe}
              big={index === 0}
              tag={tagFor(recipe, index)}
              accent={index === 0 ? 'tomato' : 'olive'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface CardProps {
  recipe: Recipe;
  big?: boolean;
  tag: string;
  accent: 'tomato' | 'olive';
}

const RotationCard = ({ recipe, big, tag, accent }: CardProps) => (
  <Link
    href={`/recipes/category/${encodeURIComponent(recipe.title)}`}
    className="group block border-t border-[var(--ink)] pt-3"
  >
    <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em]">
      <span className={accent === 'tomato' ? 'text-[var(--tomato)]' : 'text-[var(--olive)]'}>
        {tag}
      </span>
      <span className="text-[var(--ink-50)]">{formatTime(recipe.cookTime)}</span>
    </div>
    <div
      className={`relative mt-4 overflow-hidden bg-[var(--parchment)] ${
        big ? 'h-[320px] lg:h-[380px]' : 'h-[240px]'
      }`}
    >
      <Image
        src={recipe.imageUrl}
        alt={recipe.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes={big ? '(max-width: 1024px) 100vw, 45vw' : '(max-width: 1024px) 100vw, 28vw'}
      />
    </div>
    <h3 className={`${big ? 'heading' : 'subhead'} mt-4 transition-colors group-hover:text-[var(--tomato)]`}>
      {recipe.title}
    </h3>
    <p className="body-sm mt-2 line-clamp-2">{recipe.description}</p>
  </Link>
);
