import { Recipes } from '@/src/components/recipe-server-component/recipes.server';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
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
      {/* Hero Section - Editorial Style */}
      <section className="section-hero relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/food background.png"
            alt="Recipe Collection"
            fill
            className="object-cover"
            priority
            quality={95}
          />
          {/* Multi-layer overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-transparent" />
          <div className="img-vignette" />
        </div>

        {/* Content - Left Aligned Editorial */}
        <div className="wrapper relative z-10 flex flex-col items-start justify-center min-h-screen py-32">
          <span className="kicker mb-6">Our Collection</span>

          <h1 className="headline-massive text-white max-w-4xl mb-8">
            The
            <br />
            <span className="text-gradient">Recipes</span>
          </h1>

          <p className="body-xl max-w-xl mb-12">
            Explore our curated selection of recipes. From quick weeknight meals to culinary
            masterpieces.
          </p>

          {/* Decorative line */}
          <div className="w-24 h-px bg-[var(--primary)]" />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
          <span className="caption">Explore</span>
          <ArrowDown className="w-4 h-4 text-white/40 animate-bounce" />
        </div>

        {/* Side Detail */}
        <div className="hidden lg:block absolute right-16 xl:right-24 top-1/2 -translate-y-1/2 z-10">
          <div className="flex flex-col items-end gap-2">
            <span className="caption">Curated</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Recipes Section */}
      <section className="bg-[var(--background)] min-h-screen py-24">
        <div className="wrapper">
          <Recipes session={session} />
        </div>
      </section>
    </>
  );
}
