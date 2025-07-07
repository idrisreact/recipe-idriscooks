CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"servings" integer NOT NULL,
	"prep_time" integer NOT NULL,
	"cook_time" integer NOT NULL,
	"ingredients" jsonb,
	"steps" jsonb,
	"tags" jsonb
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;