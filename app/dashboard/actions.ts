'use server';

import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { db } from '@/src/db';
import { recipes } from '@/src/db/schemas/recipe.schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const recipeSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    imageUrl: z.string().url(),
    servings: z.number().min(1),
    prepTime: z.number().min(1),
    cookTime: z.number().min(0),
    ingredients: z.array(
        z.object({
            name: z.string().min(1),
            quantity: z.number().min(0),
            unit: z.string().min(1),
        })
    ),
    steps: z.array(z.string().min(5)),
    tags: z.array(z.string()).optional(),
});

export async function createRecipe(data: z.infer<typeof recipeSchema>) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const validatedData = recipeSchema.parse(data);

    await db.insert(recipes).values({
        ...validatedData,
        userId: session.user.id,
    });

    revalidatePath('/dashboard');
    revalidatePath('/');
}

export async function updateRecipe(id: number, data: z.infer<typeof recipeSchema>) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const validatedData = recipeSchema.parse(data);

    // Verify ownership
    const existingRecipe = await db.select().from(recipes)
        .where(and(eq(recipes.id, id), eq(recipes.userId, session.user.id)))
        .limit(1);

    if (existingRecipe.length === 0) {
        throw new Error('Recipe not found or unauthorized');
    }

    await db.update(recipes)
        .set(validatedData)
        .where(eq(recipes.id, id));

    revalidatePath('/dashboard');
    revalidatePath('/');
}

export async function deleteRecipe(id: number) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    // Verify ownership and delete
    const result = await db.delete(recipes)
        .where(and(eq(recipes.id, id), eq(recipes.userId, session.user.id)))
        .returning();

    if (result.length === 0) {
        throw new Error('Recipe not found or unauthorized');
    }

    revalidatePath('/dashboard');
    revalidatePath('/');
}
