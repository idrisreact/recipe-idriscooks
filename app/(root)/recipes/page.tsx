import { Recipes } from '@/src/components/recipe-server-component/recipes.server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Recipes - Browse Our Recipe Collection',
  description:
    'Browse our complete collection of recipes. Discover delicious dishes from appetizers to desserts, with easy-to-follow instructions and beautiful photos.',
  openGraph: {
    title: 'All Recipes - Browse Our Recipe Collection | Idris Cooks',
    description:
      'Browse our complete collection of recipes. Discover delicious dishes from appetizers to desserts.',
    type: 'website',
  },
};

export default async function RecipePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <section className="bg-[var(--cream)] pt-36 lg:pt-40">
        <div className="wrapper pb-16 lg:pb-20">
          <span className="eyebrow-rule">Recipes / Archive</span>

          <h1 className="display-m mt-6 max-w-4xl">
            The recipes, sorted for actual cooking.
          </h1>

          <p className="body-lg mt-6 max-w-2xl">
            No life stories before the recipe. No 47-ingredient lists. Just weeknight, weekend, and
            project dishes with the important bits easy to find.
          </p>

          <div className="mt-10 grid grid-cols-3 border-y border-[var(--ink)] text-center sm:max-w-xl">
            <div className="border-r border-[var(--ink-line)] py-4">
              <p className="mono-label text-[var(--tomato)]">Weeknight</p>
            </div>
            <div className="border-r border-[var(--ink-line)] py-4">
              <p className="mono-label text-[var(--tomato)]">Weekend</p>
            </div>
            <div className="py-4">
              <p className="mono-label text-[var(--tomato)]">Project</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] min-h-screen pb-24">
        <div className="wrapper">
          <Recipes session={session} />
        </div>
      </section>
    </>
  );
}
