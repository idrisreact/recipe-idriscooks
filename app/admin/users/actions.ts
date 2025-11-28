'use server';

import { db } from '@/src/db';
import { user } from '@/src/db/schemas/user.schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/utils/auth';
import { headers } from 'next/headers';
import { isAdmin } from '@/src/utils/roles';

export async function updateUserRole(formData: FormData) {
  // Verify admin access
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userIsAdmin = await isAdmin(session.user.id);

  if (!userIsAdmin) {
    throw new Error('Only admins can update user roles');
  }

  const userId = formData.get('userId') as string;
  const role = formData.get('role') as string;

  if (!userId || !role) {
    throw new Error('Missing required fields');
  }

  if (role !== 'user' && role !== 'admin') {
    throw new Error('Invalid role');
  }

  // Update user role
  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId));

  revalidatePath('/admin/users');

  return { success: true };
}

export async function deleteUser(formData: FormData) {
  // Verify admin access
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userIsAdmin = await isAdmin(session.user.id);

  if (!userIsAdmin) {
    throw new Error('Only admins can delete users');
  }

  const userId = formData.get('userId') as string;

  if (!userId) {
    throw new Error('Missing user ID');
  }

  // Prevent self-deletion
  if (userId === session.user.id) {
    throw new Error('Cannot delete your own account');
  }

  // Delete user
  await db.delete(user).where(eq(user.id, userId));

  revalidatePath('/admin/users');

  return { success: true };
}
