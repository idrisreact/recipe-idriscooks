// Mock Auth Session
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  },
  session: {
    token: 'mock-token',
    expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
  },
};

// Mock Recipe
export const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  slug: 'test-recipe',
  description: 'A delicious test recipe',
  image: '/images/test-recipe.jpg',
  prepTime: '15 mins',
  cookTime: '30 mins',
  servings: 4,
  difficulty: 'Medium',
  category: 'Main Course',
  tags: ['vegetarian', 'healthy'],
  ingredients: [
    { name: 'Ingredient 1', amount: '2 cups' },
    { name: 'Ingredient 2', amount: '1 tbsp' },
  ],
  instructions: [
    'Step 1: Do something',
    'Step 2: Do something else',
    'Step 3: Finish',
  ],
  createdAt: new Date('2024-01-01'),
};

// Mock Stripe Checkout Session
export const mockStripeCheckoutSession = {
  id: 'cs_test_123',
  url: 'https://checkout.stripe.com/test',
  amount_total: 1000,
  currency: 'gbp',
  customer_email: 'test@example.com',
  payment_status: 'unpaid',
  status: 'open',
};

// Mock Fetch Response Helper
export function mockFetchSuccess<T>(data: T) {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
    status: 200,
  });
}

export function mockFetchError(status = 500, message = 'Internal Server Error') {
  return jest.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: message }),
    status,
  });
}

// Mock useAuth Hook
export const mockUseAuth = (authenticated = false) => ({
  session: authenticated ? mockSession : null,
  loading: false,
});

// Mock Router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};
