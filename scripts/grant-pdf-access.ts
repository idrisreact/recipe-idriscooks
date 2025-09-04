import { db } from '../src/db';
import { premiumFeatures } from '../src/db/schemas/premium-features.schema';
import { user } from '../src/db/schemas/user.schema';
import { eq } from 'drizzle-orm';

async function grantPDFAccess() {
  try {
    console.log('🔍 Finding user accounts...');
    
    const users = await db.select().from(user).limit(5);
    console.log('👤 Available users:', users.map(u => ({ id: u.id, email: u.email })));
    
    if (users.length === 0) {
      console.log('❌ No users found. Please sign in to the app first.');
      return;
    }
    
    // Grant access to the first user (assuming that's you)
    const targetUser = users[0];
    console.log(`🎯 Granting PDF access to: ${targetUser.email} (${targetUser.id})`);
    
    const result = await db
      .insert(premiumFeatures)
      .values({
        userId: targetUser.id,
        feature: 'pdf_downloads',
        grantedAt: new Date(),
        expiresAt: undefined, // Lifetime access
        metadata: {
          sessionId: 'manual-debug-grant',
          recipeCount: 999,
          amountPaid: 0,
        },
      })
      .onConflictDoUpdate({
        target: [premiumFeatures.userId, premiumFeatures.feature],
        set: {
          grantedAt: new Date(),
          metadata: {
            sessionId: 'manual-debug-grant-updated',
            recipeCount: 999,
            amountPaid: 0,
          },
        },
      })
      .returning();
    
    console.log('✅ PDF access granted successfully!');
    console.log('📊 Result:', result);
    
    // Verify the grant
    const verification = await db
      .select()
      .from(premiumFeatures)
      .where(eq(premiumFeatures.userId, targetUser.id));
    
    console.log('🔍 Verification - User features:', verification);
    
  } catch (error) {
    console.error('❌ Error granting PDF access:', error);
  }
}

if (require.main === module) {
  grantPDFAccess()
    .then(() => {
      console.log('🎉 Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { grantPDFAccess };