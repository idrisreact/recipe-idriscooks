import { relations } from "drizzle-orm/relations";
import { user, session, account, favoriteRecipes, recipes } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	favoriteRecipes: many(favoriteRecipes),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const favoriteRecipesRelations = relations(favoriteRecipes, ({one}) => ({
	user: one(user, {
		fields: [favoriteRecipes.userId],
		references: [user.id]
	}),
	recipe: one(recipes, {
		fields: [favoriteRecipes.recipeId],
		references: [recipes.id]
	}),
}));

export const recipesRelations = relations(recipes, ({many}) => ({
	favoriteRecipes: many(favoriteRecipes),
}));