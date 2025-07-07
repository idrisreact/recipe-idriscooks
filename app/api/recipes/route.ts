// app/api/recipes/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db";   // your Drizzle client
import { recipes } from "@/src/db/schemas";

export async function GET() {
  const all = await db.select().from(recipes);
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const payload = await req.json();
  const created = await db
    .insert(recipes)
    .values(payload)
    .returning();
  return NextResponse.json(created[0], { status: 201 });
}