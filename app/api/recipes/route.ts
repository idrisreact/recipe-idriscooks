import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { recipes } from '@/src/db/schemas';
import { sql, and, desc, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/src/utils/auth';

// Optimized query parameter schema - handle null values properly
const QuerySchema = z
  .object({
    search: z.string().nullish(),
    tag: z.string().nullish(),
    title: z.string().nullish(),
    limit: z
      .string()
      .nullish()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    sort: z.enum(['newest', 'oldest', 'title', 'cookTime', 'recent']).nullish(),
    offset: z
      .string()
      .nullish()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
  })
  .transform((data) => ({
    search: data.search || undefined,
    tag: data.tag || undefined,
    title: data.title || undefined,
    limit: data.limit && data.limit > 0 && data.limit <= 100 ? data.limit : undefined,
    sort: data.sort || undefined,
    offset: data.offset && data.offset >= 0 ? data.offset : undefined,
  }));

const CreateRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url('Invalid image URL'),
  servings: z.number().int().positive('Servings must be a positive integer'),
  prepTime: z.number().int().nonnegative('Prep time must be non-negative'),
  cookTime: z.number().int().nonnegative('Cook time must be non-negative'),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.string().min(1),
      })
    )
    .optional(),
  steps: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate all parameters at once
    const params = QuerySchema.parse({
      search: searchParams.get('search')?.trim(),
      tag: searchParams.get('tag')?.trim(),
      title: searchParams.get('title')?.trim(),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort')?.trim(),
      offset: searchParams.get('offset'),
    });

    // Get the current user session if authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const userId = session?.user?.id || null;

    // Check if user wants to filter by their own recipes
    const myRecipes = searchParams.get('my') === 'true';

    // Handle single recipe by title (early return)
    if (params.title) {
      const recipe = await db
        .select()
        .from(recipes)
        .where(sql`LOWER(${recipes.title}) = ${params.title.toLowerCase()}`)
        .limit(1);

      return NextResponse.json(
        recipe.length === 0 ? { error: 'Recipe not found' } : recipe[0],
        recipe.length === 0 ? { status: 404 } : undefined
      );
    }

    // Build dynamic WHERE conditions
    const whereConditions = [];

    // Filter by user if requested and authenticated
    if (myRecipes && userId) {
      whereConditions.push(eq(recipes.userId, userId));
    }

    if (params.search) {
      whereConditions.push(sql`LOWER(${recipes.title}) LIKE ${`%${params.search.toLowerCase()}%`}`);
    }

    if (params.tag) {
      whereConditions.push(sql`${recipes.tags} @> ${JSON.stringify([params.tag])}`);
    }

    // Build ORDER BY clause
    let orderBy;
    switch (params.sort) {
      case 'oldest':
        orderBy = asc(recipes.id);
        break;
      case 'title':
        orderBy = asc(recipes.title);
        break;
      case 'cookTime':
        orderBy = asc(recipes.cookTime);
        break;
      case 'recent':
      case 'newest':
      default:
        orderBy = desc(recipes.id);
        break;
    }

    // Execute single optimized query
    let queryBuilder = db.select().from(recipes);

    if (whereConditions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryBuilder = queryBuilder.where(and(...whereConditions)) as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder = queryBuilder.orderBy(orderBy) as any;

    if (params.offset) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryBuilder = queryBuilder.offset(params.offset) as any;
    }

    if (params.limit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryBuilder = queryBuilder.limit(params.limit) as any;
    }

    const results = await queryBuilder;
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching recipes:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreateRecipeSchema.parse(body);

    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const userId = session?.user?.id || null;

    // Create recipe with userId if authenticated
    const recipeData = userId ? { ...validatedData, userId } : validatedData;

    const [createdRecipe] = await db.insert(recipes).values(recipeData).returning();

    return NextResponse.json(
      {
        data: createdRecipe,
        message: 'Recipe created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating recipe:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
