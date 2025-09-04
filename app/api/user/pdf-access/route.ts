import { NextRequest, NextResponse } from 'next/server';
import { authClient } from '@/src/utils/auth-client';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await authClient.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { hasAccess: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has PDF access
    const pdfAccess = await db
      .select()
      .from(premiumFeatures)
      .where(
        and(
          eq(premiumFeatures.userId, session.user.id),
          eq(premiumFeatures.feature, 'pdf_downloads')
        )
      )
      .limit(1);

    const hasAccess = pdfAccess.length > 0;

    return NextResponse.json({
      hasAccess,
      ...(hasAccess && {
        grantedAt: pdfAccess[0].grantedAt,
        expiresAt: pdfAccess[0].expiresAt,
      }),
    });

  } catch (error) {
    console.error('PDF access check error:', error);
    return NextResponse.json(
      { hasAccess: false, error: 'Failed to check access' },
      { status: 500 }
    );
  }
}