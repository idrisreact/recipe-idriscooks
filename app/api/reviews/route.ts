import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { reviews } from '@/src/db/schemas';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { checkRecipeAccess } from '@/src/utils/check-recipe-access';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user has paid access
    const hasAccess = await checkRecipeAccess(userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Only users with recipe access can leave reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { recipeId, rating, reviewText, photos } = body;

    // Validate required fields
    if (!recipeId || !rating) {
      return NextResponse.json({ error: 'Recipe ID and rating are required' }, { status: 400 });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this recipe
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.recipeId, recipeId), eq(reviews.userId, userId)))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this recipe. Please edit your existing review.' },
        { status: 409 }
      );
    }

    // Create the review
    const [newReview] = await db
      .insert(reviews)
      .values({
        recipeId,
        userId,
        userName: session.user.name || 'Anonymous',
        userImage: session.user.image || null,
        rating,
        reviewText: reviewText || null,
        photos: photos || null,
      })
      .returning();

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
