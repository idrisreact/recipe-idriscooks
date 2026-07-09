import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/db';
import { reviews } from '@/src/db/schemas';
import { eq, desc, sql } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ recipeId: string }>;
}

const ReviewsQuerySchema = z
  .object({
    limit: z
      .string()
      .nullish()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    offset: z
      .string()
      .nullish()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
  })
  .transform((data) => ({
    limit: data.limit && data.limit > 0 && data.limit <= 50 ? data.limit : 20,
    offset: data.offset && data.offset >= 0 ? data.offset : 0,
  }));

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { recipeId } = await params;
    const recipeIdNum = parseInt(recipeId);

    if (isNaN(recipeIdNum)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const { limit, offset } = ReviewsQuerySchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    const recipeReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.recipeId, recipeIdNum))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

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
      pagination: {
        limit,
        offset,
        total: statsData.count,
        hasMore: offset + recipeReviews.length < statsData.count,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
