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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const features = await db
      .select()
      .from(premiumFeatures)
      .where(eq(premiumFeatures.userId, session.user.id));

    const pdfAccess = await db
      .select()
      .from(premiumFeatures)
      .where(
        and(
          eq(premiumFeatures.userId, session.user.id),
          eq(premiumFeatures.feature, 'pdf_downloads')
        )
      );

    return NextResponse.json({
      userId: session.user.id,
      userEmail: session.user.email,
      allFeatures: features,
      pdfAccess: pdfAccess,
      hasAccess: pdfAccess.length > 0,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug failed', details: error }, { status: 500 });
  }
}
