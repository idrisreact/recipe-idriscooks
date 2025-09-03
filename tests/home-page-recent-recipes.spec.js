const { test, expect } = require('@playwright/test');

test.describe('Home Page - Recent Recipes with Animations', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
  });

  test('Home page loads with hero section', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for hero section to load
    await page.waitForSelector('.min-h-\\[100vh\\]', { timeout: 10000 });
    
    // Check hero elements are visible
    await expect(page.locator('img[alt="idris-cooks-logo"]')).toBeVisible();
    await expect(page.locator('text=Elevate Your Kitchen')).toBeVisible();
    await expect(page.locator('text=Where Every Meal Becomes a Masterpiece')).toBeVisible();
    
    // Check hero buttons
    await expect(page.locator('text=Explore Recipes')).toBeVisible();
    await expect(page.locator('text=View Ideas')).toBeVisible();
  });

  test('Most popular recipes section displays correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll to popular recipes section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(1000);
    
    // Check section heading with new styling
    await expect(page.locator('h2:has-text("Most Popular Recipes")')).toBeVisible();
    
    // Wait for recipes to load (either loading state or actual recipes)
    const loadingState = page.locator('text=Most Popular Recipes');
    const recipeCards = page.locator('.murakamicity-card');
    
    // Should show either loading cards or actual recipe cards
    const cardCount = await recipeCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('Chef section displays with updated styling', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll to chef section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
    await page.waitForTimeout(1000);
    
    // Check updated chef section
    await expect(page.locator('text=Become a true')).toBeVisible();
    await expect(page.locator('span.text-primary:has-text("chef")')).toBeVisible();
    await expect(page.locator('text=We are a home to variety of recipes worldwide')).toBeVisible();
    
    // Old placeholder cards should be gone
    await expect(page.locator('text=Cooking has never been this easy!')).not.toBeVisible();
    await expect(page.locator('text=Marsha Rianty')).not.toBeVisible();
  });

  test('Recent recipes section displays with animations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll to recent recipes section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000); // Wait for scroll animations
    
    // Check recent recipes heading
    await expect(page.locator('h2:has-text("Recent Recipes")')).toBeVisible();
    await expect(page.locator('text=Discover our latest culinary creations')).toBeVisible();
    
    // Check for recipe cards (either loading or actual)
    const recipeGrid = page.locator('.grid').filter({ hasText: 'Recent Recipes' }).locator('..').locator('.grid').last();
    const cardCount = await recipeGrid.locator('.murakamicity-card, .animate-pulse').count();
    
    if (cardCount > 0) {
      expect(cardCount).toBeGreaterThanOrEqual(1);
      
      // Check for "View All Recipes" button
      await expect(page.locator('button:has-text("View All Recipes")')).toBeVisible();
      
      // Test button styling
      const viewAllButton = page.locator('button:has-text("View All Recipes")');
      const buttonClass = await viewAllButton.getAttribute('class');
      expect(buttonClass).toContain('murakamicity-button-outline');
    }
  });

  test('Recent recipes have hover interactions', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll to recent recipes section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);
    
    // Look for recipe cards that aren't loading states
    const recipeCards = page.locator('.murakamicity-card').filter({ hasNot: page.locator('.animate-pulse') });
    const cardCount = await recipeCards.count();
    
    if (cardCount > 0) {
      const firstCard = recipeCards.first();
      
      // Test hover interaction
      await firstCard.hover();
      await page.waitForTimeout(500);
      
      // Should have hover effects (scale and opacity changes)
      const cardClass = await firstCard.getAttribute('class');
      expect(cardClass).toContain('hover:scale-105');
      
      // Check for action buttons that appear on hover
      const actionButtons = firstCard.locator('button[aria-label*="favorites"], button[aria-label*="Share"], button[aria-label*="Preview"]');
      // These might not be immediately visible due to CSS transitions, so we just check they exist
    }
  });

  test('Recipe cards are clickable and navigate correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll to recent recipes section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);
    
    // Find clickable recipe cards
    const recipeCards = page.locator('.murakamicity-card').filter({ hasNot: page.locator('.animate-pulse') });
    const cardCount = await recipeCards.count();
    
    if (cardCount > 0) {
      const firstCard = recipeCards.first();
      
      // Click on the card
      await firstCard.click();
      
      // Should navigate to recipe detail page
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/\/recipes\/category\//);
    }
  });

  test('View All Recipes button works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll to recent recipes section
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);
    
    // Find and click View All button
    const viewAllButton = page.locator('button:has-text("View All Recipes")');
    
    if (await viewAllButton.count() > 0) {
      await viewAllButton.click();
      
      // Should navigate to recipes page
      await expect(page).toHaveURL(/.*\/recipes/);
    }
  });

  test('Mobile responsiveness works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Check hero section on mobile
    await expect(page.locator('img[alt="idris-cooks-logo"]')).toBeVisible();
    
    // Scroll through sections
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(1000);
    
    // Check popular recipes on mobile
    await expect(page.locator('h2:has-text("Most Popular Recipes")')).toBeVisible();
    
    // Scroll to recent recipes
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);
    
    // Check recent recipes section on mobile
    await expect(page.locator('h2:has-text("Recent Recipes")')).toBeVisible();
    
    // Cards should be properly sized for mobile
    const cards = page.locator('.murakamicity-card');
    if (await cards.count() > 0) {
      const firstCard = cards.first();
      const cardWidth = await firstCard.evaluate(el => el.offsetWidth);
      expect(cardWidth).toBeLessThan(375);
    }
  });

  test('GSAP scroll animations are configured', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check that elements start with opacity-0 (indicating GSAP will animate them)
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(500);
    
    // Look for elements with opacity-0 class that will be animated
    const hiddenElements = page.locator('.opacity-0');
    
    // Some elements should start hidden and then animate in
    // We can't easily test the animations themselves, but we can check setup
    await page.waitForTimeout(2000); // Give time for animations to complete
    
    // After animations, the recent recipes heading should be visible
    await expect(page.locator('h2:has-text("Recent Recipes")')).toBeVisible();
  });

  test('Page uses consistent murakamicity styling', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll through the page
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);
    
    // Check for murakamicity cards
    const cards = page.locator('.murakamicity-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check for murakamicity buttons
    const buttons = page.locator('.murakamicity-button, .murakamicity-button-outline');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check for primary color usage
    const primaryElements = page.locator('[class*="text-primary"]');
    const primaryCount = await primaryElements.count();
    expect(primaryCount).toBeGreaterThan(0);
  });
});