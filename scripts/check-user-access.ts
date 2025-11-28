import { db } from '../src/db';
import { user } from '../src/db/schemas/user.schema';
import { premiumFeatures } from '../src/db/schemas/premium-features.schema';
import { eq, and } from 'drizzle-orm';

async function checkUserAccess(email: string) {
  try {
    console.log(`🔍 Checking access for: ${email}`);

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

    // Check for recipe access
    const [recipeAccess] = await db
      .select()
      .from(premiumFeatures)
      .where(
        and(
          eq(premiumFeatures.userId, foundUser.id),
          eq(premiumFeatures.feature, 'recipe_access')
        )
      )
      .limit(1);

    // Check for PDF access
    const [pdfAccess] = await db
      .select()
      .from(premiumFeatures)
      .where(
        and(
          eq(premiumFeatures.userId, foundUser.id),
          eq(premiumFeatures.feature, 'pdf_downloads')
        )
      )
      .limit(1);

    console.log('\n📊 Access Status:');
    console.log(`   Recipe Access: ${recipeAccess ? '✅ YES' : '❌ NO'}`);
    console.log(`   PDF Downloads: ${pdfAccess ? '✅ YES' : '❌ NO'}`);

    if (recipeAccess) {
      console.log('\n   Recipe Access Details:');
      console.log(`   - Granted: ${recipeAccess.grantedAt}`);
      console.log(`   - Expires: ${recipeAccess.expiresAt || 'Never (Lifetime)'}`);
      console.log(`   - Metadata:`, recipeAccess.metadata);
    }

    if (pdfAccess) {
      console.log('\n   PDF Access Details:');
      console.log(`   - Granted: ${pdfAccess.grantedAt}`);
      console.log(`   - Expires: ${pdfAccess.expiresAt || 'Never (Lifetime)'}`);
      console.log(`   - Metadata:`, pdfAccess.metadata);
    }
  } catch (error) {
    console.error('❌ Error checking user access:', error);
  }
}

const email = process.argv[2] || 'idriscooks@gmail.com';
checkUserAccess(email);
