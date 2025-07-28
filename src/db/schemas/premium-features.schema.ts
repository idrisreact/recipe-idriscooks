import { pgTable, varchar, text, integer, timestamp, boolean, decimal, jsonb, uuid, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user.schema";
import { recipes } from "./recipe.schema";

// Recipe Collections - User-created recipe organization
export const recipeCollections = pgTable("recipe_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3B82F6"), // Hex color for UI
  isPublic: boolean("is_public").default(false),
  isDefault: boolean("is_default").default(false), // For system-created collections
  tags: jsonb("tags").$type<string[]>(),
  metadata: jsonb("metadata").$type<{
    totalRecipes?: number;
    avgRating?: number;
    lastUpdated?: string;
    coverImageUrl?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("recipe_collections_user_id_idx").on(table.userId),
  publicIdx: index("recipe_collections_public_idx").on(table.isPublic),
  userNameIdx: index("recipe_collections_user_name_idx").on(table.userId, table.name),
}));

// Recipe Collection Items - Many-to-many relationship between collections and recipes
export const recipeCollectionItems = pgTable("recipe_collection_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  collectionId: uuid("collection_id").notNull().references(() => recipeCollections.id, { onDelete: "cascade" }),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow(),
  notes: text("notes"), // User's personal notes about this recipe in this collection
  sortOrder: integer("sort_order").default(0),
}, (table) => ({
  collectionRecipeIdx: index("recipe_collection_items_collection_recipe_idx").on(table.collectionId, table.recipeId),
  recipeIdx: index("recipe_collection_items_recipe_idx").on(table.recipeId),
  collectionRecipeUnique: unique("recipe_collection_items_collection_recipe_unique").on(table.collectionId, table.recipeId),
}));

// Meal Plans - Weekly meal planning feature
export const mealPlans = pgTable("meal_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  weekStartDate: timestamp("week_start_date").notNull(), // Start of the week this plan covers
  status: varchar("status", { length: 20 }).default("active"), // active, archived, template
  isTemplate: boolean("is_template").default(false), // Can be reused as template
  servings: integer("servings").default(4), // Default serving size for scaling
  dietaryPreferences: jsonb("dietary_preferences").$type<{
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    lowCarb?: boolean;
    keto?: boolean;
    paleo?: boolean;
    allergies?: string[];
  }>(),
  budget: decimal("budget", { precision: 10, scale: 2 }), // Weekly grocery budget
  metadata: jsonb("metadata").$type<{
    totalCalories?: number;
    totalCost?: number;
    shoppingListGenerated?: boolean;
    nutritionCalculated?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("meal_plans_user_id_idx").on(table.userId),
  weekStartIdx: index("meal_plans_week_start_idx").on(table.weekStartDate),
  statusIdx: index("meal_plans_status_idx").on(table.status),
  templateIdx: index("meal_plans_template_idx").on(table.isTemplate),
}));

// Meal Plan Items - Individual meals within a meal plan
export const mealPlanItems = pgTable("meal_plan_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  mealPlanId: uuid("meal_plan_id").notNull().references(() => mealPlans.id, { onDelete: "cascade" }),
  recipeId: integer("recipe_id").references(() => recipes.id, { onDelete: "set null" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6, Sunday to Saturday
  mealType: varchar("meal_type", { length: 20 }).notNull(), // breakfast, lunch, dinner, snack
  servings: integer("servings").default(1),
  notes: text("notes"),
  customMealName: varchar("custom_meal_name", { length: 200 }), // For non-recipe meals
  customIngredients: jsonb("custom_ingredients").$type<string[]>(), // For simple custom meals
  isCompleted: boolean("is_completed").default(false), // Has user cooked this meal
  completedAt: timestamp("completed_at"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  mealPlanIdx: index("meal_plan_items_meal_plan_idx").on(table.mealPlanId),
  dayMealIdx: index("meal_plan_items_day_meal_idx").on(table.dayOfWeek, table.mealType),
  recipeIdx: index("meal_plan_items_recipe_idx").on(table.recipeId),
}));

// Shopping Lists - Auto-generated from meal plans
export const shoppingLists = pgTable("shopping_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  mealPlanId: uuid("meal_plan_id").references(() => mealPlans.id, { onDelete: "set null" }),
  name: varchar("name", { length: 200 }).notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, completed, archived
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  store: varchar("store", { length: 100 }), // Preferred grocery store
  notes: text("notes"),
  metadata: jsonb("metadata").$type<{
    totalItems?: number;
    completedItems?: number;
    categories?: string[];
    generatedFromMealPlan?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("shopping_lists_user_id_idx").on(table.userId),
  mealPlanIdx: index("shopping_lists_meal_plan_idx").on(table.mealPlanId),
  statusIdx: index("shopping_lists_status_idx").on(table.status),
}));

