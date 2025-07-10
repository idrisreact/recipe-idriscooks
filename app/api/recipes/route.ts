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

    if (!search) {
      const allRecipes = await db.select().from(recipes);
      return NextResponse.json({ 
        data: allRecipes, 
        count: allRecipes.length 
      });
    }

    const results = await db
      .select()
      .from(recipes)
      .where(sql`LOWER(${recipes.title}) LIKE ${`%${search}%`}`);

    return NextResponse.json({ 
      data: results, 
      count: results.length,
      search: search 
    });

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