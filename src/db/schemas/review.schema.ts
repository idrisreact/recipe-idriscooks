import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { recipes } from './recipe.schema';

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userImage: text('user_image'),
  rating: integer('rating').notNull(), // 1-5 stars
  reviewText: text('review_text'),
  photos: jsonb('photos').$type<string[]>(), // Array of image URLs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
