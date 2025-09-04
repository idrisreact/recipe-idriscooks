import { db } from "../src/db";
import { recipes } from "../src/db/schemas/recipe.schema";
import recipesData from "../data/recipe.json";

async function seedRecipes() {
  try {
    console.log("🌱 Seeding recipes...");

    const transformedRecipes = recipesData.recipes.map((recipe: Record<string, unknown>) => ({
      title: recipe.title as string,
      description: recipe.description as string,
      imageUrl: recipe.imageUrl as string,
      servings: recipe.servings as number,
      prepTime: recipe.prepTimeMinutes as number,
      cookTime: recipe.cookTimeMinutes as number,
      ingredients: recipe.ingredients as string[],
      steps: recipe.steps as string[],
      tags: recipe.tags as string[],
    }));

    const insertedRecipes = await db.insert(recipes).values(transformedRecipes).returning();

    console.log(`✅ Successfully seeded ${insertedRecipes.length} recipes`);
    console.log("Recipes seeded:", insertedRecipes.map(r => r.title));

  } catch (error) {
    console.error("❌ Error seeding recipes:", error);
    throw error;
  }
}

seedRecipes()
  .then(() => {
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });