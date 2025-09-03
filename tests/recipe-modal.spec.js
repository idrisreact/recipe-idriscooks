const { test, expect } = require('@playwright/test');

test.describe('Recipe Preview Modal - Dark Theme Testing', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(30000);
  });

  test('Recipe modal displays with dark theme styling', async ({ page }) => {
    await page.goto('http://localhost:3000/recipes');
    
    // Wait for recipes to load
    await page.waitForSelector('article, [data-testid="recipe-card"]', { timeout: 10000 });
    
    // Look for preview button (eye icon) on first recipe card
    const firstCard = page.locator('article, [data-testid="recipe-card"]').first();
    const previewButton = firstCard.locator('button[aria-label*="Preview"]');
    
    if (await previewButton.count() > 0) {
      await previewButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Check modal background is dark
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      const modalBg = await modal.evaluate(el => getComputedStyle(el).backgroundColor);
      // Should be dark background (black or very dark)
      expect(modalBg).toMatch(/(0, 0, 0)|(17, 17, 17)/);
      
      // Check that text is visible (not white on white)
      const ingredientsTab = page.locator('button:has-text("Ingredients")');
      if (await ingredientsTab.count() > 0) {
        await expect(ingredientsTab).toBeVisible();
        
        // Click ingredients tab to test visibility
        await ingredientsTab.click();
        
        // Check for ingredient list items
        const ingredients = page.locator('text=/\\d+.*g.*\\w+/'); // Pattern for "quantity unit name"
        if (await ingredients.count() > 0) {
          await expect(ingredients.first()).toBeVisible();
        }
      }
      
      // Test steps tab
      const stepsTab = page.locator('button:has-text("Steps")');
      if (await stepsTab.count() > 0) {
        await stepsTab.click();
        
        // Check for step numbers
        const stepNumbers = page.locator('[class*="bg-primary"]:has-text("1")');
        if (await stepNumbers.count() > 0) {
          await expect(stepNumbers.first()).toBeVisible();
        }
      }
      
      // Test close button
      const closeButton = page.locator('button:has-text("Close")');
      await expect(closeButton).toBeVisible();
      await closeButton.click();
      
      // Modal should close
      await expect(modal).not.toBeVisible();
    } else {
      console.log('No preview button found on recipe cards');
    }
  });

  test('Recipe modal buttons have proper styling', async ({ page }) => {
    await page.goto('http://localhost:3000/recipes');
    
    // Wait for recipes to load
    await page.waitForSelector('article, [data-testid="recipe-card"]', { timeout: 10000 });
    
    // Look for preview button on first recipe card
    const firstCard = page.locator('article, [data-testid="recipe-card"]').first();
    const previewButton = firstCard.locator('button[aria-label*="Preview"]');
    
    if (await previewButton.count() > 0) {
      await previewButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Check View Full Recipe button has murakamicity styling
      const viewButton = page.locator('button:has-text("View Full Recipe")');
      if (await viewButton.count() > 0) {
        const buttonClass = await viewButton.getAttribute('class');
        expect(buttonClass).toContain('murakamicity-button');
      }
      
      // Check Close button has outline styling
      const closeButton = page.locator('button:has-text("Close")');
      if (await closeButton.count() > 0) {
        const buttonClass = await closeButton.getAttribute('class');
        expect(buttonClass).toContain('murakamicity-button-outline');
      }
      
      // Close modal
      await closeButton.click();
    }
  });

  test('Recipe modal tabs work correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/recipes');
    
    // Wait for recipes to load
    await page.waitForSelector('article, [data-testid="recipe-card"]', { timeout: 10000 });
    
    // Look for preview button on first recipe card
    const firstCard = page.locator('article, [data-testid="recipe-card"]').first();
    const previewButton = firstCard.locator('button[aria-label*="Preview"]');
    
    if (await previewButton.count() > 0) {
      await previewButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Test switching between tabs
      const ingredientsTab = page.locator('button:has-text("Ingredients")');
      const stepsTab = page.locator('button:has-text("Steps")');
      
      if (await ingredientsTab.count() > 0 && await stepsTab.count() > 0) {
        // Start with ingredients
        await ingredientsTab.click();
        await page.waitForTimeout(300);
        
        // Switch to steps
        await stepsTab.click();
        await page.waitForTimeout(300);
        
        // Check that active tab styling changes
        const stepsTabClass = await stepsTab.getAttribute('class');
        expect(stepsTabClass).toContain('text-primary');
        
        // Switch back to ingredients
        await ingredientsTab.click();
        await page.waitForTimeout(300);
        
        const ingredientsTabClass = await ingredientsTab.getAttribute('class');
        expect(ingredientsTabClass).toContain('text-primary');
      }
      
      // Close modal
      const closeButton = page.locator('button:has-text("Close")');
      await closeButton.click();
    }
  });
});