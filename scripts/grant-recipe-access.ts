import { db } from '../src/db';
import { user } from '../src/db/schemas/user.schema';
import { premiumFeatures } from '../src/db/schemas/premium-features.schema';
import { eq } from 'drizzle-orm';

async function grantRecipeAccess(email: string) {
  try {
    console.log(`🔐 Granting recipe access to: ${email}`);

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

    // Grant recipe access
    const result = await db
      .insert(premiumFeatures)
      .values({
        userId: foundUser.id,
        feature: 'recipe_access',
        grantedAt: new Date(),
        expiresAt: null, // Lifetime access
        metadata: {
          manuallyGranted: true,
          grantedBy: 'admin',
          reason: 'Payment completed but webhook not delivered',
          planType: 'one_time_recipe_access'
        },
      })
      .onConflictDoUpdate({
        target: [premiumFeatures.userId, premiumFeatures.feature],
        set: {
          grantedAt: new Date(),
          metadata: {
            manuallyGranted: true,
            grantedBy: 'admin',
            reason: 'Payment completed but webhook not delivered',
            planType: 'one_time_recipe_access'
          },
        },
      });

    console.log('✅ Recipe access granted successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Error granting recipe access:', error);
  }
  process.exit(0);
}

const email = process.argv[2] || 'idriscooks@gmail.com';
grantRecipeAccess(email);
