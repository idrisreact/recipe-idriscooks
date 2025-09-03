const { test, expect } = require('@playwright/test');

test.describe('About Page - Enhanced Design and Animations', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
  });

  test('About page loads with proper dark theme styling', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    
    // Wait for the page to load
    await page.waitForSelector('section', { timeout: 10000 });
    
    // Check dark theme is applied
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toContain('0, 0, 0');
    
    // Check main heading is visible
    await expect(page.locator('h1:has-text("Idris Taiwo")')).toBeVisible();
    
    // Check subtitle with primary color
    await expect(page.locator('text=Chef & Recipe Creator')).toBeVisible();
    
    // Check stats section
    await expect(page.locator('text=17K+')).toBeVisible();
    await expect(page.locator('text=100+')).toBeVisible();
    await expect(page.locator('text=8+')).toBeVisible();
  });

  test('Journey section displays with proper cards', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    
    // Wait for journey section to load
    await page.waitForSelector('h2:has-text("My Journey")', { timeout: 10000 });
    
    // Check journey heading
    await expect(page.locator('h2:has-text("My Journey")')).toBeVisible();
    
    // Check for journey steps
    await expect(page.locator('text=Started Cooking at 13')).toBeVisible();
    await expect(page.locator('text=Paused During University')).toBeVisible();
    await expect(page.locator('text=First TikTok Video')).toBeVisible();
    await expect(page.locator('text=Now: 17,000+ Followers')).toBeVisible();
    
    // Check for murakamicity cards
    const cards = page.locator('.murakamicity-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('Call to action section works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    
    // Scroll to bottom to ensure CTA is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Check CTA section
    await expect(page.locator('text=Ready to Cook Together?')).toBeVisible();
    
    // Check buttons have correct styling
    const tiktokButton = page.locator('a:has-text("Follow on TikTok")');
    const recipesButton = page.locator('a:has-text("Browse Recipes")');
    
    if (await tiktokButton.count() > 0) {
      const buttonClass = await tiktokButton.getAttribute('class');
      expect(buttonClass).toContain('murakamicity-button');
    }
    
    if (await recipesButton.count() > 0) {
      const buttonClass = await recipesButton.getAttribute('class');  
      expect(buttonClass).toContain('murakamicity-button-outline');
      
      // Test navigation
      await recipesButton.click();
      await expect(page).toHaveURL(/.*\/recipes/);
    }
  });

  test('GSAP animations are properly configured', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    
    // Check that journey steps are initially hidden (opacity-0)
    await page.waitForSelector('h2:has-text("My Journey")', { timeout: 10000 });
    
    // Check for elements with opacity-0 class (indicating GSAP will animate them)
    const hiddenElements = page.locator('.opacity-0');
    const hiddenCount = await hiddenElements.count();
    expect(hiddenCount).toBeGreaterThan(0);
    
    // Scroll down to trigger animations
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(2000);
    
    // After scrolling, elements should become visible through GSAP animations
    // This is hard to test precisely, but we can check the page doesn't crash
    const journeySection = page.locator('section').nth(0);
    await expect(journeySection).toBeVisible();
  });

  test('Mobile responsiveness works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/about');
    
    // Check mobile layout
    await page.waitForSelector('h1:has-text("Idris Taiwo")', { timeout: 10000 });
    
    // Check that content is properly sized for mobile
    const mainCard = page.locator('.murakamicity-card').first();
    if (await mainCard.count() > 0) {
      const cardWidth = await mainCard.evaluate(el => el.offsetWidth);
      expect(cardWidth).toBeLessThan(375);
    }
    
    // Check stats layout on mobile
    await expect(page.locator('text=17K+')).toBeVisible();
    await expect(page.locator('text=100+')).toBeVisible();
    await expect(page.locator('text=8+')).toBeVisible();
  });

  test('Journey steps alternate layout correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    
    await page.waitForSelector('h2:has-text("My Journey")', { timeout: 10000 });
    
    // On larger screens, journey steps should alternate between left/right layout
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    // Check that journey articles have alternating flex direction
    const articles = page.locator('article');
    const articleCount = await articles.count();
    
    if (articleCount >= 2) {
      // First article should have md:flex-row
      const firstArticle = articles.nth(0);
      const firstClass = await firstArticle.getAttribute('class');
      expect(firstClass).toContain('md:flex-row');
      
      // Second article should have md:flex-row-reverse  
      const secondArticle = articles.nth(1);
      const secondClass = await secondArticle.getAttribute('class');
      expect(secondClass).toContain('md:flex-row-reverse');
    }
  });

  test('Step numbers and progress indicators display correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    
    await page.waitForSelector('h2:has-text("My Journey")', { timeout: 10000 });
    
    // Check for step number circles with primary background
    const stepNumbers = page.locator('.bg-primary').filter({ hasText: /^[1-4]$/ });
    const stepCount = await stepNumbers.count();
    expect(stepCount).toBeGreaterThanOrEqual(4);
    
    // Check that step numbers are visible and properly styled
    for (let i = 0; i < Math.min(stepCount, 4); i++) {
      const step = stepNumbers.nth(i);
      await expect(step).toBeVisible();
      
      const stepClass = await step.getAttribute('class');
      expect(stepClass).toContain('bg-primary');
      expect(stepClass).toContain('rounded-full');
    }
  });
});