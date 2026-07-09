import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/src/utils/auth';
import { isAdmin } from '@/src/utils/roles';

/**
 * Requires an authenticated admin session.
 * Returns a 401/403 response to short-circuit with, or null to proceed
 * (same convention as rateLimit in src/lib/rate-limit.ts).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

/**
 * Hides debug/dev-only routes in production behind a 404.
 * Returns the 404 response to short-circuit with, or null to proceed.
 */
export function blockInProduction(): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return null;
}
