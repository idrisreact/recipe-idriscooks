import { Metadata } from 'next';
import { RecipeDetailedView } from '@/src/components/recipe-server-component/recipe-detailed-view';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { db } from '@/src/db';
import { recipes as recipesTable, reviews } from '@/src/db/schemas';
import { eq, sql } from 'drizzle-orm';
import { Recipe } from '@/src/types/recipes.types';
import { incrementUsage, getUserUsage } from '@/src/lib/subscription';
import Link from 'next/link';
import { checkRecipeAccess } from '@/src/utils/check-recipe-access';
import { RecipeAccessButton } from '@/src/components/payment/recipe-access-button';
import { getRecipeAccessPrice, PRICING } from '@/src/config/pricing';
import { generateRecipeSchema, getCanonicalUrl, getOgImageUrl } from '@/src/utils/seo';
import { ReviewsSection } from '@/src/components/reviews/reviews-section';
import { SimilarRecipes } from '@/src/components/recipe-server-component/similar-recipes';

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

  if (!recipe) {
    return {
      title: decoded,
      description: `Recipe: ${decoded}`,
    };
  }

  const canonicalUrl = getCanonicalUrl(`/recipes/category/${slug}`);
  const ogImage = getOgImageUrl(recipe.imageUrl);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return {
    title: `${recipe.title} | Idris Cooks`,
    description: recipe.description,
    keywords: recipe.tags as string[] | undefined,
    authors: [{ name: 'Idris Cooks' }],
    creator: 'Idris Cooks',
    publisher: 'Idris Cooks',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      url: canonicalUrl,
      siteName: 'Idris Cooks',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: recipe.title,
        },
      ],
      locale: 'en_GB',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: recipe.description,
      images: [ogImage],
      creator: '@idriscooks',
    },
    ...(recipe.prepTime || recipe.cookTime || recipe.servings
      ? {
          other: {
            ...(recipe.prepTime && { 'recipe:prep_time': `${recipe.prepTime} minutes` }),
            ...(recipe.cookTime && { 'recipe:cook_time': `${recipe.cookTime} minutes` }),
            ...(totalTime > 0 && { 'recipe:total_time': `${totalTime} minutes` }),
            ...(recipe.servings && { 'recipe:servings': recipe.servings.toString() }),
          },
        }
      : {}),
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  // Check better-auth authentication
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  // Check if user has paid for recipe access (only if logged in)
  const hasUnlimitedViews = userId ? await checkRecipeAccess(userId) : false;

  // Get current pricing
  const pricing = getRecipeAccessPrice();
  const isLaunchSpecial = PRICING.recipeAccess.isLaunchSpecial;

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

  // If user is not logged in, show sign-in paywall
  if (!userId) {
    showPaywall = true;
  } else if (!hasUnlimitedViews) {
    // For logged-in free users, check usage limits
    usage = await getUserUsage();

    // Check if free user has reached limit
    if (usage && usage.recipeViews >= FREE_PLAN_LIMIT) {
      showPaywall = true;
    }
  }

  // Increment view counter ONLY if logged in and not showing paywall (only for free users who haven't hit limit)
  if (userId && !hasUnlimitedViews && !showPaywall) {
    await incrementUsage('recipeViews');
    // Get updated usage for display
    usage = await getUserUsage();
  }

  // Fetch review stats for SEO schema
  const reviewStats = await db
    .select({
      count: sql<number>`count(*)`,
      avgRating: sql<number>`round(avg(${reviews.rating})::numeric, 1)`,
    })
    .from(reviews)
    .where(eq(reviews.recipeId, recipe.id));

  const stats = reviewStats[0] && reviewStats[0].count > 0 ? reviewStats[0] : undefined;

  // Generate Recipe JSON-LD schema for SEO
  const recipeSchema = generateRecipeSchema(
    recipe as unknown as Recipe,
    getCanonicalUrl(`/recipes/category/${slug}`),
    stats
  );

  return (
    <div className="wrapper page">
      {/* Recipe JSON-LD Schema for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />

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

        {/* Reviews Section */}
        {!showPaywall && (
          <>
            <div className="mt-12 pt-12 border-t border-zinc-800">
              <ReviewsSection
                recipeId={recipe.id}
                userId={userId}
                hasPaidAccess={hasUnlimitedViews}
              />
            </div>

            {/* Similar Recipes Section */}
            <SimilarRecipes currentRecipeId={recipe.id} tags={recipe.tags as string[]} limit={4} />
          </>
        )}

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
                {!userId ? 'Sign In to View Recipes' : 'Unlock Full Recipe Access'}
              </h2>
              <p className="text-gray-600 text-center mb-6 text-lg">
                {!userId
                  ? `Create a free account to view up to 3 recipes per month, or get lifetime access ${isLaunchSpecial ? '(Early Bird Special!)' : ''}`
                  : `Get lifetime access to all recipes ${isLaunchSpecial ? `for just ${pricing.display}` : `for ${pricing.display}`}`}
              </p>
              {isLaunchSpecial && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-center text-yellow-800 font-semibold">
                    🎉 {'badge' in pricing ? pricing.badge : 'Limited Time'} - Save £15! Regular
                    price: {PRICING.recipeAccess.regular.display}
                  </p>
                </div>
              )}

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

              {/* Payment/Sign In Buttons */}
              {!userId ? (
                <div className="space-y-3">
                  <Link
                    href={`/?showAuth=true&redirect=/recipes/category/${slug}`}
                    className="block w-full bg-[var(--primary)] text-white py-3 px-6 rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
                  >
                    Sign In / Create Account
                  </Link>
                  <RecipeAccessButton hasAccess={false} />
                </div>
              ) : (
                <RecipeAccessButton hasAccess={false} />
              )}

              {/* Usage Info */}
              {userId && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  You&apos;ve used {usage?.recipeViews || FREE_PLAN_LIMIT} of {FREE_PLAN_LIMIT} free
                  views
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