// Shopping List Items - Individual items on shopping lists
export const shoppingListItems = pgTable("shopping_list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  shoppingListId: uuid("shopping_list_id").notNull().references(() => shoppingLists.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 50 }), // cups, tbsp, lbs, etc.
  category: varchar("category", { length: 100 }), // produce, dairy, meat, etc.
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  actualPrice: decimal("actual_price", { precision: 10, scale: 2 }),
  isCompleted: boolean("is_completed").default(false),
  isPriority: boolean("is_priority").default(false),
  notes: text("notes"),
  recipeIds: jsonb("recipe_ids").$type<number[]>(), // Which recipes need this ingredient
  sortOrder: integer("sort_order").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  shoppingListIdx: index("shopping_list_items_shopping_list_idx").on(table.shoppingListId),
  categoryIdx: index("shopping_list_items_category_idx").on(table.category),
  completedIdx: index("shopping_list_items_completed_idx").on(table.isCompleted),
}));

// Recipe Nutrition - Detailed nutritional information
export const recipeNutrition = pgTable("recipe_nutrition", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  servings: integer("servings").notNull(),
  calories: integer("calories"),
  protein: decimal("protein", { precision: 8, scale: 2 }), // grams
  carbohydrates: decimal("carbohydrates", { precision: 8, scale: 2 }), // grams
  fat: decimal("fat", { precision: 8, scale: 2 }), // grams
  fiber: decimal("fiber", { precision: 8, scale: 2 }), // grams
  sugar: decimal("sugar", { precision: 8, scale: 2 }), // grams
  sodium: decimal("sodium", { precision: 8, scale: 2 }), // milligrams
  cholesterol: decimal("cholesterol", { precision: 8, scale: 2 }), // milligrams
  vitamins: jsonb("vitamins").$type<Record<string, number>>(), // vitamin A, C, etc.
  minerals: jsonb("minerals").$type<Record<string, number>>(), // iron, calcium, etc.
  allergens: jsonb("allergens").$type<string[]>(), // nuts, dairy, gluten, etc.
  dietaryFlags: jsonb("dietary_flags").$type<{
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    lowCarb?: boolean;
    keto?: boolean;
    paleo?: boolean;
    lowSodium?: boolean;
  }>(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  recipeIdIdx: index("recipe_nutrition_recipe_id_idx").on(table.recipeId),
  caloriesIdx: index("recipe_nutrition_calories_idx").on(table.calories),
  dietaryIdx: index("recipe_nutrition_dietary_idx").using("gin", table.dietaryFlags),
  recipeIdUnique: unique("recipe_nutrition_recipe_id_unique").on(table.recipeId),
}));

// Recipe Reviews - User ratings and reviews
export const recipeReviews = pgTable("recipe_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 200 }),
  comment: text("comment"),
  helpfulVotes: integer("helpful_votes").default(0),
  difficultyRating: integer("difficulty_rating"), // 1-5, how hard was it to make
  tasteRating: integer("taste_rating"), // 1-5, how good did it taste
  wouldMakeAgain: boolean("would_make_again"),
  cookingTime: integer("cooking_time"), // Actual time taken in minutes
  modifications: text("modifications"), // What changes did they make
  tips: text("tips"), // Helpful tips for other cooks
  images: jsonb("images").$type<string[]>(), // URLs to user-uploaded photos
  isVerifiedPurchase: boolean("is_verified_purchase").default(false), // For premium features
  isRecommended: boolean("is_recommended"), // Featured review
  moderationStatus: varchar("moderation_status", { length: 20 }).default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  recipeIdIdx: index("recipe_reviews_recipe_id_idx").on(table.recipeId),
  userIdIdx: index("recipe_reviews_user_id_idx").on(table.userId),
  ratingIdx: index("recipe_reviews_rating_idx").on(table.rating),
  moderationIdx: index("recipe_reviews_moderation_idx").on(table.moderationStatus),
  userRecipeUnique: unique("recipe_reviews_user_recipe_unique").on(table.userId, table.recipeId),
}));

