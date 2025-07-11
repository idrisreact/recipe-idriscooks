import { NextRequest, NextResponse } from 'next/server';
import { addToFavorites, removeFromFavorites, getUserFavorites } from '@/src/utils/favorite-recipes';
import { auth } from '@/src/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await getUserFavorites(session.user.id);
    
    return NextResponse.json({
      data: favorites,
      count: favorites.length,
    });
  } catch (error) {
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