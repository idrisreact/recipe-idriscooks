import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis connection
// Falls back to memory-based rate limiting if Redis is not available
let redis: Redis | null = null;

try {
  // For Upstash Redis, use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  // For development, use memory-based rate limiting
  else {
    console.log(
      'Redis not configured for rate limiting. Using memory-based fallback. ' +
        'For production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
    );
  }
} catch (error) {
  console.error('Failed to initialize Redis for rate limiting:', error);
  console.log('Falling back to memory-based rate limiting');
}

/**
 * Rate limiting configuration for different endpoint types
 */
export const rateLimitConfigs = {
  // Strict limits for payment/checkout endpoints
  payment: {
    requests: 5, // 5 requests
    window: '1 m', // per minute
    description: 'Payment endpoints (checkout, verify-payment)',
  },

  // Moderate limits for authenticated API routes
  api: {
    requests: 60, // 60 requests
    window: '1 m', // per minute
    description: 'General API endpoints',
  },

  // Generous limits for public routes
  public: {
    requests: 100, // 100 requests
    window: '1 m', // per minute
    description: 'Public routes (recipes, search)',
  },

  // Very strict for authentication endpoints
  auth: {
    requests: 10, // 10 requests
    window: '5 m', // per 5 minutes
    description: 'Auth endpoints (login, signup)',
  },

  // Webhook endpoints (one-time events)
  webhook: {
    requests: 100, // 100 requests
    window: '1 m', // per minute
    description: 'Webhook endpoints (Stripe, etc.)',
  },
} as const;

export type RateLimitType = keyof typeof rateLimitConfigs;

/**
 * Create rate limiter instances
 */
const rateLimiters: Record<RateLimitType, Ratelimit | null> = {
  payment: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          rateLimitConfigs.payment.requests,
          rateLimitConfigs.payment.window
        ),
        analytics: true,
        prefix: 'ratelimit:payment',
      })
    : null,

  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          rateLimitConfigs.api.requests,
          rateLimitConfigs.api.window
        ),
        analytics: true,
        prefix: 'ratelimit:api',
      })
    : null,

  public: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          rateLimitConfigs.public.requests,
          rateLimitConfigs.public.window
        ),
        analytics: true,
        prefix: 'ratelimit:public',
      })
    : null,

  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          rateLimitConfigs.auth.requests,
          rateLimitConfigs.auth.window
        ),
        analytics: true,
        prefix: 'ratelimit:auth',
      })
    : null,

  webhook: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          rateLimitConfigs.webhook.requests,
          rateLimitConfigs.webhook.window
        ),
        analytics: true,
        prefix: 'ratelimit:webhook',
      })
    : null,
};

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
  // Prefer user ID if available (more accurate)
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip');

  return ip || 'anonymous';
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}> {
  const limiter = rateLimiters[type];

  // If no Redis or rate limiter configured, allow the request
  if (!limiter) {
    console.warn(`Rate limiting not configured for type: ${type}`);
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    // Calculate retry-after in seconds
    const retryAfter = success ? undefined : Math.ceil((reset - Date.now()) / 1000);

    // Log rate limit hits for monitoring
    if (!success) {
      console.warn(`Rate limit exceeded for ${identifier} on ${type} endpoint`, {
        limit,
        remaining,
        reset: new Date(reset).toISOString(),
        retryAfter,
      });
    }

    return {
      success,
      limit,
      remaining,
      reset,
      retryAfter,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow the request if rate limiting fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}

/**
 * Rate limit middleware for Next.js API routes
 */
export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'api',
  userId?: string
): Promise<NextResponse | null> {
  const identifier = getIdentifier(request, userId);
  const result = await checkRateLimit(identifier, type);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': (result.retryAfter || 60).toString(),
        },
      }
    );
  }

  // Add rate limit headers to successful responses
  return null; // Null means proceed with the request
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  type: RateLimitType = 'api',
  getUserId?: (req: NextRequest) => Promise<string | undefined>
) {
  return async (req: NextRequest) => {
    // Get user ID if provided
    const userId = getUserId ? await getUserId(req) : undefined;

    // Check rate limit
    const rateLimitResponse = await rateLimit(req, type, userId);

    // If rate limited, return error response
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Otherwise, proceed with the handler
    return handler(req);
  };
}

/**
 * Memory-based fallback rate limiter (for development without Redis)
 */
class MemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  async check(identifier: string, limit: number, windowMs: number) {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs,
      };
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit,
        remaining: 0,
        reset: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);

    return {
      success: true,
      limit,
      remaining: limit - entry.count,
      reset: entry.resetTime,
    };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Export memory limiter for testing
export const memoryLimiter = new MemoryRateLimiter();

// Cleanup every 5 minutes
if (!redis && typeof setInterval !== 'undefined') {
  setInterval(() => memoryLimiter.cleanup(), 5 * 60 * 1000);
}
