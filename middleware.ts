import { NextResponse, type NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/recipes',
  '/pricing',
  '/contact',
  '/about',
  '/sign-in',
  '/sign-up',
  '/api/auth',
  '/api/webhooks',
  '/api/recipes',
  '/api/contact',
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function middleware(request: NextRequest) {
  // Allow all public routes and API routes to pass through
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // For protected routes, better-auth handles authentication at the page/API level
  // No need to block here - let the route handlers check session
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};