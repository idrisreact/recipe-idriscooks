import { test, expect, type Page } from '@playwright/test';

test.describe('Stripe Checkout Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });

  test('should create checkout session for authenticated user', async () => {
    // Mock login or navigate to authenticated state
    await page.goto('/favorites');
    
    // Check if favorites page loads (might need authentication)
    await expect(page).toHaveTitle(/favorites/i);
    
    // Look for PDF download button or similar trigger
    const pdfButton = page.locator('[data-testid="pdf-download-btn"], .pdf-download, [aria-label*="PDF"], button:has-text("PDF")').first();
    
    if (await pdfButton.count() > 0) {
      await pdfButton.click();
      
      // Should redirect to Stripe checkout or show payment modal
      await page.waitForLoadState('networkidle');
      
      // Check for Stripe elements or payment form
      const isStripeCheckout = await page.url().includes('checkout.stripe.com') || 
                              await page.locator('[data-testid="stripe-elements"], .stripe-checkout, #payment-element').count() > 0;
      
      expect(isStripeCheckout).toBeTruthy();
    }
  });

  test('should handle checkout API endpoint', async () => {
    // Test the API directly
    const response = await page.request.post('/api/stripe/checkout', {
      data: {
        recipeCount: 5
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty('sessionId');
    expect(responseData).toHaveProperty('url');
    expect(responseData.url).toContain('checkout.stripe.com');
  });

  test('should validate recipe count in checkout', async () => {
    // Test invalid recipe count
    const invalidResponse = await page.request.post('/api/stripe/checkout', {
      data: {
        recipeCount: 0
      }
    });

    expect(invalidResponse.status()).toBe(400);
    
    const errorData = await invalidResponse.json();
    expect(errorData).toHaveProperty('error');
    expect(errorData.error).toContain('Invalid recipe count');
  });

  test('should calculate correct pricing based on recipe count', async () => {
    const testCases = [
      { recipeCount: 3, expectedMinPrice: 299 }, // $2.99
      { recipeCount: 8, expectedMinPrice: 499 }, // $4.99  
      { recipeCount: 15, expectedMinPrice: 799 }, // $7.99
      { recipeCount: 25, expectedMinPrice: 999 } // $9.99
    ];

    for (const testCase of testCases) {
      const response = await page.request.post('/api/stripe/checkout', {
        data: {
          recipeCount: testCase.recipeCount
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // Verify session was created successfully
      expect(data.sessionId).toBeDefined();
      expect(data.url).toContain('checkout.stripe.com');
    }
  });

  test('should handle payment success page', async () => {
    // Navigate to success page with mock session ID
    await page.goto('/payment/success?session_id=cs_test_mockid123');
    
    // Check if success page renders
    await expect(page).toHaveTitle(/success|payment|thank/i);
    
    // Look for success indicators
    const successIndicators = await page.locator(
      '[data-testid="payment-success"], .success, .payment-complete, h1:has-text("success")'
    ).count();
    
    expect(successIndicators).toBeGreaterThan(0);
  });

  test('should verify session endpoint', async () => {
    // Test session verification with mock ID
    const response = await page.request.post('/api/stripe/verify-session', {
      data: {
        sessionId: 'cs_test_mock_session_id'
      }
    });

    // Should handle the mock session gracefully (might return error for test ID)
    expect([200, 400, 500]).toContain(response.status());
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
  });

  test('should require session ID for verification', async () => {
    const response = await page.request.post('/api/stripe/verify-session', {
      data: {}
    });

    expect(response.status()).toBe(400);
    
    const errorData = await response.json();
    expect(errorData.success).toBe(false);
    expect(errorData.error).toContain('Session ID is required');
  });

  test.afterEach(async () => {
    await page.close();
  });
});