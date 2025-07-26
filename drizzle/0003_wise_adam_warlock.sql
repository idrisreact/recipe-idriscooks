CREATE TABLE "price_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "price_plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "favorite_recipes" ALTER COLUMN "recipe_id" SET DATA TYPE integer;