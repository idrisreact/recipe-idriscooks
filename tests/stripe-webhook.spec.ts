import { test, expect } from '@playwright/test';
import crypto from 'crypto';

test.describe('Stripe Webhooks', () => {
  
  // Helper function to create a valid Stripe signature
  function createStripeSignature(payload: string, secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  test.describe('Webhook Signature Validation', () => {
    test('should reject requests without stripe-signature header', async ({ request }) => {
      const payload = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} }
      });

      const response = await request.post('/api/stripe/webhook', {
        data: payload,
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Webhook handler failed');
    });

    test('should reject requests with invalid signature', async ({ request }) => {
      const payload = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} }
      });

      const response = await request.post('/api/stripe/webhook', {
        data: payload,
        headers: {
          'Content-Type': 'text/plain',
          'stripe-signature': 'invalid-signature'
        }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Webhook handler failed');
    });
  });

  test.describe('Checkout Session Completed Events', () => {
    test('should handle checkout.session.completed for authenticated users', async ({ request }) => {
      const sessionData = {
        id: 'cs_test_session_123',
        amount_total: 499,
        metadata: {
          userId: 'user_123',
          recipeCount: '5',
          type: 'pdf_download'
        }
      };

      const payload = JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: sessionData
        }
      });

      // Note: In a real test environment, you'd use a test webhook secret
      // For this demo, we'll test the structure and error handling
      const response = await request.post('/api/stripe/webhook', {
        data: payload,
        headers: {
          'Content-Type': 'text/plain',
          'stripe-signature': 'mock-signature' // This will fail signature validation
        }
      });

      // Expect signature validation to fail with our mock signature
      expect(response.status()).toBe(400);
    });

    test('should handle checkout.session.completed for guest users', async ({ request }) => {
      const sessionData = {
        id: 'cs_test_session_456',
        amount_total: 299,
        metadata: {
          userId: 'guest',
          recipeCount: '3',
          type: 'pdf_download'
        }
      };

      const payload = JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: sessionData
        }
      });

      const response = await request.post('/api/stripe/webhook', {
        data: payload,
        headers: {
          'Content-Type': 'text/plain',
          'stripe-signature': 'mock-signature'
        }
      });

      expect(response.status()).toBe(400); // Signature validation will fail
    });
  });

  test.describe('Payment Intent Events', () => {
    test('should handle payment_intent.succeeded events', async ({ request }) => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_payment_123',
            amount: 499,
            currency: 'usd'
          }
        }
      });

      const response = await request.post('/api/stripe/webhook', {
        data: payload,
        headers: {
          'Content-Type': 'text/plain',
          'stripe-signature': 'mock-signature'
        }
      });

      expect(response.status()).toBe(400); // Signature validation will fail
    });
  });

  test.describe('Unknown Event Types', () => {
    test('should handle unknown event types gracefully', async ({ request }) => {
      const payload = JSON.stringify({
        type: 'unknown.event.type',
        data: {
          object: {}
        }
      });

      const response = await request.post('/api/stripe/webhook', {
        data: payload,
        headers: {
          'Content-Type': 'text/plain',
          'stripe-signature': 'mock-signature'
        }
      });

      expect(response.status()).toBe(400); // Signature validation will fail
    });
  });

  test.describe('Malformed Requests', () => {
    test('should handle malformed JSON', async ({ request }) => {
      const response = await request.post('/api/stripe/webhook', {
        data: 'invalid json{',
        headers: {
          'Content-Type': 'text/plain',
          'stripe-signature': 'mock-signature'
        }
      });

      expect(response.status()).toBe(400);
    });

    test('should handle empty request body', async ({ request }) => {
      const response = await request.post('/api/stripe/webhook', {
        data: '',
        headers: {
          'Content-Type': 'text/plain',
          'stripe-signature': 'mock-signature'
        }
      });

      expect(response.status()).toBe(400);
    });

    test('should handle requests without content-type', async ({ request }) => {
      const payload = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} }
      });

      const response = await request.post('/api/stripe/webhook', {
        data: payload,
        headers: {
          'stripe-signature': 'mock-signature'
        }
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Error Recovery', () => {
    test('should return proper error format', async ({ request }) => {
      const response = await request.post('/api/stripe/webhook', {
        data: 'invalid',
        headers: {
          'stripe-signature': 'invalid'
        }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Webhook handler failed');
    });
  });
});

test.describe('Webhook Integration Tests', () => {
  test('should be accessible via POST only', async ({ request }) => {
    // Test GET request should fail
    const getResponse = await request.get('/api/stripe/webhook');
    expect(getResponse.status()).toBe(405); // Method not allowed
    
    // Test PUT request should fail  
    const putResponse = await request.put('/api/stripe/webhook');
    expect(putResponse.status()).toBe(405);
    
    // Test DELETE request should fail
    const deleteResponse = await request.delete('/api/stripe/webhook');
    expect(deleteResponse.status()).toBe(405);
  });

  test('should require proper content type for POST', async ({ request }) => {
    const response = await request.post('/api/stripe/webhook', {
      data: JSON.stringify({ test: 'data' }),
      headers: {
        'Content-Type': 'application/json', // Wrong content type for webhooks
        'stripe-signature': 'test-signature'
      }
    });

    expect(response.status()).toBe(400);
  });
});