import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { reviews } from '@/src/db/schemas';
import { eq, desc, sql } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ recipeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { recipeId } = await params;
    const recipeIdNum = parseInt(recipeId);

    if (isNaN(recipeIdNum)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    // Fetch all reviews for the recipe
    const recipeReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.recipeId, recipeIdNum))
      .orderBy(desc(reviews.createdAt));

    // Calculate aggregate statistics
    const stats = await db
      .select({
        count: sql<number>`count(*)`,
        avgRating: sql<number>`round(avg(${reviews.rating})::numeric, 1)`,
        fiveStars: sql<number>`count(*) filter (where ${reviews.rating} = 5)`,
        fourStars: sql<number>`count(*) filter (where ${reviews.rating} = 4)`,
        threeStars: sql<number>`count(*) filter (where ${reviews.rating} = 3)`,
        twoStars: sql<number>`count(*) filter (where ${reviews.rating} = 2)`,
        oneStar: sql<number>`count(*) filter (where ${reviews.rating} = 1)`,
      })
      .from(reviews)
      .where(eq(reviews.recipeId, recipeIdNum));

    // Convert stats to ensure proper number types
    const statsData = stats[0]
      ? {
          count: Number(stats[0].count),
          avgRating: Number(stats[0].avgRating),
          fiveStars: Number(stats[0].fiveStars),
          fourStars: Number(stats[0].fourStars),
          threeStars: Number(stats[0].threeStars),
          twoStars: Number(stats[0].twoStars),
          oneStar: Number(stats[0].oneStar),
        }
      : {
          count: 0,
          avgRating: 0,
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        };

    return NextResponse.json({
      reviews: recipeReviews,
      stats: statsData,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
