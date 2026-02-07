import { pgTable, text, timestamp, serial, integer, index } from 'drizzle-orm/pg-core';
import { user } from './user.schema';
import { recipes } from './recipe.schema';

export const favoriteRecipes = pgTable(
  'favorite_recipes',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('favorite_recipes_user_id_idx').on(table.userId)]
);

export const favoriteRecipesSchema = { favoriteRecipes };