// Recipe Shares - Private recipe sharing capabilities
export const recipeShares = pgTable("recipe_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  sharedBy: text("shared_by").notNull().references(() => user.id, { onDelete: "cascade" }),
  sharedWith: text("shared_with").references(() => user.id, { onDelete: "cascade" }), // null for public link
  shareToken: varchar("share_token", { length: 64 }).notNull(), // Unique token for access
  shareType: varchar("share_type", { length: 20 }).notNull(), // private, public, collection
  permissions: jsonb("permissions").$type<{
    canView?: boolean;
    canCopy?: boolean;
    canEdit?: boolean;
    canShare?: boolean;
  }>(),
  expiresAt: timestamp("expires_at"), // null for no expiration
  accessCount: integer("access_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  isActive: boolean("is_active").default(true),
  message: text("message"), // Personal message with the share
  metadata: jsonb("metadata").$type<{
    originalRecipeTitle?: string;
    sharedVia?: string; // email, link, social
    recipientEmail?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  shareTokenIdx: index("recipe_shares_share_token_idx").on(table.shareToken),
  sharedByIdx: index("recipe_shares_shared_by_idx").on(table.sharedBy),
  sharedWithIdx: index("recipe_shares_shared_with_idx").on(table.sharedWith),
  recipeIdIdx: index("recipe_shares_recipe_id_idx").on(table.recipeId),
  expiresAtIdx: index("recipe_shares_expires_at_idx").on(table.expiresAt),
  shareTokenUnique: unique("recipe_shares_share_token_unique").on(table.shareToken),
}));

// User Preferences - Enhanced personalization settings
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  theme: varchar("theme", { length: 20 }).default("light"), // light, dark, auto
  language: varchar("language", { length: 10 }).default("en"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  units: varchar("units", { length: 20 }).default("metric"), // metric, imperial
  skillLevel: varchar("skill_level", { length: 20 }).default("intermediate"), // beginner, intermediate, advanced
  cookingStyle: jsonb("cooking_style").$type<string[]>(), // quick, healthy, comfort, experimental
  dietaryRestrictions: jsonb("dietary_restrictions").$type<{
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
    shellFishFree?: boolean;
    allergies?: string[];
    customRestrictions?: string[];
  }>(),
  kitchenEquipment: jsonb("kitchen_equipment").$type<string[]>(), // oven, microwave, airfryer, etc.
  preferredCuisines: jsonb("preferred_cuisines").$type<string[]>(),
  dislikedIngredients: jsonb("disliked_ingredients").$type<string[]>(),
  notifications: jsonb("notifications").$type<{
    emailNewsletter?: boolean;
    emailMealPlanReminders?: boolean;
    emailRecipeRecommendations?: boolean;
    pushMealPlanReminders?: boolean;
    pushNewRecipes?: boolean;
  }>(),
  privacy: jsonb("privacy").$type<{
    profileVisible?: boolean;
    recipesVisible?: boolean;
    collectionsVisible?: boolean;
    reviewsVisible?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("user_preferences_user_id_idx").on(table.userId),
  skillLevelIdx: index("user_preferences_skill_level_idx").on(table.skillLevel),
  userIdUnique: unique("user_preferences_user_id_unique").on(table.userId),
}));

// Relations
export const recipeCollectionsRelations = relations(recipeCollections, ({ one, many }) => ({
  user: one(user, { fields: [recipeCollections.userId], references: [user.id] }),
  items: many(recipeCollectionItems),
}));

export const recipeCollectionItemsRelations = relations(recipeCollectionItems, ({ one }) => ({
  collection: one(recipeCollections, { fields: [recipeCollectionItems.collectionId], references: [recipeCollections.id] }),
  recipe: one(recipes, { fields: [recipeCollectionItems.recipeId], references: [recipes.id] }),
}));

export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
  user: one(user, { fields: [mealPlans.userId], references: [user.id] }),
  items: many(mealPlanItems),
  shoppingLists: many(shoppingLists),
}));

export const mealPlanItemsRelations = relations(mealPlanItems, ({ one }) => ({
  mealPlan: one(mealPlans, { fields: [mealPlanItems.mealPlanId], references: [mealPlans.id] }),
  recipe: one(recipes, { fields: [mealPlanItems.recipeId], references: [recipes.id] }),
}));

export const shoppingListsRelations = relations(shoppingLists, ({ one, many }) => ({
  user: one(user, { fields: [shoppingLists.userId], references: [user.id] }),
  mealPlan: one(mealPlans, { fields: [shoppingLists.mealPlanId], references: [mealPlans.id] }),
  items: many(shoppingListItems),
}));

export const shoppingListItemsRelations = relations(shoppingListItems, ({ one }) => ({
  shoppingList: one(shoppingLists, { fields: [shoppingListItems.shoppingListId], references: [shoppingLists.id] }),
}));

export const recipeNutritionRelations = relations(recipeNutrition, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeNutrition.recipeId], references: [recipes.id] }),
}));

export const recipeReviewsRelations = relations(recipeReviews, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeReviews.recipeId], references: [recipes.id] }),
  user: one(user, { fields: [recipeReviews.userId], references: [user.id] }),
}));

export const recipeSharesRelations = relations(recipeShares, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeShares.recipeId], references: [recipes.id] }),
  sharedByUser: one(user, { fields: [recipeShares.sharedBy], references: [user.id] }),
  sharedWithUser: one(user, { fields: [recipeShares.sharedWith], references: [user.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, { fields: [userPreferences.userId], references: [user.id] }),
}));