import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { user } from '@/src/db/schemas/user.schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    // Find the user by email
    const userRecord = await db.select().from(user).where(eq(user.email, userEmail)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;

    // Grant PDF access
    const result = await db
      .insert(premiumFeatures)
      .values({
        userId: userId,
        feature: 'pdf_downloads',
        grantedAt: new Date(),
        expiresAt: undefined, // Lifetime access
        metadata: {
          amountPaid: 299,
          planType: 'pdf_download_manual',
        },
      })
      .onConflictDoUpdate({
        target: [premiumFeatures.userId, premiumFeatures.feature],
        set: {
          grantedAt: new Date(),
          metadata: {
            amountPaid: 299,
            planType: 'pdf_download_manual',
          },
        },
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'PDF access granted successfully',
      userId: userId,
      userEmail: userEmail,
      feature: result[0],
    });
  } catch (error) {
    console.error('Grant PDF access error:', error);
    return NextResponse.json(
      {
        error: 'Failed to grant access',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
