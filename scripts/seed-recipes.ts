import { db } from "../src/db";
import { recipes } from "../src/db/schemas/recipe.schema";
import recipesData from "../data/recipe.json";

async function seedRecipes() {
  try {
    console.log("🌱 Seeding recipes...");

    // Transform the data to match the database schema
    const transformedRecipes = recipesData.recipes.map((recipe: any) => ({
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      servings: recipe.servings,
      prepTime: recipe.prepTimeMinutes,
      cookTime: recipe.cookTimeMinutes,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tags: recipe.tags,
    }));

    // Insert recipes into database
    const insertedRecipes = await db.insert(recipes).values(transformedRecipes).returning();

    console.log(`✅ Successfully seeded ${insertedRecipes.length} recipes`);
    console.log("Recipes seeded:", insertedRecipes.map(r => r.title));

  } catch (error) {
    console.error("❌ Error seeding recipes:", error);
    throw error;
  }
}

// Run the seeding function
seedRecipes()
  .then(() => {
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }); 