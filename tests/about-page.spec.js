const { test, expect } = require('@playwright/test');

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('displays the hero section with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/About | Idris Cooks/);
    await expect(page.getByText('The Story')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'IDRIS TAIWO' })).toBeVisible();
    await expect(page.getByText('Culinary Artist & Content Creator')).toBeVisible();
  });

  test('displays the bio section', async ({ page }) => {
    // Scroll to bio section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));

    await expect(page.getByRole('heading', { name: 'More than just cooking.' })).toBeVisible();
    await expect(page.getByText('Welcome to my kitchen!')).toBeVisible();
    await expect(page.locator('img[alt="Idris Cartoon"]')).toBeVisible();
  });

  test('displays stats section', async ({ page }) => {
    // Scroll to stats
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));

    await expect(page.getByText('17K+')).toBeVisible();
    await expect(page.getByText('Followers')).toBeVisible();
    await expect(page.getByText('100+')).toBeVisible();
    await expect(page.getByText('Recipes')).toBeVisible();
  });

  test('displays philosophy section', async ({ page }) => {
    // Scroll to philosophy
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3));

    await expect(page.getByText('The Art of Modern Cooking')).toBeVisible();
    await expect(page.getByText('Simplicity')).toBeVisible();
    await expect(page.getByText('Innovation')).toBeVisible();
    await expect(page.getByText('Community')).toBeVisible();
  });

  test('displays CTA section', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByRole('heading', { name: 'READY TO START COOKING?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Recipes' })).toBeVisible();
  });
});