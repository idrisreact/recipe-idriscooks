import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { reviews } from '@/src/db/schemas';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    const body = await request.json();
    const { rating, reviewText, photos } = body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if review exists and belongs to user
    const [existingReview] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)))
      .limit(1);

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Update the review
    const [updatedReview] = await db
      .update(reviews)
      .set({
        rating: rating ?? existingReview.rating,
        reviewText: reviewText !== undefined ? reviewText : existingReview.reviewText,
        photos: photos !== undefined ? photos : existingReview.photos,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    // Check if review exists and belongs to user
    const [existingReview] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)))
      .limit(1);

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the review
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
