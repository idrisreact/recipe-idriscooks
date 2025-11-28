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
import { checkRecipeAccess } from '@/src/utils/check-recipe-access';
import { RecipeAccessButton } from '@/src/components/payment/recipe-access-button';

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

  // Check if user has paid for recipe access
  const hasUnlimitedViews = await checkRecipeAccess(userId);

  // Debug logging
  console.log('🔍 Debug - User access check:', {
    userId,
    hasUnlimitedViews,
    checkingPlan: true,
  });

  // Fetch the recipe first (we need it for the preview)
  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.title, decoded))
    .limit(1);

  if (!recipe) {
    notFound();
  }

  // For free users, check usage limits
  let usage = null;
  const FREE_PLAN_LIMIT = 3;
  let showPaywall = false;

  if (!hasUnlimitedViews) {
    usage = await getUserUsage();

    // Check if free user has reached limit
    if (usage && usage.recipeViews >= FREE_PLAN_LIMIT) {
      showPaywall = true;
    }
  }

  // Increment view counter ONLY if not showing paywall (only for free users who haven't hit limit)
  if (!hasUnlimitedViews && !showPaywall) {
    await incrementUsage('recipeViews');
    // Get updated usage for display
    usage = await getUserUsage();
  }

  return (
    <div className="wrapper page">
      {/* Show usage banner for free users */}
      {!hasUnlimitedViews && usage && !showPaywall && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <span className="font-medium">
                {usage.recipeViews} of {FREE_PLAN_LIMIT} recipe views used this month
              </span>
              {FREE_PLAN_LIMIT - usage.recipeViews <= 1 && (
                <span className="ml-2 text-red-600 font-semibold">- Last recipe view!</span>
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

      <div className="relative">
        <RecipeDetailedView
          recipe={recipe as unknown as Recipe}
          canView={true}
          hasPro={hasUnlimitedViews}
        />

        {/* Glassmorphism Paywall Overlay */}
        {showPaywall && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ top: '80px' }}
          >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />

            {/* Glassmorphism Card */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
              {/* Lock Icon */}
              <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              {/* Content */}
              <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
                Unlock Full Recipe Access
              </h2>
              <p className="text-gray-600 text-center mb-6 text-lg">
                Get lifetime access to <strong>all recipes</strong> for just £10
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">Unlimited recipe views</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">Lifetime access</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">All future recipes included</span>
                </li>
              </ul>

              {/* Payment Button */}
              <RecipeAccessButton hasAccess={false} />

              {/* Usage Info */}
              <p className="text-sm text-gray-500 text-center mt-4">
                You&apos;ve used {usage?.recipeViews || FREE_PLAN_LIMIT} of {FREE_PLAN_LIMIT} free
                views
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
