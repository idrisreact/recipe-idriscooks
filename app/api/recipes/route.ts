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

    // Build query
    let query = db.select().from(recipes);

    // Apply filters
    if (search && tag) {
      query = query.where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`);
    } else if (search) {
      query = query.where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`);
    } else if (tag) {
      query = query.where(sql`${recipes.tags} @> ${JSON.stringify([tag])}`);
    }

    // Apply sorting
    if (sort === 'recent') {
      query = query.orderBy(sql`${recipes.id} DESC`);
    } else if (sort === 'popular') {
      // For popular, we could order by view count or favorites if those fields exist
      query = query.orderBy(sql`${recipes.id} DESC`); // Fallback to recent if no popularity metric
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const results = await query;

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