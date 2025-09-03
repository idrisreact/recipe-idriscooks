// app/(root)/recipes/category/[slug]/page.tsx

import { Metadata } from "next";
import { RecipeDetailedView } from "@/src/components/recipe-server-component/recipe-detailed-view";
import { auth } from "@/src/utils/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/src/db";
import { recipes as recipesTable } from "@/src/db/schemas";
import { eq } from "drizzle-orm";
import { Recipe } from "@/src/types/recipes.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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

  const session = await auth.api.getSession({ headers: await headers() });

  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.title, decoded))
    .limit(1);

  if (!recipe) {
    notFound();
  }

  // Only allow full view if logged in
  const canView = !!session;
  let recipeData;
  if (canView) {
    recipeData = recipe;
  } else {
    // Only send minimal info for unauthenticated users
    recipeData = {
      title: recipe.title,
      description: recipe.description,
      id: recipe.id,
      imageUrl: recipe.imageUrl,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
    };
  }

  return (
    <div className="wrapper page">
      <RecipeDetailedView
        recipe={recipeData as unknown as Recipe}
        canView={canView}
      />
    </div>
  );
}
