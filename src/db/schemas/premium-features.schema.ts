import { pgTable, text, timestamp, boolean, integer, numeric, jsonb, serial, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./user.schema";
import { recipes } from "./recipe.schema";

// Enums for premium features
export const recipeTypeEnum = pgEnum('recipe_type', ['free', 'premium', 'pro_only']);
export const collectionVisibilityEnum = pgEnum('collection_visibility', ['private', 'public', 'shared']);
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert']);

// Enhanced Recipe Categories for premium organization
export const recipeCategories = pgTable("recipe_categories", {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  parentId: integer('parent_id').references(() => recipeCategories.id),
  isPremium: boolean('is_premium').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Recipe Collections - Premium feature for organizing recipes
export const recipeCollections = pgTable("recipe_collections", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  visibility: collectionVisibilityEnum('visibility').notNull().default('private'),
  coverImageUrl: text('cover_image_url'),
  tags: jsonb('tags').$type<string[]>(),
  isDefault: boolean('is_default').default(false), // For system collections like "Favorites"
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Recipe Collection Items - Many-to-many for collections
export const recipeCollectionItems = pgTable("recipe_collection_items", {
  id: serial('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => recipeCollections.id, { onDelete: 'cascade' }),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  notes: text('notes'), // User notes about this recipe in this collection
  sortOrder: integer('sort_order').default(0),
  addedAt: timestamp('added_at').notNull().defaultNow(),
});

// Recipe Ratings and Reviews - Premium feature
export const recipeReviews = pgTable("recipe_reviews", {
  id: text('id').primaryKey(),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'),
  wouldMakeAgain: boolean('would_make_again'),
  difficultyRating: difficultyEnum('difficulty_rating'),
  actualPrepTime: integer('actual_prep_time'),
  actualCookTime: integer('actual_cook_time'),
  modifications: text('modifications'), // What they changed
  images: jsonb('images').$type<string[]>(), // User photos of their creation
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Meal Planning - Premium feature
export const mealPlans = pgTable("meal_plans", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  servings: integer('servings').default(2),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Meal Plan Items - Recipes scheduled for specific meals
export const mealPlanItems = pgTable("meal_plan_items", {
  id: text('id').primaryKey(),
  mealPlanId: text('meal_plan_id').notNull().references(() => mealPlans.id, { onDelete: 'cascade' }),
  recipeId: integer('recipe_id').references(() => recipes.id, { onDelete: 'cascade' }),
  scheduledDate: timestamp('scheduled_date').notNull(),
  mealType: text('meal_type').notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  servings: integer('servings').default(2),
  notes: text('notes'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Shopping Lists - Premium feature
export const shoppingLists = pgTable("shopping_lists", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  mealPlanId: text('meal_plan_id').references(() => mealPlans.id),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Shopping List Items
export const shoppingListItems = pgTable("shopping_list_items", {
  id: text('id').primaryKey(),
  shoppingListId: text('shopping_list_id').notNull().references(() => shoppingLists.id, { onDelete: 'cascade' }),
  recipeId: integer('recipe_id').references(() => recipes.id), // Optional - if from a recipe
  name: text('name').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 3 }),
  unit: text('unit'),
  category: text('category'), // 'produce', 'dairy', 'meat', etc.
  isPurchased: boolean('is_purchased').default(false),
  estimatedPrice: numeric('estimated_price', { precision: 10, scale: 2 }),
  notes: text('notes'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Nutritional Information - Premium feature
export const recipeNutrition = pgTable("recipe_nutrition", {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  servingSize: text('serving_size'),
  calories: integer('calories'),
  protein: numeric('protein', { precision: 8, scale: 2 }), // grams
  carbohydrates: numeric('carbohydrates', { precision: 8, scale: 2 }),
  fat: numeric('fat', { precision: 8, scale: 2 }),
  fiber: numeric('fiber', { precision: 8, scale: 2 }),
  sugar: numeric('sugar', { precision: 8, scale: 2 }),
  sodium: numeric('sodium', { precision: 8, scale: 2 }), // mg
  cholesterol: numeric('cholesterol', { precision: 8, scale: 2 }), // mg
  vitaminA: numeric('vitamin_a', { precision: 8, scale: 2 }), // % daily value
  vitaminC: numeric('vitamin_c', { precision: 8, scale: 2 }),
  calcium: numeric('calcium', { precision: 8, scale: 2 }),
  iron: numeric('iron', { precision: 8, scale: 2 }),
  allergens: jsonb('allergens').$type<string[]>(), // 'nuts', 'dairy', 'gluten', etc.
  dietaryTags: jsonb('dietary_tags').$type<string[]>(), // 'vegan', 'keto', 'paleo', etc.
  isVerified: boolean('is_verified').default(false), // Nutritionist verified
  lastCalculated: timestamp('last_calculated').notNull().defaultNow(),
});

// Recipe Sharing - Premium feature for sharing with specific users
export const recipeShares = pgTable("recipe_shares", {
  id: text('id').primaryKey(),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  sharedByUserId: text('shared_by_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sharedWithUserId: text('shared_with_user_id').references(() => user.id, { onDelete: 'cascade' }),
  sharedWithEmail: text('shared_with_email'), // For sharing with non-users
  message: text('message'),
  canEdit: boolean('can_edit').default(false),
  expiresAt: timestamp('expires_at'),
  accessCount: integer('access_count').default(0),
  lastAccessedAt: timestamp('last_accessed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User Preferences - Enhanced settings for premium users
export const userPreferences = pgTable("user_preferences", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  dietaryRestrictions: jsonb('dietary_restrictions').$type<string[]>(),
  allergens: jsonb('allergens').$type<string[]>(),
  cuisinePreferences: jsonb('cuisine_preferences').$type<string[]>(),
  skillLevel: difficultyEnum('skill_level').default('beginner'),
  kitchenEquipment: jsonb('kitchen_equipment').$type<string[]>(),
  defaultServings: integer('default_servings').default(2),
  measurementSystem: text('measurement_system').default('metric'), // 'metric' or 'imperial'
  theme: text('theme').default('light'), // 'light', 'dark', 'auto'
  notifications: jsonb('notifications').$type<{
    mealPlanReminders: boolean;
    newRecipes: boolean;
    weeklyDigest: boolean;
    sharedRecipes: boolean;
  }>().default({
    mealPlanReminders: true,
    newRecipes: false,
    weeklyDigest: true,
    sharedRecipes: true,
  }),
  privacySettings: jsonb('privacy_settings').$type<{
    profileVisible: boolean;
    collectionsVisible: boolean;
    reviewsVisible: boolean;
  }>().default({
    profileVisible: false,
    collectionsVisible: false,
    reviewsVisible: true,
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});