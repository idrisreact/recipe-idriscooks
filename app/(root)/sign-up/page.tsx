'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { authClient } from '@/src/utils/auth-client';
import { useAuth } from '@/src/components/auth/auth-components';
import { Chrome, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  // Redirect to home if already logged in
  useEffect(() => {
    if (session && !loading) {
      router.push('/');
    }
  }, [session, loading, router]);

  const handleSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Idris Cooks
            </h1>
            <p className="text-gray-600">
              Sign up to access premium recipes and unlock exclusive features
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Access Premium Recipes</p>
                <p className="text-sm text-gray-600">Get full access to detailed recipes with step-by-step instructions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Save Favorites</p>
                <p className="text-sm text-gray-600">Keep track of your favorite recipes in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cooking Mode</p>
                <p className="text-sm text-gray-600">Interactive cooking experience with timers and step-by-step guidance</p>
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <Button
            onClick={handleSignUp}
            className="w-full bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all py-6 text-base font-semibold flex items-center justify-center gap-3"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </Button>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/refund-policy" className="underline hover:text-gray-700">
              Terms of Service
            </a>
          </p>

          {/* Back to Home */}
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
