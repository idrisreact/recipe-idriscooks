import { db } from '../src/db';
import { user } from '../src/db/schemas/user.schema';
import { eq } from 'drizzle-orm';

async function setAdminRole(email: string) {
  try {
    console.log(`🔍 Looking for user: ${email}...`);

    // Find the user
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!existingUser) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${existingUser.name} (${existingUser.email})`);
    console.log(`   Current role: ${existingUser.role}`);

    // Update to admin
    const [updatedUser] = await db
      .update(user)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(user.id, existingUser.id))
      .returning();

    console.log(`✅ User updated to admin role successfully!`);
    console.log(`   New role: ${updatedUser.role}`);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    process.exit(1);
  }
}

const email = process.argv[2] || 'idrist2013@gmail.com';
setAdminRole(email);
