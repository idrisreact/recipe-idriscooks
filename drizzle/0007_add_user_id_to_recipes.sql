ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipes_user_id_idx" ON "recipes" USING btree ("user_id");--> statement-breakpoint
-- Note: Not adding foreign key constraint here because recipes can be created without a user

