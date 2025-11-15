/**
 * Map Clerk user to existing better-auth user in database
 * This finds the existing user by email and returns their database ID
 * instead of trying to sync Clerk's ID (which would break foreign key constraints)
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/src/db';
import { user } from '@/src/db/schemas';
import { eq } from 'drizzle-orm';

export async function getDbUserIdForClerkUser(): Promise<string | null> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  // Get Clerk user's email
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return null;
  }

  // Find existing user by email in better-auth user table
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    // Return the existing better-auth user ID
    return existingUser.id;
  }

  // User doesn't exist in database yet - create them with a new ID
  const name = clerkUser.firstName && clerkUser.lastName
    ? `${clerkUser.firstName} ${clerkUser.lastName}`
    : clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || 'User';

  try {
    const [newUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(), // Generate new ID for better-auth table
        email: email,
        name: name,
        emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        image: clerkUser.imageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newUser.id;
  } catch (error: unknown) {
    console.error('Error creating user in database:', error);

    // Try to find the user again in case of race condition
    const [retryUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return retryUser?.id || null;
  }
}
