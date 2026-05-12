'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);

    // Initialize analytics or tracking here if needed
    // Example: gtag('consent', 'update', { analytics_storage: 'granted' });
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);

    // Disable analytics or tracking here if needed
    // Example: gtag('consent', 'update', { analytics_storage: 'denied' });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ink)] bg-[var(--cream)] animate-in slide-in-from-bottom duration-300">
      <div className="wrapper">
        <div className="relative py-5">
          <button
            onClick={handleDecline}
            className="absolute right-0 top-4 text-[var(--ink-50)] transition-colors hover:text-[var(--ink)]"
            aria-label="Close cookie banner"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col gap-5 pr-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow mb-2">Privacy</p>
              <p className="text-sm leading-6 text-[var(--ink-75)]">
                We use cookies to improve the site and understand what recipes people return to.
                Accept all, or decline non-essential cookies.{' '}
                <Link href="/privacy" className="font-medium text-[var(--ink)] underline underline-offset-4">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                onClick={handleDecline}
                className="border border-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--parchment)]"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="bg-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--cream)] transition-colors hover:bg-[#0F0E0C]"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
