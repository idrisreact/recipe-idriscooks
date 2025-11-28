import { db } from '../db';
import { user } from '../db/schemas/user.schema';
import { eq } from 'drizzle-orm';

export type UserRole = 'user' | 'admin';

export async function getUserRole(userId: string): Promise<UserRole> {
  const [currentUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return (currentUser?.role as UserRole) || 'user';
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}

export function checkAdminRole(role: string | null | undefined): boolean {
  return role === 'admin';
}
