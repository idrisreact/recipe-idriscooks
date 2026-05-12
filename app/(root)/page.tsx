import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { desc } from 'drizzle-orm';
import { db } from '@/src/db';
import { recipes as recipesTable } from '@/src/db/schemas';
import { Recipe } from '@/src/types/recipes.types';
import { HomeRotation } from '@/src/components/home/home-rotation';

export const dynamic = 'force-dynamic';

const pillars = [
  {
    number: '01',
    title: 'Weeknight',
    description: 'Fast food without the panic. Short lists, clear steps, big return.',
  },
  {
    number: '02',
    title: 'Weekend',
    description: 'A little more time, a little more ceremony, still no pointless fuss.',
  },
  {
    number: '03',
    title: 'Project',
    description: 'The dishes you block out an afternoon for because the payoff is worth it.',
  },
];

const formatTime = (mins: number): string => {
  if (!mins) return '';
  if (mins < 60) return `${mins} min`;
  const hr = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hr} hr ${rem} min` : `${hr} hr`;
};

const fetchRotationRecipes = async (): Promise<Recipe[]> => {
  try {
    const rows = await db
      .select()
      .from(recipesTable)
      .orderBy(desc(recipesTable.id))
      .limit(12);
    return rows as Recipe[];
  } catch (error) {
    console.error('[home] failed to load rotation recipes', error);
    return [];
  }
};

export default async function Home() {
  const recipes = await fetchRotationRecipes();
  const featured = recipes[0];

  return (
    <>
      <section className="min-h-screen bg-[var(--cream)] pt-28 md:pt-24">
        <div className="grid min-h-[calc(100vh-6rem)] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-between px-6 pb-12 pt-12 sm:px-8 lg:px-16 lg:pb-16 lg:pt-[72px] xl:px-24">
            <div>
              <p className="eyebrow-rule">Issue 14 / Spring</p>
              <h1 className="display-xl mt-8 max-w-4xl">
                Cook
                <br />
                <span className="italic-tomato">like</span> you
                <br />
                mean it.
              </h1>
              <p className="body-lg mt-8 max-w-[420px]">
                Recipes I actually cook on weeknights - tested until they are not fussy, written so
                you do not need to re-read a step three times.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
              <Link href="/recipes" className="btn-ink group w-fit">
                Browse recipes
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/about" className="btn-link w-fit">
                What I am cooking this week
              </Link>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden lg:min-h-full">
            <Image
              src={featured?.imageUrl ?? '/images/food background.png'}
              alt={featured?.title ?? 'Overhead table with a finished dish, herbs, and citrus zest'}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {featured && (
              <Link
                href={`/recipes/category/${encodeURIComponent(featured.title)}`}
                className="absolute bottom-8 left-6 right-6 border-t-2 border-[var(--tomato)] bg-[var(--cream)] p-5 sm:left-auto sm:right-auto sm:w-[280px] lg:-left-12 lg:bottom-14"
              >
                <p className="eyebrow">This week's pick</p>
                <h2 className="subhead mt-2">{featured.title}</h2>
                <p className="mono-label mt-3 text-[var(--ink-60)]">
                  {formatTime(featured.cookTime)} / serves {featured.servings}
                </p>
              </Link>
            )}
          </div>
        </div>
      </section>

      <HomeRotation recipes={recipes} />

      <section className="bg-[var(--parchment)] px-6 py-16 sm:px-8 lg:px-16 lg:py-20 xl:px-24">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">Three pillars</p>
            <h2 className="display-s mt-3">Weeknight, weekend, project.</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.number} className="border-t border-[var(--ink)] pt-4">
                <p className="mono-label text-[var(--tomato)]">{pillar.number}</p>
                <h3 className="heading mt-6 text-[2rem]">{pillar.title}</h3>
                <p className="body-sm mt-3">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--ink)] px-6 py-16 text-[var(--cream)] sm:px-8 lg:px-16 lg:py-20 xl:px-24">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow-peach">A small archive of good things to cook.</p>
            <h2 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.01em] text-[var(--cream)] sm:text-6xl lg:text-7xl">
              No life stories before the recipe.
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-7 text-[var(--cream-70)]">
              No 47-ingredient lists. Just dishes that have earned a spot in the rotation.
            </p>
          </div>
          <Link href="/recipes" className="btn-cream group w-fit">
            Start with the basics
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
}
