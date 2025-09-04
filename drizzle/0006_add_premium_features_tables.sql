CREATE TABLE IF NOT EXISTS "premium_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"feature" varchar(50) NOT NULL,
	"granted_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"metadata" jsonb,
	CONSTRAINT "premium_features_user_feature_unique" UNIQUE("user_id","feature")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#3B82F6',
	"is_public" boolean DEFAULT false,
	"is_default" boolean DEFAULT false,
	"tags" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"recipe_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now(),
	"notes" text,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "recipe_collection_items_collection_recipe_unique" UNIQUE("collection_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"week_start_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'active',
	"is_template" boolean DEFAULT false,
	"servings" integer DEFAULT 4,
	"dietary_preferences" jsonb,
	"budget" numeric(10, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meal_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_id" uuid NOT NULL,
	"recipe_id" integer,
	"day_of_week" integer NOT NULL,
	"meal_type" varchar(20) NOT NULL,
	"servings" integer DEFAULT 1,
	"notes" text,
	"custom_meal_name" varchar(200),
	"custom_ingredients" jsonb,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopping_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"meal_plan_id" uuid,
	"name" varchar(200) NOT NULL,
	"status" varchar(20) DEFAULT 'active',
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"store" varchar(100),
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopping_list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shopping_list_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unit" varchar(50),
	"category" varchar(100),
	"estimated_price" numeric(10, 2),
	"actual_price" numeric(10, 2),
	"is_completed" boolean DEFAULT false,
	"is_priority" boolean DEFAULT false,
	"notes" text,
	"recipe_ids" jsonb,
	"sort_order" integer DEFAULT 0,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_nutrition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" integer NOT NULL,
	"servings" integer NOT NULL,
	"calories" integer,
	"protein" numeric(8, 2),
	"carbohydrates" numeric(8, 2),
	"fat" numeric(8, 2),
	"fiber" numeric(8, 2),
	"sugar" numeric(8, 2),
	"sodium" numeric(8, 2),
	"cholesterol" numeric(8, 2),
	"vitamins" jsonb,
	"minerals" jsonb,
	"allergens" jsonb,
	"dietary_flags" jsonb,
	"calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "recipe_nutrition_recipe_id_unique" UNIQUE("recipe_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(200),
	"comment" text,
	"helpful_votes" integer DEFAULT 0,
	"difficulty_rating" integer,
	"taste_rating" integer,
	"would_make_again" boolean,
	"cooking_time" integer,
	"modifications" text,
	"tips" text,
	"images" jsonb,
	"is_verified_purchase" boolean DEFAULT false,
	"is_recommended" boolean,
	"moderation_status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "recipe_reviews_user_recipe_unique" UNIQUE("user_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" integer NOT NULL,
	"shared_by" text NOT NULL,
	"shared_with" text,
	"share_token" varchar(64) NOT NULL,
	"share_type" varchar(20) NOT NULL,
	"permissions" jsonb,
	"expires_at" timestamp,
	"access_count" integer DEFAULT 0,
	"last_accessed_at" timestamp,
	"is_active" boolean DEFAULT true,
	"message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "recipe_shares_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"theme" varchar(20) DEFAULT 'light',
	"language" varchar(10) DEFAULT 'en',
	"timezone" varchar(50) DEFAULT 'UTC',
	"units" varchar(20) DEFAULT 'metric',
	"skill_level" varchar(20) DEFAULT 'intermediate',
	"cooking_style" jsonb,
	"dietary_restrictions" jsonb,
	"kitchen_equipment" jsonb,
	"preferred_cuisines" jsonb,
	"disliked_ingredients" jsonb,
	"notifications" jsonb,
	"privacy" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "premium_features" ADD CONSTRAINT "premium_features_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_collections" ADD CONSTRAINT "recipe_collections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_collection_items" ADD CONSTRAINT "recipe_collection_items_collection_id_recipe_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."recipe_collections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_collection_items" ADD CONSTRAINT "recipe_collection_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_plan_items" ADD CONSTRAINT "meal_plan_items_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meal_plan_items" ADD CONSTRAINT "meal_plan_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_shopping_list_id_shopping_lists_id_fk" FOREIGN KEY ("shopping_list_id") REFERENCES "public"."shopping_lists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_nutrition" ADD CONSTRAINT "recipe_nutrition_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_reviews" ADD CONSTRAINT "recipe_reviews_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_reviews" ADD CONSTRAINT "recipe_reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_shares" ADD CONSTRAINT "recipe_shares_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_shares" ADD CONSTRAINT "recipe_shares_shared_by_user_id_fk" FOREIGN KEY ("shared_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_shares" ADD CONSTRAINT "recipe_shares_shared_with_user_id_fk" FOREIGN KEY ("shared_with") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "premium_features_user_id_idx" ON "premium_features" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "premium_features_feature_idx" ON "premium_features" USING btree ("feature");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "premium_features_expires_at_idx" ON "premium_features" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_collections_user_id_idx" ON "recipe_collections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_collections_public_idx" ON "recipe_collections" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_collections_user_name_idx" ON "recipe_collections" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_collection_items_collection_recipe_idx" ON "recipe_collection_items" USING btree ("collection_id","recipe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_collection_items_recipe_idx" ON "recipe_collection_items" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meal_plans_user_id_idx" ON "meal_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meal_plans_week_start_idx" ON "meal_plans" USING btree ("week_start_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meal_plans_status_idx" ON "meal_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meal_plans_template_idx" ON "meal_plans" USING btree ("is_template");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meal_plan_items_meal_plan_idx" ON "meal_plan_items" USING btree ("meal_plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meal_plan_items_day_meal_idx" ON "meal_plan_items" USING btree ("day_of_week","meal_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meal_plan_items_recipe_idx" ON "meal_plan_items" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shopping_lists_user_id_idx" ON "shopping_lists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shopping_lists_meal_plan_idx" ON "shopping_lists" USING btree ("meal_plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shopping_lists_status_idx" ON "shopping_lists" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shopping_list_items_shopping_list_idx" ON "shopping_list_items" USING btree ("shopping_list_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shopping_list_items_category_idx" ON "shopping_list_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shopping_list_items_completed_idx" ON "shopping_list_items" USING btree ("is_completed");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_nutrition_recipe_id_idx" ON "recipe_nutrition" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_nutrition_calories_idx" ON "recipe_nutrition" USING btree ("calories");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_nutrition_dietary_idx" ON "recipe_nutrition" USING gin ("dietary_flags");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_reviews_recipe_id_idx" ON "recipe_reviews" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_reviews_user_id_idx" ON "recipe_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_reviews_rating_idx" ON "recipe_reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_reviews_moderation_idx" ON "recipe_reviews" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_shares_share_token_idx" ON "recipe_shares" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_shares_shared_by_idx" ON "recipe_shares" USING btree ("shared_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_shares_shared_with_idx" ON "recipe_shares" USING btree ("shared_with");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_shares_recipe_id_idx" ON "recipe_shares" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_shares_expires_at_idx" ON "recipe_shares" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_preferences_user_id_idx" ON "user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_preferences_skill_level_idx" ON "user_preferences" USING btree ("skill_level");