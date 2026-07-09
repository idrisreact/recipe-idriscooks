const { test, expect } = require('@playwright/test');

test.describe('Subscription route', () => {
  test('permanently redirects to /pricing', async ({ page }) => {
    const response = await page.goto('/subscription');

    expect(page.url()).toContain('/pricing');
    expect(response.ok()).toBeTruthy();
  });

  test('pricing page presents the lifetime access offer', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.locator('h1')).toContainText('Pay once');
    await expect(page.getByRole('heading', { name: 'The whole cookbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
  });
});
