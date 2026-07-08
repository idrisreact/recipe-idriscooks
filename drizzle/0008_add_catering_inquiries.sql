CREATE TABLE IF NOT EXISTS "catering_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" varchar(200) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(30),
	"event_type" varchar(50) NOT NULL,
	"event_date" timestamp NOT NULL,
	"guest_count" integer NOT NULL,
	"location" text,
	"budget_range" varchar(50),
	"dietary_requirements" text,
	"message" text,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catering_inquiries" ADD CONSTRAINT "catering_inquiries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "catering_inquiries_status_idx" ON "catering_inquiries" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "catering_inquiries_created_at_idx" ON "catering_inquiries" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "catering_inquiries_email_idx" ON "catering_inquiries" ("email");
