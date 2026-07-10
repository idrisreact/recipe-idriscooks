'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, Download, Heart, Lock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/src/types/recipes.types';
import { useFavorites } from '@/src/hooks/use-favorites';
import { SignInOverlay } from './sign-in-overlay';
import AddToShoppingListButton from '@/src/components/shopping-list/add-to-shopping-list-button';
import AddToCollectionButton from '@/src/components/collections/add-to-collection-button';
import { CookingModeButton } from '@/src/components/recipe-step-cards/cooking-mode-button';
import { convertInstructionsToSteps } from '@/src/components/recipe-step-cards/utils';
import toast from 'react-hot-toast';

type Props = {
  recipe: Recipe;
  canView: boolean;
  hasPdfAccess?: boolean;
};

function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function formatIngredient(quantity: number, unit: string): string {
  return [quantity, unit].filter(Boolean).join(' ');
}

function splitStep(step: string, index: number) {
  const firstStop = step.indexOf('.');
  const hasUsefulHeading = firstStop > 16 && firstStop < 72;

  if (!hasUsefulHeading) {
    return {
      heading: `Step ${index + 1}`,
      body: step,
    };
  }

  return {
    heading: step.slice(0, firstStop),
    body: step.slice(firstStop + 1).trim() || step,
  };
}

