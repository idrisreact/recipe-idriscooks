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

// CORS configuration
const allowedOrigins = [
  process.env.NEXT_PUBLIC_BASE_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// Body size limits (in bytes)
const DEFAULT_BODY_LIMIT = 100 * 1024; // 100KB
const WEBHOOK_BODY_LIMIT = 512 * 1024; // 512KB

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isWebhookRoute = pathname.startsWith('/api/webhooks/');

  // Body size limit check for mutating requests to API routes
  if (isApiRoute && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const limit = isWebhookRoute ? WEBHOOK_BODY_LIMIT : DEFAULT_BODY_LIMIT;
      if (size > limit) {
        return NextResponse.json(
          { error: 'Request body too large' },
          { status: 413 }
        );
      }
    }
  }

  // CORS handling for API routes (exclude webhooks - server-to-server)
  if (isApiRoute && !isWebhookRoute) {
    const origin = request.headers.get('origin');
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      const preflightHeaders: Record<string, string> = { ...corsHeaders };
      if (isAllowedOrigin) {
        preflightHeaders['Access-Control-Allow-Origin'] = origin;
      }
      return new NextResponse(null, { status: 204, headers: preflightHeaders });
    }

    // Add CORS headers to API responses
    const response = NextResponse.next();
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return response;
  }

  // Allow all public routes and API routes to pass through
  if (isPublicRoute(pathname)) {
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
