import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { desc } from 'drizzle-orm';
import { blockInProduction, requireAdmin } from '@/src/utils/api-guards';

export async function GET() {
  const blocked = blockInProduction();
  if (blocked) return blocked;

  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    // Get recent premium features grants to see webhook activity
    const recentGrants = await db
      .select()
      .from(premiumFeatures)
      .orderBy(desc(premiumFeatures.grantedAt))
      .limit(20);

    return NextResponse.json({
      recentGrants: recentGrants.map((grant) => ({
        id: grant.id,
        userId: grant.userId,
        feature: grant.feature,
        grantedAt: grant.grantedAt,
        metadata: grant.metadata,
      })),
      totalGrants: recentGrants.length,
      lastGrantTime: recentGrants[0]?.grantedAt || null,
    });
  } catch (error) {
    console.error('Debug webhook logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook logs' }, { status: 500 });
  }
}