export function RecipeDetailedView({ recipe, canView, hasPdfAccess = false }: Props) {
  const router = useRouter();
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();
  const [isDownloading, setIsDownloading] = useState(false);

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
  const favorited = isFavorited(recipe.id);

  const cookingSteps = useMemo(() => {
    return convertInstructionsToSteps(recipe.steps || [], recipe.imageUrl);
  }, [recipe.steps, recipe.imageUrl]);

  const toggleFavorite = async () => {
    if (favorited) await removeFromFavorites(recipe.id);
    else await addToFavorites(recipe.id);
  };

  const share = () => {
    const url = `${window.location.origin}/recipes/category/${encodeURIComponent(recipe.title)}`;
    if (navigator.share) {
      navigator.share({ title: recipe.title, text: recipe.description, url });
    } else {
      navigator.clipboard.writeText(`${recipe.title} - ${url}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDownloadPDF = async () => {
    if (!hasPdfAccess) {
      toast.error('Upgrade to download recipe PDFs!');
      router.push('/pricing');
      return;
    }

    try {
      setIsDownloading(true);
      const toastId = toast.loading('Generating PDF...');

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipes: [recipe],
          title: recipe.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recipe.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="relative w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/recipes')}
          className="w-fit rounded-none border-[var(--ink)] bg-transparent text-[var(--ink)] shadow-none hover:bg-[var(--parchment)]"
        >
          <ArrowLeft className="h-4 w-4" /> Recipes
        </Button>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="rounded-none border-[var(--ink)] bg-transparent text-[var(--ink)] shadow-none hover:bg-[var(--ink)] hover:text-[var(--cream)]"
          >
            {hasPdfAccess ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {isDownloading ? 'Generating...' : 'PDF'}
          </Button>
          <Button
            variant="outline"
            onClick={toggleFavorite}
            className="rounded-none border-[var(--ink)] bg-transparent text-[var(--ink)] shadow-none hover:bg-[var(--ink)] hover:text-[var(--cream)]"
          >
            <Heart
              className={`h-4 w-4 ${favorited ? 'fill-[var(--tomato)] text-[var(--tomato)]' : ''}`}
            />
            {favorited ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="outline"
            onClick={share}
            className="rounded-none border-[var(--ink)] bg-transparent text-[var(--ink)] shadow-none hover:bg-[var(--ink)] hover:text-[var(--cream)]"
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div>
        <p className="eyebrow">
          Recipes / {recipe.tags?.[0] || 'Archive'} / {recipe.tags?.[1] || 'Dinner'}
        </p>
        <h1 className="display-m mt-4 max-w-5xl">{recipe.title}</h1>
        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.04em] text-[var(--ink-65)]">
          <span>{formatMinutes(totalTime)} total</span>
          <span>{formatMinutes(recipe.prepTime)} prep</span>
          <span>Serves {recipe.servings}</span>
          <span className="text-[var(--tomato)]">{canView ? 'Ready to cook' : 'Preview only'}</span>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        <div className="relative h-[360px] overflow-hidden bg-[var(--parchment)] sm:h-[460px] lg:h-[520px]">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
        </div>

        <aside className="flex flex-col bg-[var(--ink)] p-6 text-[var(--cream)] sm:p-8">
          <p className="eyebrow-peach">The promise</p>
          <p className="mt-4 font-serif text-[28px] leading-[1.2] text-[var(--cream)]">
            {recipe.description}
          </p>

          <div className="my-7 h-px bg-[var(--cream-15)]" />

          <p className="eyebrow-peach">Skip to</p>
          <nav className="mt-4 space-y-3 text-sm">
            {[
              ['Ingredients', '#ingredients'],
              ['Method', '#method'],
              ['Make-ahead notes', '#notes'],
              ['Comments', '#comments'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="flex items-center justify-between border-b border-dashed border-[var(--cream-15)] pb-2 text-[var(--cream-85)] transition-colors hover:text-[var(--peach)]"
              >
                <span>{label}</span>
                <span aria-hidden="true">v</span>
              </a>
            ))}
          </nav>

          <div className="mt-8 space-y-3">
            <CookingModeButton
              steps={cookingSteps}
              className="!w-full !justify-center !rounded-none !bg-[var(--tomato)] !py-4 !text-[var(--cream)] hover:!bg-[#B33E26]"
            />
            <div className="grid gap-3">
              <AddToShoppingListButton
                recipeId={recipe.id}
                recipeName={recipe.title}
                variant="secondary"
                className="!justify-center !rounded-none !border !border-[var(--cream-15)] !px-4 !py-3 !text-sm !font-semibold !normal-case !tracking-normal !text-[var(--cream)] hover:!bg-[var(--cream)] hover:!text-[var(--ink)]"
              />
              <AddToCollectionButton
                recipeId={recipe.id}
                recipeName={recipe.title}
                variant="secondary"
                className="!justify-center !rounded-none !border !border-[var(--cream-15)] !px-4 !py-3 !text-sm !font-semibold !normal-case !tracking-normal !text-[var(--cream)] hover:!bg-[var(--cream)] hover:!text-[var(--ink)]"
              />
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <section id="ingredients">
          <p className="eyebrow">Ingredients</p>
          <div className="mt-3 border-t border-[var(--ink)]">
            {recipe.ingredients?.map((ingredient) => (
              <div
                key={`${ingredient.name}-${ingredient.unit}-${ingredient.quantity}`}
                className="grid grid-cols-[100px_1fr] gap-4 border-b border-[var(--ink-line)] py-3 text-sm"
              >
                <span className="font-mono text-xs text-[var(--tomato)]">
                  {formatIngredient(ingredient.quantity, ingredient.unit)}
                </span>
                <span>{ingredient.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="method">
          <p className="eyebrow">Method / {recipe.steps?.length || 0} steps</p>
          <div className="mt-3 border-t border-[var(--ink)]">
            {recipe.steps?.map((step, index) => {
              const parsedStep = splitStep(step, index);

              return (
                <div
                  key={`${step}-${index}`}
                  className="grid grid-cols-[60px_1fr] gap-4 border-b border-[var(--ink-line)] py-5"
                >
                  <span className="font-mono text-sm text-[var(--tomato)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="font-serif text-[22px] leading-tight">{parsedStep.heading}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-85)]">{parsedStep.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section id="notes" className="mt-14 border-t border-[var(--ink)] pt-5">
        <p className="eyebrow">Make-ahead notes</p>
        <p className="body-md mt-3 max-w-2xl">
          Cook once, eat calmer. Most dishes here hold well for a day or two; refresh herbs, citrus,
          and crunchy toppings right before serving.
        </p>
      </section>

      {!canView && <SignInOverlay position="top" />}
    </article>
  );
}
