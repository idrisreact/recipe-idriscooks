import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { recipes } from '@/src/db/schemas';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

const CreateRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url('Invalid image URL'),
  servings: z.number().int().positive('Servings must be a positive integer'),
  prepTime: z.number().int().nonnegative('Prep time must be non-negative'),
  cookTime: z.number().int().nonnegative('Cook time must be non-negative'),
  ingredients: z
    .object({
      name: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().min(1),
    })
    .optional(),
  steps: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase();
    const tag = searchParams.get('tag')?.trim().toLowerCase();
    const title = searchParams.get('title')?.trim();
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const sort = searchParams.get('sort')?.trim().toLowerCase();

    if (title) {
      const recipe = await db
        .select()
        .from(recipes)
        .where(sql`LOWER(${recipes.title}) = ${title.toLowerCase()}`)
        .limit(1);

      if (recipe.length === 0) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
      }

      return NextResponse.json(recipe[0]);
    }

    const baseQuery = db.select().from(recipes);

    let results;

    if (search && tag && sort && limit) {
      results = await db
        .select()
        .from(recipes)
        .where(
          sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`
        )
        .orderBy(sql`${recipes.id} DESC`)
        .limit(limit);
    } else if (search && tag && sort) {
      results = await db
        .select()
        .from(recipes)
        .where(
          sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`
        )
        .orderBy(sql`${recipes.id} DESC`);
    } else if (search && tag && limit) {
      results = await db
        .select()
        .from(recipes)
        .where(
          sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`
        )
        .limit(limit);
    } else if (search && sort && limit) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`)
        .orderBy(sql`${recipes.id} DESC`)
        .limit(limit);
    } else if (tag && sort && limit) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`)
        .orderBy(sql`${recipes.id} DESC`)
        .limit(limit);
    } else if (search && tag) {
      results = await db
        .select()
        .from(recipes)
        .where(
          sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`
        );
    } else if (search && sort) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`)
        .orderBy(sql`${recipes.id} DESC`);
    } else if (search && limit) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`)
        .limit(limit);
    } else if (tag && sort) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`)
        .orderBy(sql`${recipes.id} DESC`);
    } else if (tag && limit) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`)
        .limit(limit);
    } else if (sort && limit) {
      results = await db
        .select()
        .from(recipes)
        .orderBy(sql`${recipes.id} DESC`)
        .limit(limit);
    } else if (search) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`);
    } else if (tag) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`);
    } else if (sort) {
      results = await db
        .select()
        .from(recipes)
        .orderBy(sql`${recipes.id} DESC`);
    } else if (limit) {
      results = await db.select().from(recipes).limit(limit);
    } else {
      results = await baseQuery;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreateRecipeSchema.parse(body);

    const [createdRecipe] = await db.insert(recipes).values(validatedData).returning();

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
