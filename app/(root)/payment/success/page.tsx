'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { Text } from '@/src/components/ui/Text';
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
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-4"></div>
            <Text>Verifying payment...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper page">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <Text as="h1" variant="heading" className="mb-4">
            Payment Verification Failed
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            {error}
          </Text>
          <button onClick={() => router.push('/favorites')} className="murakamicity-button">
            Return to Favorites
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper page">
      <div className="max-w-2xl mx-auto text-center py-16">
        {}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {}
        <Text as="h1" variant="heading" className="text-green-600 mb-4">
          Payment Successful!
        </Text>

        <Text variant="large" className="text-muted-foreground mb-8">
          Thank you for your purchase. You now have access to download your favorite recipes as a
          PDF.
        </Text>

        {}
        {sessionData && (
          <div className="murakamicity-card p-6 mb-8 text-left">
            <Text as="h3" variant="subheading" className="mb-4 text-center">
              Purchase Details
            </Text>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span>PDF Recipe Collection</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span>${(sessionData.amount_total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-mono text-sm">{sessionData.payment_intent}</span>
              </div>
              {session?.user && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account:</span>
                  <span>{session.user.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            className="murakamicity-button flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Now
          </button>

          <button
            onClick={handleContinueShopping}
            className="murakamicity-button-outline flex items-center gap-2"
          >
            Continue Browsing
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <Text as="h4" variant="large" className="font-semibold mb-2">
            What&apos;s Next?
          </Text>
          <div className="text-left space-y-2 text-sm text-muted-foreground">
            <p>• Your PDF download access has been activated</p>
            <p>• You can download your recipes anytime from your favorites page</p>
            <p>• The PDF includes beautifully formatted recipes with images</p>
            {session?.user && <p>• Your purchase is saved to your account for future access</p>}
            <p>• Need help? Contact us at support@idriscooks.com</p>
          </div>
        </div>
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
