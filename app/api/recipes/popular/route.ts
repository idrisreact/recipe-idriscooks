import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { recipes, favoriteRecipes } from '@/src/db/schemas';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const popular = await db.execute(
      sql`
        SELECT r.*, COUNT(fr.id) as favoriteCount
        FROM ${recipes} r
        LEFT JOIN ${favoriteRecipes} fr ON r.id = fr.recipe_id
        GROUP BY r.id
        ORDER BY favoriteCount DESC
        LIMIT 4
      `
    );
    return NextResponse.json({ data: popular.rows, count: popular.rows.length });
  } catch (error) {
    console.error('Error fetching popular recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
