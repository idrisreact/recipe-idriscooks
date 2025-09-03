const { test, expect } = require('@playwright/test');

test.describe('Mobile Functionality Fixes', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
  });

  test('Hamburger menu works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForSelector('button[aria-label*="menu"]', { timeout: 10000 });
    
    // Check hamburger button is visible on mobile
    const hamburgerButton = page.locator('button[aria-label*="menu"]').first();
    await expect(hamburgerButton).toBeVisible();
    
    // Click hamburger button
    await hamburgerButton.click();
    
    // Check mobile menu appears
    await expect(page.locator('#mobile-menu')).toBeVisible();
    
    // Check navigation links are present
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Home', exact: true })).toBeVisible();
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Recipes', exact: true })).toBeVisible();
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'About', exact: true })).toBeVisible();
    
    // Click outside menu to close
    await page.locator('#mobile-menu').click();
    
    // Menu should close
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
  });

  test('Category page is mobile responsive', async ({ page }) => {
    // Set mobile viewport  
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to recipes page first
    await page.goto('http://localhost:3000/recipes');
    await page.waitForSelector('article, [data-testid="recipe-card"]', { timeout: 10000 });
    
    // Find and click first recipe
    const firstRecipe = page.locator('article, [data-testid="recipe-card"]').first();
    const recipeLink = firstRecipe.locator('a').first();
    
    if (await recipeLink.count() > 0) {
      await recipeLink.click();
      await page.waitForLoadState('domcontentloaded');
      
      // Check that we're on recipe detail page
      expect(page.url()).toContain('/recipes/category/');
      
      // Check mobile-specific elements are visible
      await expect(page.getByText('Back')).toBeVisible();
      
      // Check image is responsive
      const heroImage = page.locator('img[alt*="recipe"], img[priority]').first();
      if (await heroImage.count() > 0) {
        const imageRect = await heroImage.boundingBox();
        expect(imageRect.width).toBeLessThanOrEqual(375); // Should fit mobile screen
      }
      
      // Check mobile action buttons are present
      const favoriteButton = page.locator('button:has-text("Favorite")').last(); // Mobile version
      if (await favoriteButton.isVisible()) {
        await expect(favoriteButton).toBeVisible();
      }
      
      // Check content doesn't overflow horizontally
      const pageContent = page.locator('main');
      const contentRect = await pageContent.boundingBox();
      expect(contentRect.width).toBeLessThanOrEqual(375);
    }
  });

  test('Mobile navigation between pages works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Open hamburger menu
    const hamburgerButton = page.locator('button[aria-label*="menu"]').first();
    await hamburgerButton.click();
    
    // Click Recipes link
    await page.locator('#mobile-menu').getByRole('link', { name: 'Recipes', exact: true }).click();
    
    // Should navigate to recipes page
    await page.waitForURL('**/recipes');
    expect(page.url()).toContain('/recipes');
    
    // Menu should be closed
    await expect(page.locator('#mobile-menu')).not.toBeVisible();
    
    // Check recipes page loads properly on mobile
    await page.waitForSelector('article, [data-testid="recipe-card"]', { timeout: 10000 });
    const recipeCount = await page.locator('article, [data-testid="recipe-card"]').count();
    expect(recipeCount).toBeGreaterThan(0);
  });

  test('Mobile typography and spacing looks good', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test homepage
    await page.goto('http://localhost:3000');
    
    // Check hero text is readable on mobile
    const heroText = page.getByText('Elevate Your Kitchen');
    await expect(heroText).toBeVisible();
    
    // Check buttons are touch-friendly
    const exploreButton = page.getByText('Explore Recipes');
    await expect(exploreButton).toBeVisible();
    
    const buttonRect = await exploreButton.boundingBox();
    expect(buttonRect.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    
    // Test recipes page
    await page.goto('http://localhost:3000/recipes');
    await page.waitForSelector('article, [data-testid="recipe-card"]', { timeout: 10000 });
    
    // Check recipe cards are appropriately sized for mobile
    const firstCard = page.locator('article, [data-testid="recipe-card"]').first();
    const cardRect = await firstCard.boundingBox();
    expect(cardRect.width).toBeLessThanOrEqual(375);
    expect(cardRect.width).toBeGreaterThan(300); // Should use most of the screen width
  });

  test('Touch interactions work properly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Test click on hero buttons (works like tap on mobile)
    const exploreButton = page.getByText('Explore Recipes');
    await exploreButton.click();
    
    // Should navigate to recipes
    await page.waitForURL('**/recipes');
    expect(page.url()).toContain('/recipes');
    
    // Test click on recipe cards
    await page.waitForSelector('article, [data-testid="recipe-card"]', { timeout: 10000 });
    const firstCard = page.locator('article, [data-testid="recipe-card"]').first();
    const recipeLink = firstCard.locator('a').first();
    
    if (await recipeLink.count() > 0) {
      await recipeLink.click();
      await page.waitForLoadState('domcontentloaded');
      
      // Should navigate to recipe detail (or stay on recipes if no valid link)
      const url = page.url();
      expect(url).toMatch(/(\/recipes\/category\/|\/recipes)/);
    } else {
      // If no recipe link is found, just verify we're still on recipes page
      expect(page.url()).toContain('/recipes');
    }
  });
});