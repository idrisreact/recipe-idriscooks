'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ArrowLeft, Heart, Share2, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Text } from '@/src/components/ui/Text';
import { Recipe } from '@/src/types/recipes.types';
import { useFavorites } from '@/src/hooks/use-favorites';
import { SignInOverlay } from './sign-in-overlay';
import toast from 'react-hot-toast';

type Props = {
  recipe: Recipe;
  canView: boolean;
  hasPro?: boolean;
};

function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function RecipeDetailedView({ recipe, canView, hasPro = false }: Props) {
  const router = useRouter();
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
  const favorited = isFavorited(recipe.id);

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
    if (!hasPro) {
      toast.error('Upgrade to Pro to download recipes!');
      router.push('/pricing');
      return;
    }

    if (!contentRef.current) return;

    try {
      setIsDownloading(true);
      const toastId = toast.loading('Generating PDF...');

      // Use html-to-image to generate PNG
      const dataUrl = await toPng(contentRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff' // Ensure white background
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      
      // Calculate image dimensions
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${recipe.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:max-w-7xl">
      {}
      <div className="flex items-center justify-between py-4">
        <Button
          variant="outline"
          onClick={() => router.push('/recipes')}
          className="murakamicity-button-outline flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="murakamicity-button-outline gap-2 relative group"
          >
            {hasPro ? (
              <Download className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            {isDownloading ? 'Generating...' : 'Download PDF'}
            {!hasPro && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Pro Feature
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={toggleFavorite}
            className="murakamicity-button-outline gap-2"
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-primary text-primary' : ''}`} />
            {favorited ? 'Favorited' : 'Favorite'}
          </Button>
          <Button variant="outline" onClick={share} className="murakamicity-button-outline gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {}
        <div className="murakamicity-card" ref={contentRef}>
          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
            {}
            <div className="relative h-[200px] sm:h-[240px] w-full overflow-hidden rounded-sm lg:h-[320px] order-1">
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                priority
              />
            </div>

            {}
            <div className="flex flex-col gap-4 order-2">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
                  {recipe.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-muted text-muted-foreground px-3 py-1">
                  Main dish
                </span>
                <span className="rounded-full bg-muted text-muted-foreground px-3 py-1">
                  {formatMinutes(totalTime)}
                </span>
                <span className="rounded-full bg-muted text-muted-foreground px-3 py-1">
                  Serves {recipe.servings}
                </span>
              </div>

              <Text className="text-muted-foreground leading-relaxed">{recipe.description}</Text>

              {}
              {recipe.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {recipe.tags.map((t) => (
                    <span key={t} className="rounded-full bg-primary/20 text-primary px-3 py-1">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {}
              <div className="mt-2 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3 text-sm">
                <div className="rounded-sm border border-border px-3 py-2 text-center sm:text-left">
                  <div className="font-medium">Prep</div>
                  <div className="text-xs text-muted-foreground sm:inline sm:ml-1">
                    {formatMinutes(recipe.prepTime)}
                  </div>
                </div>
                <div className="rounded-sm border border-border px-3 py-2 text-center sm:text-left">
                  <div className="font-medium">Cook</div>
                  <div className="text-xs text-muted-foreground sm:inline sm:ml-1">
                    {formatMinutes(recipe.cookTime)}
                  </div>
                </div>
                <div className="rounded-sm border border-border px-3 py-2 text-center sm:text-left">
                  <div className="font-medium">Total</div>
                  <div className="text-xs text-muted-foreground sm:inline sm:ml-1">
                    {formatMinutes(totalTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="px-4 md:px-6">
            <h2 className="mb-3 text-lg font-semibold">Ingredients</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients?.map((ing) => (
                <span
                  key={`${ing.name}-${ing.unit}`}
                  className="rounded-full bg-muted text-muted-foreground px-3 py-1 text-sm"
                >
                  {ing.quantity}
                  {ing.unit ? ` ${ing.unit}` : ''} {ing.name}
                </span>
              ))}
            </div>
          </div>

          {}
          <div className="p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Step-by-step preparation</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recipe.steps?.map((step, idx) => (
                <div key={idx} className="rounded-sm border border-border bg-card p-3">
                  <div className="mb-2 text-sm font-medium">Step {idx + 1}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="flex md:hidden flex-col gap-2 p-4 border-t border-border">
             <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="murakamicity-button-outline gap-2 w-full text-sm"
            >
              {hasPro ? (
                <Download className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button
              variant="outline"
              onClick={toggleFavorite}
              className="murakamicity-button-outline gap-2 w-full text-sm"
            >
              <Heart className={`h-4 w-4 ${favorited ? 'fill-primary text-primary' : ''}`} />
              {favorited ? 'Favorited' : 'Favorite'}
            </Button>
            <Button
              variant="outline"
              onClick={share}
              className="murakamicity-button-outline gap-2 w-full text-sm"
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>

          {}
          {!canView && <SignInOverlay position="top" />}
        </div>

        {}
        <aside className="hidden xl:block">
          <div className="sticky top-20 h-fit murakamicity-card">
            <h3 className="mb-3 text-base font-semibold">Comments</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="rounded-sm border border-border p-3">
                <div className="font-medium">@homechef87</div>
                <div className="text-muted-foreground">
                  This was so quick to make! Perfect for busy weeknights.
                </div>
              </div>
              <div className="rounded-sm border border-border p-3">
                <div className="font-medium">@crustyBreadFan</div>
                <div className="text-muted-foreground">
                  Absolutely delicious! The shrimp turned out perfectly tender.
                </div>
              </div>
              <div className="rounded-sm border border-border p-3">
                <div className="font-medium">@veggielife</div>
                <div className="text-muted-foreground">
                  Love the colorful veggies! It&apos;s a feast for the eyes.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
