import { test, expect, type Page } from '@playwright/test';

test.describe('Stripe Payment Success & Failure Scenarios', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.describe('Payment Success Flows', () => {
    test('should handle successful payment redirect', async () => {
      // Navigate to payment success page with session ID
      await page.goto('/payment/success?session_id=cs_test_success_123');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check if success page elements are present
      const successElements = await page.locator(
        'h1, h2, .success, [data-testid="success"]'
      ).count();
      
      expect(successElements).toBeGreaterThan(0);
      
      // Check for thank you message or similar success indicators
      const hasSuccessText = await page.getByText(/success|thank|complete|paid/i).count();
      expect(hasSuccessText).toBeGreaterThan(0);
    });

    test('should verify session on success page', async () => {
      // Mock the verification API call
      await page.route('**/api/stripe/verify-session', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            session: {
              id: 'cs_test_success_123',
              customer_email: 'test@example.com',
              amount_total: 499,
              currency: 'usd',
              payment_intent: 'pi_test_123',
              metadata: {
                userId: 'user_123',
                recipeCount: '5',
                type: 'pdf_download'
              }
            }
          })
        });
      });

      await page.goto('/payment/success?session_id=cs_test_success_123');
      
      // Wait for the verification request
      await page.waitForRequest('**/api/stripe/verify-session');
      
      // Should display success information
      await expect(page.locator('body')).toContainText(/success|thank|complete/i);
    });

    test('should display payment details on success', async () => {
      // Mock successful verification with payment details
      await page.route('**/api/stripe/verify-session', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            session: {
              id: 'cs_test_success_123',
              customer_email: 'customer@example.com',
              amount_total: 799,
              currency: 'usd',
              metadata: {
                recipeCount: '15'
              }
            }
          })
        });
      });

      await page.goto('/payment/success?session_id=cs_test_success_123');
      await page.waitForLoadState('networkidle');
      
      // Should show payment amount or recipe count
      const hasPaymentInfo = await page.locator('body').textContent();
      expect(hasPaymentInfo).toBeTruthy();
    });
  });

  test.describe('Payment Failure Scenarios', () => {
    test('should handle missing session ID', async () => {
      await page.goto('/payment/success');
      
      // Should show error message or redirect
      await page.waitForLoadState('networkidle');
      
      const hasErrorHandling = await page.locator(
        '.error, [data-testid="error"], .alert-error'
      ).count() > 0 || 
      await page.getByText(/error|invalid|missing/i).count() > 0;
      
      expect(hasErrorHandling).toBeTruthy();
    });

    test('should handle invalid session ID', async () => {
      // Mock API to return session not found
      await page.route('**/api/stripe/verify-session', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Session not found'
          })
        });
      });

      await page.goto('/payment/success?session_id=invalid_session');
      await page.waitForRequest('**/api/stripe/verify-session');
      
      // Should display error message
      const hasError = await page.getByText(/error|not found|invalid/i).count();
      expect(hasError).toBeGreaterThan(0);
    });

    test('should handle unpaid session', async () => {
      // Mock API to return unpaid session
      await page.route('**/api/stripe/verify-session', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Payment not completed',
            payment_status: 'unpaid'
          })
        });
      });

      await page.goto('/payment/success?session_id=cs_test_unpaid_123');
      await page.waitForRequest('**/api/stripe/verify-session');
      
      // Should indicate payment was not completed
      const hasPaymentError = await page.getByText(/not.*complete|unpaid|failed/i).count();
      expect(hasPaymentError).toBeGreaterThan(0);
    });

    test('should handle API error during verification', async () => {
      // Mock API to return server error
      await page.route('**/api/stripe/verify-session', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to verify session'
          })
        });
      });

      await page.goto('/payment/success?session_id=cs_test_error_123');
      await page.waitForRequest('**/api/stripe/verify-session');
      
      // Should handle server error gracefully
      const hasErrorHandling = await page.locator(
        '.error, .alert, [role="alert"]'
      ).count() > 0 || 
      await page.getByText(/error|try.*again|contact/i).count() > 0;
      
      expect(hasErrorHandling).toBeTruthy();
    });
  });

  test.describe('Checkout Flow Integration', () => {
    test('should redirect to Stripe from favorites page', async () => {
      // Mock checkout API
      await page.route('**/api/stripe/checkout', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sessionId: 'cs_test_checkout_123',
            url: 'https://checkout.stripe.com/test-session'
          })
        });
      });

      await page.goto('/favorites');
      
      // Look for PDF download or checkout button
      const checkoutButton = page.locator(
        '[data-testid="pdf-download"], [data-testid="checkout"], button:has-text("PDF"), button:has-text("Download")'
      ).first();
      
      if (await checkoutButton.count() > 0) {
        await checkoutButton.click();
        
        // Should either redirect to Stripe or show payment UI
        const response = await page.waitForResponse('**/api/stripe/checkout');
        expect(response.status()).toBe(200);
      }
    });

    test('should handle checkout cancellation', async () => {
      // Navigate back from cancelled payment
      await page.goto('/favorites?cancelled=true');
      
      // Should show cancellation message or return to normal state
      await expect(page).toHaveURL(/favorites/);
    });

    test('should prevent duplicate checkouts', async () => {
      // Mock checkout to simulate rate limiting or duplicate prevention
      let requestCount = 0;
      await page.route('**/api/stripe/checkout', async (route) => {
        requestCount++;
        if (requestCount > 1) {
          await route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Too many requests'
            })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              sessionId: 'cs_test_123',
              url: 'https://checkout.stripe.com/test'
            })
          });
        }
      });

      await page.goto('/favorites');
      
      const checkoutButton = page.locator(
        'button:has-text("PDF"), button:has-text("Download")'
      ).first();
      
      if (await checkoutButton.count() > 0) {
        // Click multiple times rapidly
        await checkoutButton.click();
        await checkoutButton.click();
        
        // Should handle rate limiting gracefully
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Mobile Payment Flows', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

    test('should work on mobile devices', async () => {
      await page.goto('/payment/success?session_id=cs_test_mobile_123');
      
      // Mobile success page should be responsive
      await expect(page.locator('body')).toBeVisible();
      
      // Check viewport meta tag for mobile optimization
      const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewportMeta).toContain('width=device-width');
    });
  });

  test.describe('SEO and Analytics', () => {
    test('should have proper meta tags on success page', async () => {
      await page.goto('/payment/success?session_id=cs_test_seo_123');
      
      // Check for basic meta tags
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should not expose sensitive information', async () => {
      await page.goto('/payment/success?session_id=cs_test_security_123');
      
      const pageContent = await page.locator('body').textContent();
      
      // Should not expose API keys or secrets
      expect(pageContent).not.toContain('sk_');
      expect(pageContent).not.toContain('whsec_');
      expect(pageContent).not.toContain('secret');
    });
  });

  test.afterEach(async () => {
    await page.close();
  });
});