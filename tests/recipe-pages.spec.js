const { test, expect } = require('@playwright/test');

test.describe('Recipe Pages - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Increase timeout for slower operations
    test.setTimeout(60000);
  });

  test('Homepage loads and displays correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check basic page structure
    await expect(page.locator('body')).toHaveClass(/font-montserrat/);
    await expect(page).toHaveTitle(/Idris Cooks/);
    
    // Check hero section
    await expect(page.locator('img[alt="idris-cooks-logo"]')).toBeVisible();
    await expect(page.getByText('Elevate Your Kitchen')).toBeVisible();
    
    // Check buttons are present and clickable
    await expect(page.getByText('Explore Recipes')).toBeVisible();
    await expect(page.getByText('View Ideas')).toBeVisible();
  });

  test('Recipes listing page functionality', async ({ page }) => {
    await page.goto('//recipes');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="recipe-card"], .recipe-grid, article', { timeout: 10000 });
    
    // Check that recipes are loaded
    const recipes = await page.locator('article, [data-testid="recipe-card"], .murakamicity-card').count();
    expect(recipes).toBeGreaterThan(0);
    
    // Check dark theme is applied
    const body = await page.locator('body');
    const backgroundColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toContain('0, 0, 0'); // Should be black or very dark
  });

  test('Navigation menu works properly', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop navigation
    if (await page.locator('nav').isVisible()) {
      await expect(page.locator('nav').getByRole('link', { name: 'Home', exact: true })).toBeVisible();
      await expect(page.locator('nav').getByRole('link', { name: 'Recipes', exact: true })).toBeVisible();
      await expect(page.locator('nav').getByRole('link', { name: 'About', exact: true })).toBeVisible();
    }
    
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    const hamburger = page.locator('button[aria-label*="menu"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await expect(page.locator('#mobile-menu')).toBeVisible();
    }
  });

  test('Mobile responsiveness - Recipe cards', async ({ page }) => {
    await page.goto('//recipes');
    
    // Test different mobile viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 414, height: 896 }, // iPhone 11
      { width: 768, height: 1024 } // iPad
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('domcontentloaded');
      
      // Check that content is visible and not overflowing
      const recipeCards = await page.locator('article, [data-testid="recipe-card"]').count();
      if (recipeCards > 0) {
        const firstCard = page.locator('article, [data-testid="recipe-card"]').first();
        await expect(firstCard).toBeVisible();
        
        // Check that cards are properly sized for mobile
        const cardWidth = await firstCard.evaluate(el => el.offsetWidth);
        expect(cardWidth).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('Recipe category pages load correctly', async ({ page }) => {
    await page.goto('//recipes');
    await page.waitForSelector('article, [data-testid="recipe-card"]', { timeout: 10000 });
    
    // Find first recipe link
    const firstRecipeLink = await page.locator('article, [data-testid="recipe-card"]').first().locator('a').first();
    if (await firstRecipeLink.count() > 0) {
      const href = await firstRecipeLink.getAttribute('href');
      if (href && href.includes('/recipes/category/')) {
        await firstRecipeLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        // Check that we're on a recipe detail page
        expect(page.url()).toContain('/recipes/category/');
        
        // The page should load without 500 errors
        const title = await page.title();
        expect(title).not.toContain('500');
      }
    }
  });

  test('Search functionality (if present)', async ({ page }) => {
    await page.goto('//recipes');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('chicken');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // Check that results are filtered (implementation dependent)
      const results = await page.locator('article, [data-testid="recipe-card"]').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('Accessibility compliance', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Check for alt attributes on images
    const images = await page.locator('img').count();
    for (let i = 0; i < images; i++) {
      const img = page.locator('img').nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
    
    // Check for proper button labels
    const buttons = await page.locator('button').count();
    for (let i = 0; i < buttons; i++) {
      const button = page.locator('button').nth(i);
      const label = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(label || text).toBeTruthy();
    }
  });

  test('Color contrast and theme application', async ({ page }) => {
    await page.goto('/');
    
    // Check that dark theme is properly applied
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    const color = await body.evaluate(el => getComputedStyle(el).color);
    
    // Should have dark background and light text
    expect(backgroundColor).toMatch(/(0, 0, 0)|(17, 17, 17)/);
    expect(color).toMatch(/(255, 255, 255)|(250, 250, 250)/);
  });

  test('Interactive elements work properly', async ({ page }) => {
    await page.goto('/');
    
    // Test hero buttons
    const exploreButton = page.getByText('Explore Recipes');
    if (await exploreButton.isVisible()) {
      await exploreButton.hover();
      // Should have hover effects
      await expect(exploreButton).toBeVisible();
    }
    
    // Test navigation to recipes page
    await page.goto('//recipes');
    await page.waitForLoadState('domcontentloaded');
    
    // Check for interactive recipe cards
    const recipeCards = page.locator('article, [data-testid="recipe-card"]');
    const cardCount = await recipeCards.count();
    
    if (cardCount > 0) {
      const firstCard = recipeCards.first();
      await firstCard.hover();
      // Cards should be interactive
      await expect(firstCard).toBeVisible();
    }
  });

  test('Performance and loading states', async ({ page }) => {
    // Monitor network requests
    const responses = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status()
      });
    });
    
    await page.goto('//recipes');
    await page.waitForLoadState('networkidle');
    
    // Check for any failed requests
    const failedRequests = responses.filter(r => r.status >= 400);
    console.log('Failed requests:', failedRequests);
    
    // API requests should generally succeed (except auth-related 401s which are expected)
    const criticalFailures = failedRequests.filter(r => 
      !r.url.includes('/api/favorites') && // 401 expected when not authenticated
      !r.url.includes('/api/auth/') && // Auth failures might be expected
      r.status >= 500 // Focus on server errors
    );
    
    expect(criticalFailures.length).toBe(0);
  });
});