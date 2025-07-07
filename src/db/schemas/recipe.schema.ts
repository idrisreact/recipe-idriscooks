import {pgTable,serial,text,integer,jsonb} from 'drizzle-orm/pg-core';



export const recipes = pgTable("recipes",{
    id:serial("id").primaryKey(),
    title:text("title").notNull(),
    description:text("description").notNull(),
    imageUrl:text("image_url").notNull(),
    servings:integer("servings").notNull(),
    prepTime:integer('prep_time').notNull(),
    cookTime:integer("cook_time").notNull(),
    ingredients: jsonb("ingredients").$type<{name:string,quantity:number,unit:string}>(),
    steps:jsonb("steps").$type<string[]>(),
    tags:jsonb("tags").$type<string[]>(),
})