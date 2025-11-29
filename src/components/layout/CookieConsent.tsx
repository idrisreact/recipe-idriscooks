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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-border relative">
          {/* Close button */}
          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cookie banner"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon and Text */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="text-4xl">🍪</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content,
                    and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our
                    use of cookies.{' '}
                    <Link href="/privacy" className="text-primary hover:underline font-medium">
                      Read our Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium whitespace-nowrap"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
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
