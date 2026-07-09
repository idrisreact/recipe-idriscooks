'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, ArrowRight } from 'lucide-react';
import { authClient } from '@/src/utils/auth-client';

function PaymentSuccessContent() {
  const [sessionData, setSessionData] = useState<{
    id: string;
    customer_email: string | null;
    amount_total: number;
    currency: string;
    payment_intent: string;
    metadata: Record<string, string>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSessionData(data.session);
        } else {
          setError(data.error || 'Payment verification failed');
        }
      })
      .catch((err) => {
        setError('Failed to verify payment');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  const handleDownloadPDF = () => {
    router.push('/favorites?download=true');
  };

  const handleContinueShopping = () => {
    router.push('/recipes');
  };

  if (loading) {
    return (
      <div className="wrapper page">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh]">
          <div className="w-8 h-8 animate-pulse bg-[var(--parchment)]" />
          <p className="mono-label">Verifying payment…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper page">
        <div className="max-w-2xl mx-auto flex flex-col items-start gap-6 py-16">
          <span className="eyebrow-rule">Payment issue</span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-[var(--ink)]">
            We couldn&apos;t verify that{' '}
            <span className="italic text-[var(--tomato)]">payment</span>.
          </h1>
          <p className="body-lg text-[var(--ink-65)] max-w-md">{error}</p>
          <button onClick={() => router.push('/favorites')} className="btn-ink">
            Return to favorites
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper page">
      <div className="max-w-2xl mx-auto flex flex-col items-start gap-6 py-16 text-left">
        <span className="eyebrow-rule">Payment confirmed</span>

        <h1 className="font-serif text-5xl md:text-6xl leading-none text-[var(--ink)]">
          It&apos;s <span className="italic text-[var(--tomato)]">yours</span>. Happy cooking.
        </h1>

        <p className="body-lg text-[var(--ink-65)] mb-4">
          Thank you for your purchase. You now have access to download your favorite recipes as a
          PDF.
        </p>

        {sessionData && (
          <dl className="w-full flex flex-col divide-y divide-[var(--ink-line)] border-t border-[var(--ink)] mb-4">
            <div className="flex items-baseline justify-between py-3">
              <dt className="eyebrow">Product</dt>
              <dd className="text-sm text-[var(--ink)]">PDF Recipe Collection</dd>
            </div>
            <div className="flex items-baseline justify-between py-3">
              <dt className="eyebrow">Amount</dt>
              <dd className="font-serif text-2xl">
                {sessionData.currency.toUpperCase() === 'GBP' ? '£' : '$'}
                {(sessionData.amount_total / 100).toFixed(2)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between py-3 gap-6">
              <dt className="eyebrow">Payment ID</dt>
              <dd className="font-mono text-xs text-[var(--ink-65)] truncate">
                {sessionData.payment_intent}
              </dd>
            </div>
            {session?.user && (
              <div className="flex items-baseline justify-between py-3">
                <dt className="eyebrow">Account</dt>
                <dd className="text-sm text-[var(--ink)]">{session.user.email}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleDownloadPDF} className="btn-ink flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF now
          </button>

          <button onClick={handleContinueShopping} className="btn-outline flex items-center gap-2">
            Continue browsing
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 w-full bg-[var(--parchment)] p-8 flex flex-col gap-4">
          <span className="eyebrow">What&apos;s next</span>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--ink-75)] list-none">
            <li>Your PDF download access has been activated.</li>
            <li>Download your recipes anytime from the favorites page.</li>
            <li>PDFs are typeset with images, like the site.</li>
            {session?.user && <li>Your purchase is saved to your account.</li>}
            <li>Need help? Write to support@idriscooks.com.</li>
          </ul>
        </div>

        <p className="text-sm text-[var(--ink-60)]">
          Have questions about refunds?{' '}
          <a href="/refund-policy" className="btn-link text-sm">
            Read the refund policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="wrapper page">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
