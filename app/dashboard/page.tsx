import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import RecipeForm from './recipe-form';

import { db } from '@/src/db';
import { recipes } from '@/src/db/schemas/recipe.schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { deleteRecipe } from './actions';
import { Pencil, Trash2 } from 'lucide-react';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/sign-in?redirect_url=/dashboard');
  }

  const userRecipes = await db.select().from(recipes)
    .where(eq(recipes.userId, session.user.id))
    .orderBy(desc(recipes.id));

  const params = await searchParams;
  const editId = params.editId ? parseInt(params.editId as string) : undefined;
  
  let initialData = undefined;
  if (editId) {
    const recipeToEdit = userRecipes.find((r) => r.id === editId);
    if (recipeToEdit) {
      initialData = {
        ...recipeToEdit,
        steps: (recipeToEdit.steps as string[]).map((s) => ({ value: s })),
        tags: (recipeToEdit.tags as string[]) || [],
        ingredients: recipeToEdit.ingredients as any, // Type assertion needed due to jsonb
      };
    }
  }

  return (
    <div className="container mx-auto py-10 px-8">
      <h1 className="text-3xl font-bold mb-8">Chef Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-pink-600">
                {editId ? 'Edit Recipe' : 'Create New Recipe'}
              </h2>
              {editId && (
                <Link 
                  href="/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel Edit
                </Link>
              )}
            </div>
            <RecipeForm initialData={initialData} recipeId={editId} />
          </div>
        </div>

        {/* Recipe List Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Recipes</h2>
            <div className="space-y-4">
              {userRecipes.length === 0 ? (
                <p className="text-gray-500 text-sm">No recipes yet. Create one!</p>
              ) : (
                userRecipes.map((recipe) => (
                  <div key={recipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="font-medium text-gray-900 truncate">{recipe.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">{recipe.description}</p>
                    <div className="flex justify-end gap-2 mt-3">
                      <Link
                        href={`/dashboard?editId=${recipe.id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <form action={async () => {
                        'use server';
                        await deleteRecipe(recipe.id);
                      }}>
                        <button 
                          type="submit"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
