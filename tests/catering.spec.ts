import { test, expect } from '@playwright/test';

test.describe('Catering page', () => {
  test('renders the hero, services and inquiry form', async ({ page }) => {
    await page.goto('/catering');

    await expect(page.locator('h1')).toContainText('Your table');

    // Scroll-revealed section: it stays visibility:hidden until scrolled into
    // view, so locate by CSS (role queries skip hidden elements) and scroll.
    const services = page.locator('h2', { hasText: 'Three ways to set the table.' });
    await services.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(services).toBeVisible();

    await expect(page.locator('#inquire')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send inquiry' })).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/catering');

    await page.getByRole('button', { name: 'Send inquiry' }).click();

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });
});

test.describe('Catering API', () => {
  test('accepts a valid inquiry', async ({ request }) => {
    const response = await request.post('/api/catering', {
      data: {
        name: 'E2E Test',
        email: 'e2e-catering@test.idriscooks.com',
        eventType: 'party',
        eventDate: '2030-06-01',
        guestCount: 20,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.id).toBeTruthy();
  });

  test('rejects a past event date', async ({ request }) => {
    const response = await request.post('/api/catering', {
      data: {
        name: 'E2E Test',
        email: 'e2e-catering@test.idriscooks.com',
        eventType: 'party',
        eventDate: '2020-01-01',
        guestCount: 20,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('rejects missing required fields', async ({ request }) => {
    const response = await request.post('/api/catering', {
      data: { name: 'E2E Test' },
    });

    expect(response.status()).toBe(400);
  });

  test('inquiry listing requires admin', async ({ request }) => {
    const response = await request.get('/api/catering');

    expect(response.status()).toBe(401);
  });
});
