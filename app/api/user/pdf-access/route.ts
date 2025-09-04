import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('PDF Access Check: Starting...');
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log('PDF Access Check: Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });

    if (!session?.user?.id) {
      console.log('PDF Access Check: Not authenticated');
      return NextResponse.json({ hasAccess: false, error: 'Not authenticated' }, { status: 401 });
    }

    console.log('PDF Access Check: Querying database for user:', session.user.id);
    
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

    console.log('PDF Access Check: Database query result:', {
      recordsFound: pdfAccess.length,
      records: pdfAccess
    });

    const hasAccess = pdfAccess.length > 0;

    const response = {
      hasAccess,
      ...(hasAccess && {
        grantedAt: pdfAccess[0].grantedAt,
        expiresAt: pdfAccess[0].expiresAt,
      }),
    };

    console.log('PDF Access Check: Final response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('PDF access check error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    });
    
    return NextResponse.json(
      { hasAccess: false, error: 'Failed to check access' },
      { status: 500 }
    );
  }
}
