'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/src/components/ui/Card';

export default function DevLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const loginAsTestUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dev/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'dev-user-001',
          email: 'dev@example.com',
          name: 'Dev Test User',
        }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Failed to login as test user');
      }
    } catch (error) {
      console.error('Error logging in as test user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card
      variant="basic"
      content={
        <div className="text-center space-y-3">
          <h3 className="font-medium text-orange-800">Development Mode</h3>
          <p className="text-sm text-orange-700">
            Sign in as the test user with Premium subscription to test subscription features
          </p>
          <Button
            onClick={loginAsTestUser}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
            size="sm"
          >
            {isLoading ? 'Signing In...' : 'Sign In as Test User'}
          </Button>
          <p className="text-xs text-orange-600">Test User: dev@example.com (Premium Monthly)</p>
        </div>
      }
      className="p-4 border-orange-200 bg-orange-50"
    />
  );
}
