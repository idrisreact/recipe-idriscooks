# Testing Guide

## Overview

This project uses a comprehensive testing strategy with multiple testing layers:

- **Unit Tests**: Jest + React Testing Library (components, hooks, utilities)
- **E2E Tests**: Playwright (end-to-end user flows)
- **Component Development**: Storybook (visual testing & documentation)

## Test Scripts

### Unit & Integration Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Type check
npm run type-check
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run Stripe-specific E2E tests
npm run test:e2e:stripe

# Open Playwright UI (interactive mode)
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

### Run All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Project Structure

```
├── src/
│   ├── components/
│   │   └── __tests__/          # Component tests
│   ├── hooks/
│   │   └── __tests__/          # Hook tests
│   ├── config/
│   │   └── __tests__/          # Configuration tests
│   └── test-utils/             # Shared test utilities
│       ├── index.tsx           # Custom render with providers
│       └── mocks.ts            # Mock data & functions
├── app/
│   └── api/
│       └── **/
│           └── __tests__/      # API route tests
├── tests/                      # Playwright E2E tests
├── jest.config.ts              # Jest configuration
└── jest.setup.ts               # Jest global setup
```

## Writing Tests

### Component Tests

Example: Testing a button component

```typescript
import { render, screen, fireEvent } from '@/src/test-utils';
import { MyButton } from '../my-button';

describe('MyButton', () => {
  it('should render with text', () => {
    render(<MyButton>Click me</MyButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MyButton onClick={handleClick}>Click me</MyButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<MyButton loading>Click me</MyButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Tests

Example: Testing a custom hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../use-my-hook';

describe('useMyHook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMyHook());

    expect(result.current.value).toBe(0);
  });

  it('should increment value', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.increment();
    });

    expect(result.current.value).toBe(1);
  });
});
```

### API Route Tests

Example: Testing an API endpoint

```typescript
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/example', () => {
  it('should return 200 with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/example', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
  });

  it('should return 400 with invalid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/example', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

## Mocking

### Mock Data

Use the shared mock data from `src/test-utils/mocks.ts`:

```typescript
import { mockSession, mockRecipe, mockFetchSuccess } from '@/src/test-utils/mocks';

// Use in tests
const response = mockFetchSuccess(mockRecipe);
```

### Mock External Dependencies

```typescript
// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock authentication
jest.mock('@/src/components/auth/auth-components', () => ({
  useAuth: jest.fn(() => ({
    session: mockSession,
    loading: false,
  })),
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    },
  }));
});
```

## Coverage Goals

Current coverage thresholds:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

Run `npm run test:coverage` to see detailed coverage report.

Coverage reports are generated in the `coverage/` directory (git ignored).

## Best Practices

### 1. Test Behavior, Not Implementation
✅ Good: Test what the user sees and does
```typescript
it('should show error message when form is invalid', () => {
  render(<LoginForm />);
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});
```

❌ Bad: Test internal state
```typescript
it('should set error state', () => {
  const { result } = renderHook(() => useForm());
  expect(result.current.errors.email).toBe('Email is required');
});
```

### 2. Use Descriptive Test Names
✅ Good: Clear what is being tested
```typescript
it('should redirect to sign-up when user is not authenticated', () => {
  // ...
});
```

❌ Bad: Vague test name
```typescript
it('should work', () => {
  // ...
});
```

### 3. Arrange, Act, Assert (AAA) Pattern
```typescript
it('should add item to cart', () => {
  // Arrange: Set up test data and mocks
  const item = { id: 1, name: 'Product' };
  render(<CartButton item={item} />);

  // Act: Perform the action
  fireEvent.click(screen.getByRole('button'));

  // Assert: Verify the result
  expect(screen.getByText('Added to cart')).toBeInTheDocument();
});
```

### 4. Don't Test Third-Party Libraries
Focus on testing YOUR code, not libraries you're using.

### 5. Keep Tests Fast
- Avoid unnecessary waits
- Mock external API calls
- Use fake timers when testing delays

```typescript
jest.useFakeTimers();
// ... trigger action with delay
jest.advanceTimersByTime(2000);
jest.useRealTimers();
```

## Continuous Integration

Tests should run:
1. Before every commit (via Husky pre-commit hook)
2. On every pull request (via GitHub Actions)
3. Before deploying to production

## Debugging Tests

### Debug Single Test
```bash
# Run specific test file
npm test -- recipe-access-button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should redirect"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## Common Issues

### Issue: Tests failing with "Cannot find module"
**Solution**: Check your module aliases in `jest.config.ts` match your `tsconfig.json`

### Issue: Async tests timing out
**Solution**: Increase timeout or use `waitFor` properly
```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 5000 });
```

### Issue: "act(...)" warnings
**Solution**: Wrap state updates in `act()` or use `waitFor`
```typescript
await waitFor(() => {
  expect(result.current.data).toBeDefined();
});
```

## Next Steps

1. **Expand Coverage**: Add tests for remaining components and API routes
2. **Visual Regression**: Consider adding visual regression tests with Percy or Chromatic
3. **Performance Tests**: Add Lighthouse CI for performance testing
4. **Accessibility Tests**: Expand a11y testing with jest-axe
5. **API Integration Tests**: Add tests with real database (test environment)

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
