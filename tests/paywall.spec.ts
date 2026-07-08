import { test, expect } from '@playwright/test';

test.describe('Paywall enforcement', () => {
  test('anonymous recipe API requests get stripped content', async ({ request }) => {
    const listResponse = await request.get('/api/recipes?limit=1');
    expect(listResponse.ok()).toBeTruthy();
    const list = await listResponse.json();
    const firstRecipe = Array.isArray(list) ? list[0] : list.recipes?.[0];
    test.skip(!firstRecipe, 'No recipes seeded');

    const response = await request.get(`/api/recipes/${firstRecipe.id}`);
    expect(response.ok()).toBeTruthy();

    const recipe = await response.json();
    expect(recipe.restricted).toBe(true);
    expect(recipe.ingredients).toBeNull();
    expect(recipe.steps).toBeNull();
    expect(recipe.title).toBeTruthy();
  });

  test('favorites POST requires authentication', async ({ request }) => {
    const response = await request.post('/api/favorites', {
      data: { recipeId: 1 },
    });

    expect(response.status()).toBe(401);
  });

  test('admin PDF grant endpoint rejects anonymous requests', async ({ request }) => {
    const response = await request.post('/api/admin/grant-pdf-access', {
      data: { userEmail: 'attacker@example.com' },
    });

    expect(response.status()).toBe(401);
  });

  test('PDF generation requires authentication', async ({ request }) => {
    const response = await request.post('/api/pdf/generate', {
      data: { recipes: [], title: 'Test' },
    });

    expect([400, 401]).toContain(response.status());
  });
});

test.describe('Billing portal', () => {
  test('redirects anonymous form posts to sign-in', async ({ request }) => {
    const response = await request.post('/api/billing/portal', {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(303);
    expect(response.headers()['location']).toContain('/sign-in');
  });
});
