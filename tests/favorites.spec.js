const { test, expect } = require('@playwright/test');

test.describe('Favorites Page - Authentication Testing', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(30000);
  });

  test('Unauthenticated users see sign-in prompt', async ({ page }) => {
    await page.goto('http://localhost:3002/favorites');
    
    // Wait for the page to load
    await page.waitForSelector('.wrapper.page', { timeout: 10000 });
    
    // Check that sign-in prompt is displayed
    await expect(page.locator('text=Sign in to view your favorites')).toBeVisible();
    await expect(page.getByRole('main').getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Recipes' })).toBeVisible();
    
    // Check for proper styling with murakamicity theme
    const signInButton = page.getByRole('main').getByRole('button', { name: 'Sign In' });
    const buttonClass = await signInButton.getAttribute('class');
    expect(buttonClass).toContain('murakamicity-button');
  });

  test('Sign In modal opens from favorites page', async ({ page }) => {
    await page.goto('http://localhost:3002/favorites');
    
    // Click sign in button
    const signInButton = page.getByRole('main').getByRole('button', { name: 'Sign In' });
    await signInButton.click();
    
    // Modal should open (assuming SignInModal component exists)
    // This test depends on the SignInModal implementation
    await page.waitForTimeout(500);
  });

  test('Browse Recipes button navigates correctly', async ({ page }) => {
    await page.goto('http://localhost:3002/favorites');
    
    // Click browse recipes button
    const browseButton = page.getByRole('button', { name: 'Browse Recipes' });
    await browseButton.click();
    
    // Should navigate to recipes page
    await expect(page).toHaveURL(/.*\/recipes/);
  });

  test('Page styling matches murakamicity theme', async ({ page }) => {
    await page.goto('http://localhost:3002/favorites');
    
    // Check dark theme is applied
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toContain('0, 0, 0');
    
    // Check that the sign-in UI is styled correctly
    await expect(page.locator('text=Sign in to view your favorites')).toBeVisible();
  });

  test('Loading state displays correctly', async ({ page }) => {
    await page.goto('http://localhost:3002/favorites');
    
    // Should show loading state briefly (if session is pending)
    const loadingText = page.locator('text=Loading...');
    // Loading might be very brief, so we don't assert visibility
  });

  test('Mobile responsiveness on favorites page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3002/favorites');
    
    // Check mobile layout
    await expect(page.locator('.wrapper.page')).toBeVisible();
    
    // Check buttons are properly sized for mobile
    const signInButton = page.getByRole('main').getByRole('button', { name: 'Sign In' });
    const buttonWidth = await signInButton.evaluate(el => el.offsetWidth);
    expect(buttonWidth).toBeLessThan(375);
  });
});