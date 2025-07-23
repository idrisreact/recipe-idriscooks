// app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { recipes } from "@/src/db/schemas";
import { favoriteRecipes } from "@/src/db/schemas";
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

      return NextResponse.json({ 
        data: recipe[0],
        count: 1
      });
    }

    if (!search && !tag) {
      const allRecipes = await db.select().from(recipes);
      return NextResponse.json({ 
        data: allRecipes, 
        count: allRecipes.length 
      });
    }

    let results;

    if (search && tag) {
      results = await db
        .select()
        .from(recipes)
        .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`} AND ${recipes.tags} @> ${JSON.stringify([tag])}`);
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
    } else {
      results = await db.select().from(recipes);
    }

    return NextResponse.json({ 
      data: results, 
      count: results.length,
      search: search || undefined,
      tag: tag || undefined
    });

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// /api/recipes/popular
export async function GET_popular(request: NextRequest) {
  try {
    // Get top 4 recipes by favorite count
    const popular = await db.execute(
      sql`
        SELECT r.*, COUNT(fr.id) as favoriteCount
        FROM ${recipes} r
        LEFT JOIN ${favoriteRecipes} fr ON r.id = fr.recipe_id
        GROUP BY r.id
        ORDER BY favoriteCount DESC
        LIMIT 4
      `
    );
    return NextResponse.json({ data: popular.rows, count: popular.rows.length });
  } catch (error) {
    console.error('Error fetching popular recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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