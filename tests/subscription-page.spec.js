const { test, expect } = require('@playwright/test');

test.describe('Subscription Page - Simplified 2-Plan Design', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(30000);
  });

  test('Subscription page loads with proper dark theme styling', async ({ page }) => {
    await page.goto('http://localhost:3000/subscription');
    
    // Wait for the page to load
    await page.waitForSelector('.wrapper.page', { timeout: 10000 });
    
    // Check dark theme is applied
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toContain('0, 0, 0');
    
    // Check main heading is visible
    await expect(page.locator('h1:has-text("Choose Your Plan")')).toBeVisible();
    
    // Check subtitle
    await expect(page.locator('text=Simple pricing for amazing recipes')).toBeVisible();
  });

  test('Shows both Free and PDF Access plans', async ({ page }) => {
    await page.goto('http://localhost:3000/subscription');
    
    // Wait for plans to load
    await page.waitForSelector('.murakamicity-card', { timeout: 10000 });
    
    // Check Free plan
    await expect(page.locator('h3:has-text("Free")')).toBeVisible();
    await expect(page.locator('text=£0')).toBeVisible();
    await expect(page.locator('text=forever')).toBeVisible();
    
    // Check PDF Access plan
    await expect(page.locator('h3:has-text("PDF Access")')).toBeVisible();
    await expect(page.locator('span.text-4xl.font-bold:has-text("£19.99")')).toBeVisible();
    await expect(page.locator('button:has-text("Get PDF Access")')).toBeVisible();
    
    // Check "Most Popular" badge on PDF plan
    await expect(page.locator('text=Most Popular')).toBeVisible();
  });

  test('Current plan status displays correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/subscription');
    
    // Wait for status section to load
    await page.waitForSelector('h2:has-text("Current Plan")', { timeout: 10000 });
    
    // Check current plan heading
    await expect(page.locator('h2:has-text("Current Plan")')).toBeVisible();
    
    // For unauthenticated users, should show sign in prompt
    const signInPrompt = page.locator('text=Sign in to view your plan');
    if (await signInPrompt.count() > 0) {
      await expect(signInPrompt).toBeVisible();
    } else {
      // If authenticated, should show plan info
      await expect(page.locator('text=Free Plan')).toBeVisible();
      await expect(page.locator('text=Active')).toBeVisible();
    }
  });

  test('Features comparison table works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/subscription');
    
    // Wait for features table to load
    await page.waitForSelector('h2:has-text("What\'s Included")', { timeout: 10000 });
    
    // Check table heading
    await expect(page.locator('h2:has-text("What\'s Included")')).toBeVisible();
    
    // Check column headers
    await expect(page.locator('th:has-text("Free")')).toBeVisible();
    await expect(page.locator('th:has-text("PDF Access")')).toBeVisible();
    await expect(page.locator('text=£19.99 one-time')).toBeVisible();
    
    // Check some key features
    await expect(page.locator('table').locator('text=Browse all recipes').first()).toBeVisible();
    await expect(page.locator('table').locator('text=PDF recipe exports').first()).toBeVisible();
    await expect(page.locator('table').locator('text=Save favorite recipes').first()).toBeVisible();
    
    // Check for check/x icons
    const checkIcons = page.locator('svg').filter({ hasText: /^$/ }); // Check icons
    const checkCount = await checkIcons.count();
    expect(checkCount).toBeGreaterThan(0);
  });

  test('PDF Access plan has proper highlighting', async ({ page }) => {
    await page.goto('http://localhost:3000/subscription');
    
    // Wait for plans to load
    await page.waitForSelector('.murakamicity-card', { timeout: 10000 });
    
    // Check that PDF plan has special styling
    const pdfCard = page.locator('.murakamicity-card').filter({ hasText: 'PDF Access' }).first();
    
    // Should have ring styling for popular plan
    const cardClass = await pdfCard.getAttribute('class');
    expect(cardClass).toContain('ring-primary');
    
    // Should have "Most Popular" badge
    await expect(page.locator('text=Most Popular')).toBeVisible();
    
    // Should have star icon in badge
    const starIcon = page.locator('[class*="lucide-star"]');
    await expect(starIcon.first()).toBeVisible();
  });

  test('Plan buttons have correct styling and behavior', async ({ page }) => {
    await page.goto('http://localhost:3000/subscription');
    
    // Wait for plans to load
    await page.waitForSelector('.murakamicity-card', { timeout: 10000 });
    
    // Check Free plan button (should show "Current Plan" if on free)
    const freeButton = page.locator('button:has-text("Stay Free")');
    if (await freeButton.count() > 0) {
      const buttonClass = await freeButton.getAttribute('class');
      expect(buttonClass).toContain('murakamicity-button-outline');
    }
    
    // Check PDF Access button
    const pdfButton = page.locator('button:has-text("Get PDF Access")');
    if (await pdfButton.count() > 0) {
      const buttonClass = await pdfButton.getAttribute('class');
      expect(buttonClass).toContain('murakamicity-button');
      
      // Test click behavior (should show alert for demo)
      await pdfButton.click();
      
      // Should show loading state briefly
      await page.waitForTimeout(500);
      
      // In a real implementation, this would redirect to payment
      // For now, we just check it doesn't crash
    }
  });

  test('About PDF Access section displays correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/subscription');
    
    // Scroll to bottom to ensure section is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Check "About PDF Access" section
    await expect(page.locator('text=About PDF Access')).toBeVisible();
    await expect(page.locator('text=Get lifetime access to download any recipe')).toBeVisible();
    await expect(page.locator('text=One-time payment, no subscriptions')).toBeVisible();
    
    // Check FileText icon
    const fileIcon = page.locator('[class*="lucide-file-text"]');
    await expect(fileIcon.first()).toBeVisible();
  });

  test('Mobile responsiveness works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/subscription');
    
    // Check mobile layout
    await page.waitForSelector('h1:has-text("Choose Your Plan")', { timeout: 10000 });
    
    // Plans should stack vertically on mobile
    const planCards = page.locator('.murakamicity-card');
    const cardCount = await planCards.count();
    
    if (cardCount >= 2) {
      // Check that cards are properly sized for mobile
      const firstCard = planCards.first();
      const cardWidth = await firstCard.evaluate(el => el.offsetWidth);
      expect(cardWidth).toBeLessThan(375);
    }
    
    // Check table is horizontally scrollable on mobile
    const table = page.locator('table');
    if (await table.count() > 0) {
      const tableContainer = page.locator('.overflow-x-auto');
      await expect(tableContainer).toBeVisible();
    }
  });

  test('Page uses consistent murakamicity styling', async ({ page }) => {
    await page.goto('http://localhost:3000/subscription');
    
    await page.waitForSelector('.wrapper.page', { timeout: 10000 });
    
    // Check for murakamicity cards
    const cards = page.locator('.murakamicity-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check for murakamicity buttons
    const primaryButtons = page.locator('.murakamicity-button');
    const outlineButtons = page.locator('.murakamicity-button-outline');
    
    const totalButtons = (await primaryButtons.count()) + (await outlineButtons.count());
    expect(totalButtons).toBeGreaterThan(0);
    
    // Check primary color usage
    const primaryElements = page.locator('[class*="text-primary"]');
    const primaryCount = await primaryElements.count();
    expect(primaryCount).toBeGreaterThan(0);
  });
});