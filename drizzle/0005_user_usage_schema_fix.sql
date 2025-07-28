-- Migration: Fix user_usage schema to align with TypeScript interface
-- Date: 2025-07-27
-- Purpose: Align database schema with UserUsage TypeScript interface

-- Drop existing user_usage table and recreate with aligned schema
DROP TABLE IF EXISTS "user_usage" CASCADE;

-- Create new user_usage table with proper schema alignment
CREATE TABLE IF NOT EXISTS "user_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"month" text NOT NULL,
	"recipe_views" integer DEFAULT 0,
	"favorites_count" integer DEFAULT 0,
	"collections_count" integer DEFAULT 0,
	"meal_plans_count" integer DEFAULT 0,
	"recipes_created" integer DEFAULT 0,
	"pdf_exports" integer DEFAULT 0,
	"recipes_shared" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "user_usage_user_month_idx" ON "user_usage" ("user_id","month");
CREATE INDEX IF NOT EXISTS "user_usage_month_idx" ON "user_usage" ("month");
CREATE UNIQUE INDEX IF NOT EXISTS "user_usage_user_month_unique" ON "user_usage" ("user_id","month");

-- Add comments for documentation
COMMENT ON TABLE "user_usage" IS 'Tracks user activity and usage metrics for subscription plan limits';
COMMENT ON COLUMN "user_usage"."month" IS 'Usage month in YYYY-MM format';
COMMENT ON COLUMN "user_usage"."recipe_views" IS 'Number of recipes viewed in the month';
COMMENT ON COLUMN "user_usage"."favorites_count" IS 'Number of recipes favorited in the month';
COMMENT ON COLUMN "user_usage"."collections_count" IS 'Number of collections created in the month';
COMMENT ON COLUMN "user_usage"."meal_plans_count" IS 'Number of meal plans created in the month';
COMMENT ON COLUMN "user_usage"."recipes_created" IS 'Number of recipes created by user in the month';
COMMENT ON COLUMN "user_usage"."pdf_exports" IS 'Number of PDF exports in the month';
COMMENT ON COLUMN "user_usage"."recipes_shared" IS 'Number of recipes shared in the month';