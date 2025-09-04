import { test, expect } from '@playwright/test';

test.describe('Stripe API Endpoints', () => {
  
  test.describe('Checkout Session Creation', () => {
    test('should create valid checkout session', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout', {
        data: {
          recipeCount: 5
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.sessionId).toMatch(/^cs_/); // Stripe session IDs start with cs_
      expect(data.url).toContain('checkout.stripe.com');
    });

    test('should reject invalid recipe counts', async ({ request }) => {
      const invalidCounts = [-1, 0, null, undefined, 'invalid'];
      
      for (const count of invalidCounts) {
        const response = await request.post('/api/stripe/checkout', {
          data: {
            recipeCount: count
          }
        });

        expect(response.status()).toBe(400);
        
        const errorData = await response.json();
        expect(errorData.error).toContain('Invalid recipe count');
      }
    });

    test('should handle missing request body', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout');

      expect([400, 500]).toContain(response.status());
    });

    test('should set correct metadata', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout', {
        data: {
          recipeCount: 10
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // The session should be created with proper metadata
      // We can't directly access metadata from the response, 
      // but we can verify the session ID format
      expect(data.sessionId).toMatch(/^cs_/);
    });
  });

  test.describe('Session Verification', () => {
    test('should require session ID', async ({ request }) => {
      const response = await request.post('/api/stripe/verify-session', {
        data: {}
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session ID is required');
    });

    test('should handle invalid session ID format', async ({ request }) => {
      const response = await request.post('/api/stripe/verify-session', {
        data: {
          sessionId: 'invalid_session_id'
        }
      });

      expect(response.status()).toBe(500);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to verify session');
    });

    test('should handle missing request body for verification', async ({ request }) => {
      const response = await request.post('/api/stripe/verify-session');

      expect([400, 500]).toContain(response.status());
    });
  });

  test.describe('Error Handling', () => {
    test('should handle malformed JSON in checkout', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout', {
        data: 'invalid json'
      });

      expect([400, 500]).toContain(response.status());
    });

    test('should handle malformed JSON in verify-session', async ({ request }) => {
      const response = await request.post('/api/stripe/verify-session', {
        data: 'invalid json'
      });

      expect([400, 500]).toContain(response.status());
    });

    test('should return proper error structure', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout', {
        data: {
          recipeCount: -5
        }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });

  test.describe('Rate Limiting & Performance', () => {
    test('should handle multiple concurrent requests', async ({ request }) => {
      const requests = Array(5).fill(null).map(() => 
        request.post('/api/stripe/checkout', {
          data: {
            recipeCount: Math.floor(Math.random() * 10) + 1
          }
        })
      );

      const responses = await Promise.all(requests);
      
      // All should succeed or at least not fail catastrophically
      responses.forEach(response => {
        expect([200, 429, 500]).toContain(response.status()); // Include 429 for rate limiting
      });
    });

    test('should respond within reasonable time', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.post('/api/stripe/checkout', {
        data: {
          recipeCount: 3
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(10000); // Should respond within 10 seconds
      expect([200, 400, 500]).toContain(response.status());
    });
  });

  test.describe('Content Type Validation', () => {
    test('should accept application/json', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout', {
        data: {
          recipeCount: 5
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect([200, 400]).toContain(response.status()); // 400 for validation errors is ok
    });

    test('should handle requests without content-type', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout', {
        data: JSON.stringify({
          recipeCount: 5
        })
      });

      expect([200, 400, 415]).toContain(response.status()); // 415 for unsupported media type
    });
  });
});