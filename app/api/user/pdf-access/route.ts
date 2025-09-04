import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ hasAccess: false, error: 'Not authenticated' }, { status: 401 });
    }

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
