import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Get the current authenticated Clerk user in API routes
 * @returns The authenticated user or null
 */
export async function getClerkUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const user = await currentUser();
    return user;
  } catch (error) {
    console.error('Error getting Clerk user:', error);
    return null;
  }
}

/**
 * Get the current authenticated user ID in API routes
 * @returns The authenticated user ID or null
 */
export async function getClerkUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error('Error getting Clerk user ID:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if user is not authenticated
 * @returns The authenticated user
 * @throws Error if user is not authenticated
 */
export async function requireClerkUser() {
  const userId = await getClerkUserId();
  
  if (!userId) {
    throw new Error('Unauthorized - Authentication required');
  }

  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized - User not found');
  }

  return user;
}

