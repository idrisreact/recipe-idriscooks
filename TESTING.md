# Testing Documentation

This project uses Vitest for testing. The tests are organized into different categories and can be run using different commands.

## Test Commands

### All Tests
```bash
npm run test:run
```
Runs all tests including Storybook tests.

### API Tests Only
```bash
npm run test:api
```
Runs only the API route tests.

### Watch Mode for API Tests
```bash
npm run test:api:watch
```
Runs API tests in watch mode for development.

### Storybook Tests
```bash
npm run test
```
Runs Storybook tests in watch mode.

## Test Structure

### API Tests
Located in `app/api/topup/route.test.ts`

#### Test Coverage
The topup API route tests cover:

1. **Successful Top Up**
   - Valid amount and user ID
   - Correct balance calculation
   - Proper response format

2. **Input Validation**
   - Invalid top up amounts (0, 1, 15, 25, 100, -5)
   - Non-existent user IDs
   - Edge cases and boundary conditions

3. **Balance Accumulation**
   - Multiple top ups accumulate correctly
   - Balance state management between requests

4. **Response Format**
   - Correct HTTP status codes (200, 400, 404)
   - Proper JSON response structure
   - Error messages for invalid requests

#### Test Scenarios
- ✅ Valid top up amounts (5, 10, 20, 30)
- ✅ Invalid amounts (0, negative, too large)
- ✅ User authentication (valid vs invalid user IDs)
- ✅ Balance accumulation across multiple requests
- ✅ Error handling and response codes
- ✅ Edge cases and boundary conditions

## Running Specific Tests

To run a specific test file:
```bash
npx vitest run --config vitest.api.config.ts app/api/topup/route.test.ts
```

To run tests with coverage:
```bash
npx vitest run --config vitest.api.config.ts --coverage
```

## Test Configuration

- **API Tests**: `vitest.api.config.ts`
- **Storybook Tests**: `vitest.config.ts`

The API tests use Node.js environment and are configured to test Next.js API routes with proper mocking of NextResponse.

## Mocking Strategy

The tests use Vitest's mocking capabilities to:
- Mock `NextResponse` to capture and verify API responses
- Reset user state between tests to ensure isolation
- Test the actual business logic without external dependencies

## Adding New Tests

When adding new API routes, follow the same pattern:
1. Create a test file with `.test.ts` extension
2. Mock necessary dependencies
3. Test all success and error scenarios
4. Verify response formats and status codes
5. Test edge cases and boundary conditions 