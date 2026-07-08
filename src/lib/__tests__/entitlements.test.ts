import { PRICING } from '@/src/config/pricing';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

// Chainable db mock: select results are keyed by the table passed to .from(),
// so consumption order doesn't matter.
jest.mock('@/src/db', () => {
  const resultsByTable = new Map<unknown, unknown[][]>();

  const chain = () => {
    const c: Record<string, unknown> = {};
    let table: unknown = null;
    c.from = jest.fn((t: unknown) => {
      table = t;
      return c;
    });
    for (const method of ['where', 'limit', 'orderBy', 'values', 'set', 'returning']) {
      c[method] = jest.fn(() => c);
    }
    c.then = (resolve: (value: unknown) => void, reject: (reason?: unknown) => void) =>
      Promise.resolve(resultsByTable.get(table)?.shift() ?? []).then(resolve, reject);
    return c;
  };

  return {
    db: {
      select: jest.fn(() => chain()),
      insert: jest.fn(() => chain()),
      update: jest.fn(() => chain()),
    },
    __setResult: (table: unknown, result: unknown[]) => {
      const queue = resultsByTable.get(table) ?? [];
      queue.push(result);
      resultsByTable.set(table, queue);
    },
    __clearResults: () => resultsByTable.clear(),
  };
});

import { getEntitlements, canPerformAction, enforceLimit } from '../entitlements';
import { premiumFeatures } from '@/src/db/schemas/premium-features.schema';
import { userUsage } from '@/src/db/schemas';
import { favoriteRecipes } from '@/src/db/schemas/favorite-recipes.schema';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dbModule = require('@/src/db');

const queueFeatures = (
  features: Array<{ feature: string; expiresAt?: Date | null; metadata?: unknown }>
) =>
  dbModule.__setResult(
    premiumFeatures,
    features.map((f) => ({ metadata: {}, expiresAt: null, ...f }))
  );

const queueUsage = (usage: Partial<Record<string, number>> | null) =>
  dbModule.__setResult(userUsage, usage ? [usage] : []);

const queueFavoritesCount = (count: number) => dbModule.__setResult(favoriteRecipes, [{ count }]);

beforeEach(() => {
  dbModule.__clearResults();
  jest.clearAllMocks();
});

describe('getEntitlements', () => {
  it('reports lifetime access when a recipe_access feature exists', async () => {
    queueFeatures([{ feature: 'recipe_access' }]);
    queueUsage(null);

    const entitlements = await getEntitlements('user-1');

    expect(entitlements.hasRecipeAccess).toBe(true);
    expect(entitlements.hasPdfAccess).toBe(false);
    expect(entitlements.limits.recipeViewsPerMonth).toBe(PRICING.freeTier.recipeViewsPerMonth);
  });

  it('ignores expired features', async () => {
    queueFeatures([{ feature: 'recipe_access', expiresAt: new Date('2020-01-01') }]);
    queueUsage(null);

    const entitlements = await getEntitlements('user-1');

    expect(entitlements.hasRecipeAccess).toBe(false);
  });

  it('reads the pdf bundle size from metadata', async () => {
    queueFeatures([{ feature: 'pdf_downloads', metadata: { recipeCount: 10 } }]);
    queueUsage(null);

    const entitlements = await getEntitlements('user-1');

    expect(entitlements.hasPdfAccess).toBe(true);
    expect(entitlements.pdfRecipeLimit).toBe(10);
  });
});

describe('canPerformAction — viewRecipe', () => {
  it('always allows users with lifetime access', async () => {
    queueFeatures([{ feature: 'recipe_access' }]);
    queueUsage({ recipeViews: 999 });

    const check = await canPerformAction('user-1', 'viewRecipe');

    expect(check.allowed).toBe(true);
  });

  it('allows free users under the monthly limit with remaining count', async () => {
    queueFeatures([]);
    queueUsage({ recipeViews: 1 });

    const check = await canPerformAction('user-1', 'viewRecipe');

    expect(check.allowed).toBe(true);
    expect(check.remaining).toBe(PRICING.freeTier.recipeViewsPerMonth - 1);
  });

  it('blocks free users at the monthly limit', async () => {
    queueFeatures([]);
    queueUsage({ recipeViews: PRICING.freeTier.recipeViewsPerMonth });

    const check = await canPerformAction('user-1', 'viewRecipe');

    expect(check.allowed).toBe(false);
    expect(check.remaining).toBe(0);
    expect(check.reason).toContain('free recipe views');
  });
});

describe('canPerformAction — addFavorite', () => {
  it('allows lifetime access users without counting favorites', async () => {
    queueFeatures([{ feature: 'recipe_access' }]);
    queueUsage(null);

    const check = await canPerformAction('user-1', 'addFavorite');

    expect(check.allowed).toBe(true);
  });

  it('blocks free users at the favorites cap using a live row count', async () => {
    queueFeatures([]);
    queueUsage(null);
    queueFavoritesCount(PRICING.freeTier.favoritesLimit);

    const check = await canPerformAction('user-1', 'addFavorite');

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain(`${PRICING.freeTier.favoritesLimit}`);
  });

  it('allows free users under the favorites cap', async () => {
    queueFeatures([]);
    queueUsage(null);
    queueFavoritesCount(2);

    const check = await canPerformAction('user-1', 'addFavorite');

    expect(check.allowed).toBe(true);
    expect(check.remaining).toBe(PRICING.freeTier.favoritesLimit - 2);
  });
});

describe('canPerformAction — exportPdf', () => {
  it('blocks users without the pdf_downloads feature', async () => {
    queueFeatures([]);
    queueUsage(null);

    const check = await canPerformAction('user-1', 'exportPdf');

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('paid add-on');
  });

  it('allows purchasers and reports their bundle size', async () => {
    queueFeatures([{ feature: 'pdf_downloads', metadata: { recipeCount: 5 } }]);
    queueUsage(null);

    const check = await canPerformAction('user-1', 'exportPdf');

    expect(check.allowed).toBe(true);
    expect(check.remaining).toBe(5);
  });
});

describe('enforceLimit', () => {
  it('returns null when the action is allowed', async () => {
    queueFeatures([{ feature: 'recipe_access' }]);
    queueUsage(null);

    const blocked = await enforceLimit('user-1', 'viewRecipe');

    expect(blocked).toBeNull();
  });

  it('returns a 402 with an upgrade URL when blocked', async () => {
    queueFeatures([]);
    queueUsage({ recipeViews: PRICING.freeTier.recipeViewsPerMonth });

    const blocked = (await enforceLimit('user-1', 'viewRecipe')) as unknown as {
      status: number;
      body: { upgradeUrl: string };
    };

    expect(blocked).not.toBeNull();
    expect(blocked.status).toBe(402);
    expect(blocked.body.upgradeUrl).toBe('/pricing');
  });
});
