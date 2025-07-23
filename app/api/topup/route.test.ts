import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock NextResponse before importing the route
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
    },
  };
});

import { POST, user } from './route';
import { NextResponse } from 'next/server';

describe('TopUp API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the user balance to 0 before each test
    user.balance = 0;
  });

  describe('POST /api/topup', () => {
    it('should successfully top up with valid amount and user', async () => {
      const requestBody = {
        amount: 10,
        userId: '1',
      };

      const request = new NextRequest('http://localhost:3000/api/topup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Top up successful', balance: 10 },
        { status: 200 }
      );
    });

    it('should reject invalid top up amount', async () => {
      const requestBody = {
        amount: 15, // Invalid amount
        userId: '1',
      };

      const request = new NextRequest('http://localhost:3000/api/topup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Invalid top up amount' },
        { status: 400 }
      );
    });

    it('should reject non-existent user', async () => {
      const requestBody = {
        amount: 10,
        userId: '999', // Non-existent user
      };

      const request = new NextRequest('http://localhost:3000/api/topup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'User not found' },
        { status: 404 }
      );
    });

    it('should accept all valid top up amounts', async () => {
      const validAmounts = [5, 10, 20, 30];
      let expectedBalance = 0;

      for (const amount of validAmounts) {
        expectedBalance += amount;
        
        const requestBody = {
          amount,
          userId: '1',
        };

        const request = new NextRequest('http://localhost:3000/api/topup', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        await POST(request);

        expect(NextResponse.json).toHaveBeenCalledWith(
          { message: 'Top up successful', balance: expectedBalance },
          { status: 200 }
        );
      }
    });

    it('should accumulate balance correctly with multiple top ups', async () => {
      const topUps = [5, 10, 20];
      let expectedBalance = 0;

      for (const amount of topUps) {
        expectedBalance += amount;
        
        const requestBody = {
          amount,
          userId: '1',
        };

        const request = new NextRequest('http://localhost:3000/api/topup', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        await POST(request);

        expect(NextResponse.json).toHaveBeenCalledWith(
          { message: 'Top up successful', balance: expectedBalance },
          { status: 200 }
        );
      }
    });

    it('should handle edge case of zero amount (should be invalid)', async () => {
      const requestBody = {
        amount: 0,
        userId: '1',
      };

      const request = new NextRequest('http://localhost:3000/api/topup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Invalid top up amount' },
        { status: 400 }
      );
    });

    it('should handle negative amounts (should be invalid)', async () => {
      const requestBody = {
        amount: -10,
        userId: '1',
      };

      const request = new NextRequest('http://localhost:3000/api/topup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Invalid top up amount' },
        { status: 400 }
      );
    });

    it('should handle very large amounts (should be invalid)', async () => {
      const requestBody = {
        amount: 100,
        userId: '1',
      };

      const request = new NextRequest('http://localhost:3000/api/topup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Invalid top up amount' },
        { status: 400 }
      );
    });
  });

  describe('validateTopUpAmount function (integration tests)', () => {
    it('should validate correct amounts through API calls', async () => {
      const validAmounts = [5, 10, 20, 30];

      for (const amount of validAmounts) {
        const requestBody = {
          amount,
          userId: '1',
        };

        const request = new NextRequest('http://localhost:3000/api/topup', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        await POST(request);

        // Should succeed with valid amounts
        expect(NextResponse.json).toHaveBeenCalledWith(
          { message: 'Top up successful', balance: expect.any(Number) },
          { status: 200 }
        );
      }
    });

    it('should reject invalid amounts through API calls', async () => {
      const invalidAmounts = [0, 1, 15, 25, 100, -5];

      for (const amount of invalidAmounts) {
        const requestBody = {
          amount,
          userId: '1',
        };

        const request = new NextRequest('http://localhost:3000/api/topup', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        await POST(request);

        // Should fail with invalid amounts
        expect(NextResponse.json).toHaveBeenCalledWith(
          { message: 'Invalid top up amount' },
          { status: 400 }
        );
      }
    });
  });
}); 