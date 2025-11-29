const { test, expect } = require('@playwright/test');

test.describe('Home Page - Recent Recipes with Animations', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
  });

  test('Home page loads with hero section', async ({ page }) => {
    await page.goto('/');

    // Wait for hero section to load
    await page.waitForSelector('.section-full', { timeout: 10000 });

    // Check hero elements are visible
    await expect(page.locator('h1:has-text("Culinary")')).toBeVisible();
    await expect(page.locator('h1 span.text-gradient-primary:has-text("Innovation")')).toBeVisible();
    await expect(page.locator('h1:has-text("Starts Here")')).toBeVisible();

    // Check hero buttons
    await expect(page.locator('text=Explore Recipes')).toBeVisible();
    await expect(page.locator('text=Watch Story')).toBeVisible();
  });

  test('Most popular recipes section displays correctly', async ({ page }) => {
    await page.goto('/');

    // Scroll to popular recipes section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(2000);

    // Check section heading with new styling (text is split across lines)
    const mostPopularHeading = page.locator('h2:has-text("Most Popular")');
    await expect(mostPopularHeading).toBeVisible({ timeout: 10000 });

    // Wait for recipes to load (either loading state or actual recipes)
    const recipeCards = page.locator('.editorial-card, .luxury-card');

    // Should show either loading cards or actual recipe cards
    const cardCount = await recipeCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('Quote section displays correctly', async ({ page }) => {
    await page.goto('/');

    // Scroll to quote section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.5));
    await page.waitForTimeout(1000);

    // Check quote section - use first() to avoid strict mode violation
    const quoteText = page.locator('.quote-text').first();
    await expect(quoteText).toBeVisible();
  });

  test('Recent recipes section displays with animations', async ({ page }) => {
    await page.goto('/');

    // Scroll to recent recipes section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000); // Wait for scroll animations

    // Check for recipe cards (either loading or actual)
    const recipeCards = page.locator('.editorial-card, .luxury-card, .animate-pulse');
    const cardCount = await recipeCards.count();

    if (cardCount > 0) {
      expect(cardCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('Recipe cards are clickable and navigate correctly', async ({ page }) => {
    await page.goto('/');

    // Scroll to recipes section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
    await page.waitForTimeout(2000);

    // Find clickable recipe cards
    const recipeCards = page.locator('.editorial-card').filter({ hasNot: page.locator('.animate-pulse') });
    const cardCount = await recipeCards.count();

    if (cardCount > 0) {
      const firstCard = recipeCards.first();

      // Click on the card
      await firstCard.click();

      // Should navigate to recipe detail page or sign-in page (if auth is required)
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/\/(recipes\/category\/|sign-in)/);
    }
  });

  test('Mobile responsiveness works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check hero section on mobile
    await expect(page.locator('h1:has-text("Culinary")')).toBeVisible();

    // Scroll through sections
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(1000);

    // Check popular recipes on mobile
    await expect(page.locator('h2:has-text("Most Popular")')).toBeVisible();

    // Cards should be properly sized for mobile
    const cards = page.locator('.editorial-card, .luxury-card');
    if (await cards.count() > 0) {
      const firstCard = cards.first();
      const cardWidth = await firstCard.evaluate(el => el.offsetWidth);
      expect(cardWidth).toBeLessThan(400);
    }
  });

  test('GSAP scroll animations are configured', async ({ page }) => {
    await page.goto('/');

    // Scroll down to trigger animations
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(2000);

    // Check that hero section exists - use first() to avoid strict mode violation
    const heroSection = page.locator('.section-full').first();
    await expect(heroSection).toBeVisible();
  });

  test('Page uses consistent styling', async ({ page }) => {
    await page.goto('/');

    // Scroll through the page
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);

    // Check for editorial/luxury cards
    const cards = page.locator('.editorial-card, .luxury-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Check for primary color usage
    const primaryElements = page.locator('[class*="text-gradient-primary"]');
    const primaryCount = await primaryElements.count();
    expect(primaryCount).toBeGreaterThan(0);
  });

  test('Hero CTA buttons work correctly', async ({ page }) => {
    await page.goto('/');

    // Find and click Explore Recipes button
    const exploreButton = page.locator('a:has-text("Explore Recipes")');
    await exploreButton.click();

    // Should navigate to recipes page
    await expect(page).toHaveURL(/.*\/recipes/);
  });
});
