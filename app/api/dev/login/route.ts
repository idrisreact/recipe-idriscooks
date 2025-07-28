import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const { userId, email, name } = await request.json();

    // Create a mock session for the test user
    // In a real app, this would integrate with your auth system
    const sessionData = {
      user: {
        id: userId,
        email,
        name,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        emailVerified: true,
      },
      session: {
        id: 'dev-session-001',
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        token: 'dev-token-001',
      },
    };

    // Create response with cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged in as test user',
      user: sessionData.user 
    });

    // Set cookies to simulate authentication
    response.cookies.set('better-auth.session_token', 'dev-token-001', {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Dev login error:', error);
    return NextResponse.json(
      { error: 'Failed to login as test user' },
      { status: 500 }
    );
  }
}