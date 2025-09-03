// app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { recipes } from "@/src/db/schemas";
import { sql } from "drizzle-orm";
import { z } from "zod";

// Validation schema for creating recipes
const CreateRecipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Invalid image URL"),
  servings: z.number().int().positive("Servings must be a positive integer"),
  prepTime: z.number().int().nonnegative("Prep time must be non-negative"),
  cookTime: z.number().int().nonnegative("Cook time must be non-negative"),
  ingredients: z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1)
  }).optional(),
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

    // If title is provided, fetch a single recipe
    if (title) {
      const recipe = await db
        .select()
        .from(recipes)
        .where(sql`LOWER(${recipes.title}) = ${title.toLowerCase()}`)
        .limit(1);

      if (recipe.length === 0) {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(recipe[0]);
    }

    // Use a simpler approach with conditional query building
    const baseQuery = db.select().from(recipes);
    
    // Execute different queries based on conditions
    let results;
    
    if (search && tag && sort && limit) {
      // All conditions
      results = await db.select().from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`)
        .orderBy(sql`${recipes.id} DESC`)
        .limit(limit);
    } else if (search && tag && sort) {
      // Search, tag, and sort
      results = await db.select().from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`)
        .orderBy(sql`${recipes.id} DESC`);
    } else if (search && tag && limit) {
      // Search, tag, and limit
      results = await db.select().from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`)
        .limit(limit);
    } else if (search && sort && limit) {
      // Search, sort, and limit
      results = await db.select().from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`)
        .orderBy(sql`${recipes.id} DESC`)
        .limit(limit);
    } else if (tag && sort && limit) {
      // Tag, sort, and limit
      results = await db.select().from(recipes)
        .where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`)
        .orderBy(sql`${recipes.id} DESC`)
        .limit(limit);
    } else if (search && tag) {
      // Search and tag
      results = await db.select().from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`);
    } else if (search && sort) {
      // Search and sort
      results = await db.select().from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`)
        .orderBy(sql`${recipes.id} DESC`);
    } else if (search && limit) {
      // Search and limit
      results = await db.select().from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`)
        .limit(limit);
    } else if (tag && sort) {
      // Tag and sort
      results = await db.select().from(recipes)
        .where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`)
        .orderBy(sql`${recipes.id} DESC`);
    } else if (tag && limit) {
      // Tag and limit
      results = await db.select().from(recipes)
        .where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`)
        .limit(limit);
    } else if (sort && limit) {
      // Sort and limit
      results = await db.select().from(recipes)
        .orderBy(sql`${recipes.id} DESC`)
        .limit(limit);
    } else if (search) {
      // Search only
      results = await db.select().from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`);
    } else if (tag) {
      // Tag only
      results = await db.select().from(recipes)
        .where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`);
    } else if (sort) {
      // Sort only
      results = await db.select().from(recipes)
        .orderBy(sql`${recipes.id} DESC`);
    } else if (limit) {
      // Limit only
      results = await db.select().from(recipes)
        .limit(limit);
    } else {
      // No conditions
      results = await baseQuery;
    }

    // Return just the array for direct consumption
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateRecipeSchema.parse(body);
    
    // Insert recipe into database
    const [createdRecipe] = await db
      .insert(recipes)
      .values(validatedData)
      .returning();

    return NextResponse.json(
      { 
        data: createdRecipe,
        message: 'Recipe created successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating recipe:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}