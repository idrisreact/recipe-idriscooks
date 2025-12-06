'use client';

import { useEffect } from 'react';
import { useAuth } from '@/src/components/auth/auth-components';
import { authClient } from '@/src/utils/auth-client';
import toast from 'react-hot-toast';
import { Chrome } from 'lucide-react';

export function WelcomeToast() {
  const { session, loading } = useAuth();

  useEffect(() => {
    // Don't show if still loading or user is logged in
    if (loading || session) return;

    // Check if user has already seen the welcome toast in this session
    const hasSeenToast = sessionStorage.getItem('hasSeenWelcomeToast');
    if (hasSeenToast) return;

    // Show the toast after a short delay for better UX
    const timer = setTimeout(() => {
      toast(
        (t) => (
          <div className="flex items-start gap-3 max-w-md">
            <div className="flex-1">
              <p className="font-semibold text-white mb-1">
                Welcome to Idris Cooks! 👋
              </p>
              <p className="text-sm text-gray-300 mb-3">
                Sign in with Google to access premium recipes, save favorites, and unlock exclusive features.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    toast.dismiss(t.id);
                    await authClient.signIn.social({
                      provider: 'google',
                      callbackURL: '/',
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Chrome className="w-4 h-4" />
                  Sign in with Google
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ),
        {
          duration: 10000, // Show for 10 seconds
          position: 'bottom-center',
          style: {
            background: '#171717',
            color: '#ffffff',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '500px',
          },
        }
      );

      // Mark that user has seen the toast in this session
      sessionStorage.setItem('hasSeenWelcomeToast', 'true');
    }, 2000); // 2 second delay after page load

    return () => clearTimeout(timer);
  }, [session, loading]);

  return null;
}
