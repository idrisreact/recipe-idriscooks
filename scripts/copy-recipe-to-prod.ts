import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { recipes } from '../src/db/schemas';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function copyRecipe(recipeTitle: string, devUrl: string, prodUrl: string) {
  // Connect to dev database
  const devPool = new Pool({
    connectionString: devUrl,
    ssl: false,
  });
  const devDb = drizzle(devPool);

  // Connect to prod database
  const prodPool = new Pool({
    connectionString: prodUrl,
    ssl: prodUrl.includes('neondb.io') ? { rejectUnauthorized: false } : false,
  });
  const prodDb = drizzle(prodPool);

  try {
    console.log(`🔍 Searching for recipe: "${recipeTitle}" in dev database...`);

    // Fetch recipe from dev
    const [devRecipe] = await devDb
      .select()
      .from(recipes)
      .where(eq(recipes.title, recipeTitle))
      .limit(1);

    if (!devRecipe) {
      console.error(`❌ Recipe "${recipeTitle}" not found in dev database`);
      process.exit(1);
    }

    console.log(`✅ Found recipe: ${devRecipe.title}`);

    // Check if recipe already exists in prod
    const [existingRecipe] = await prodDb
      .select()
      .from(recipes)
      .where(eq(recipes.title, recipeTitle))
      .limit(1);

    if (existingRecipe) {
      console.log(`⚠️  Recipe "${recipeTitle}" already exists in production`);
      console.log('Updating existing recipe...');

      // Update existing recipe
      const { id, createdAt, ...updateData } = devRecipe;
      await prodDb
        .update(recipes)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(recipes.id, existingRecipe.id));

      console.log(`✅ Recipe updated successfully in production (ID: ${existingRecipe.id})`);
    } else {
      console.log(`📤 Copying recipe to production...`);

      // Insert new recipe (without id and createdAt, let DB generate them)
      const { id, createdAt, ...insertData } = devRecipe;
      const [newRecipe] = await prodDb
        .insert(recipes)
        .values({
          ...insertData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log(`✅ Recipe copied successfully to production (New ID: ${newRecipe.id})`);
    }

    console.log('\n📊 Recipe Details:');
    console.log(`   Title: ${devRecipe.title}`);
    console.log(`   Category: ${devRecipe.category}`);
    console.log(`   Prep Time: ${devRecipe.prepTime} mins`);
    console.log(`   Cook Time: ${devRecipe.cookTime} mins`);
    console.log(`   Servings: ${devRecipe.servings}`);
  } catch (error) {
    console.error('❌ Error copying recipe:', error);
    process.exit(1);
  } finally {
    await devPool.end();
    await prodPool.end();
  }
}

// Get command line arguments
const recipeTitle = process.argv[2];
const devUrl = process.argv[3] || process.env.DEV_DATABASE_URL;
const prodUrl = process.argv[4] || process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;

if (!recipeTitle) {
  console.error('❌ Please provide a recipe title');
  console.log('Usage: tsx scripts/copy-recipe-to-prod.ts "Recipe Title" [dev-url] [prod-url]');
  console.log('Or set DEV_DATABASE_URL and PROD_DATABASE_URL in .env');
  process.exit(1);
}

if (!devUrl || !prodUrl) {
  console.error('❌ Please provide database URLs');
  console.log('Either pass them as arguments or set DEV_DATABASE_URL and PROD_DATABASE_URL in .env');
  process.exit(1);
}

copyRecipe(recipeTitle, devUrl, prodUrl);
