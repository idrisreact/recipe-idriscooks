import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Manually grant PDF access for testing
    const result = await db.insert(premiumFeatures).values({
      userId: session.user.id,
      feature: 'pdf_downloads',
      grantedAt: new Date(),
      expiresAt: undefined, // Lifetime access
      metadata: {
        sessionId: 'debug-manual-grant',
        recipeCount: 1,
        amountPaid: 0,
      },
    }).onConflictDoUpdate({
      target: [premiumFeatures.userId, premiumFeatures.feature],
      set: {
        grantedAt: new Date(),
        metadata: {
          sessionId: 'debug-manual-grant-updated',
          recipeCount: 1,
          amountPaid: 0,
        },
      },
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'PDF access granted manually for testing',
      userId: session.user.id,
      result: result,
    });

  } catch (error) {
    console.error('Manual grant error:', error);
    return NextResponse.json(
      { error: 'Failed to grant access', details: error },
      { status: 500 }
    );
  }
}