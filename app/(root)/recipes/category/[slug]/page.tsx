import { Metadata } from 'next';
import { RecipeDetailedView } from '@/src/components/recipe-server-component/recipe-detailed-view';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/src/db';
import { recipes as recipesTable } from '@/src/db/schemas';
import { eq } from 'drizzle-orm';
import { Recipe } from '@/src/types/recipes.types';
import { incrementUsage, getUserUsage } from '@/src/lib/subscription';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.title, decoded))
    .limit(1);

  if (recipe) {
    return {
      title: recipe.title,
      description: recipe.description,
    };
  }

  return {
    title: decoded,
    description: `Recipe: ${decoded}`,
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  // Check better-auth authentication
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/sign-in?redirect_url=' + encodeURIComponent(`/recipes/category/${slug}`));
  }

  // For now, treat all authenticated users as having unlimited views
  // TODO: Implement proper subscription checking with better-auth
  const hasUnlimitedViews = true;

  // Debug logging
  console.log('🔍 Debug - User access check:', {
    userId,
    hasUnlimitedViews,
    checkingPlan: true
  });

  // For free users, check usage limits
  let usage = null;
  const FREE_PLAN_LIMIT = 3;

  if (!hasUnlimitedViews) {
    usage = await getUserUsage();

    // Check if free user has reached limit
    if (usage && usage.recipeViews >= FREE_PLAN_LIMIT) {
      return (
        <div className="wrapper page">
          <div className="max-w-2xl mx-auto text-center py-16 px-4">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4">Recipe View Limit Reached</h1>
              <p className="text-gray-600 text-lg mb-2">
                You&apos;ve reached your monthly limit of {FREE_PLAN_LIMIT} recipe views. Upgrade to view more!
              </p>
              <p className="text-sm text-gray-500">
                You&apos;ve viewed {usage.recipeViews} of {FREE_PLAN_LIMIT} recipes this month.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/pricing"
                className="inline-block bg-[#6c47ff] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#5a3dd4] transition-colors"
              >
                Upgrade to Pro for Unlimited Views
              </Link>
              <div className="text-sm text-gray-600">
                <Link href="/" className="underline hover:text-gray-900">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Fetch the recipe
  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.title, decoded))
    .limit(1);

  if (!recipe) {
    notFound();
  }

  // Increment view counter AFTER successfully loading the recipe (only for free users)
  if (!hasUnlimitedViews) {
    await incrementUsage('recipeViews');
    // Get updated usage for display
    usage = await getUserUsage();
  }

  return (
    <div className="wrapper page">
      {/* Show usage banner for free users */}
      {!hasUnlimitedViews && usage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <span className="font-medium">
                {usage.recipeViews} of {FREE_PLAN_LIMIT} recipe views used this month
              </span>
              {FREE_PLAN_LIMIT - usage.recipeViews <= 1 && (
                <span className="ml-2 text-red-600 font-semibold">
                  - Last recipe view!
                </span>
              )}
            </p>
            <Link
              href="/pricing"
              className="text-sm font-medium text-[#6c47ff] hover:underline whitespace-nowrap ml-4"
            >
              Upgrade for unlimited →
            </Link>
          </div>
        </div>
      )}

      <RecipeDetailedView 
        recipe={recipe as unknown as Recipe} 
        canView={true} 
        hasPro={hasUnlimitedViews}
      />
    </div>
  );
}
