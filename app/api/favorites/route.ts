import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
} from '@/src/utils/favorite-recipes';
import { auth } from '@/src/utils/auth';
import { enforceLimit } from '@/src/lib/entitlements';

const FavoritesQuerySchema = z
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
    limit: data.limit && data.limit > 0 && data.limit <= 50 ? data.limit : undefined,
    offset: data.offset && data.offset >= 0 ? data.offset : undefined,
  }));

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = FavoritesQuerySchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    const result = await getUserFavorites(session.user.id, params);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    const blocked = await enforceLimit(session.user.id, 'addFavorite');
    if (blocked) return blocked;

    const favorite = await addToFavorites(session.user.id, recipeId);

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    await removeFromFavorites(session.user.id, recipeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
