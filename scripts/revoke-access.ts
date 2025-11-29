import { db } from '../src/db';
import { user } from '../src/db/schemas/user.schema';
import { premiumFeatures } from '../src/db/schemas/premium-features.schema';
import { eq } from 'drizzle-orm';

async function revokeAccess(email: string) {
  try {
    console.log(`🔍 Looking up user: ${email}`);

    // Find user by email
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!foundUser) {
      console.log(`❌ User not found with email: ${email}`);
      return;
    }

    console.log(`✅ Found user: ${foundUser.name} (ID: ${foundUser.id})`);

    // Get current premium features
    const currentFeatures = await db
      .select()
      .from(premiumFeatures)
      .where(eq(premiumFeatures.userId, foundUser.id));

    if (currentFeatures.length === 0) {
      console.log('\n✅ User has no premium features to revoke');
      return;
    }

    console.log('\n📊 Current Premium Features:');
    currentFeatures.forEach((feature) => {
      console.log(`   - ${feature.feature}`);
      console.log(`     Granted: ${feature.grantedAt}`);
      console.log(`     Expires: ${feature.expiresAt || 'Never (Lifetime)'}`);
      console.log(`     Metadata:`, feature.metadata);
    });

    console.log('\n🗑️  Revoking all premium features...');

    // Delete all premium features for this user
    const result = await db
      .delete(premiumFeatures)
      .where(eq(premiumFeatures.userId, foundUser.id));

    console.log(`✅ Successfully revoked ${currentFeatures.length} premium feature(s)`);
    console.log('\n🎉 User can now test the payment flow from scratch!');
  } catch (error) {
    console.error('❌ Error revoking access:', error);
  } finally {
    process.exit(0);
  }
}

const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: npm run revoke-access <email>');
  process.exit(1);
}

revokeAccess(email);
