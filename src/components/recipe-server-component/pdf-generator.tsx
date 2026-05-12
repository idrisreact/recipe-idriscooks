'use client';
import { Recipe } from '@/src/types/recipes.types';
import { Download, CreditCard } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authClient } from '@/src/utils/auth-client';
import { SignInOverlay } from './sign-in-overlay';
import { useSearchParams } from 'next/navigation';

interface PDFGeneratorProps {
  recipes: Recipe[];
  isGenerating?: boolean;
  onGenerate?: () => void;
  title?: string;
  autoDownload?: boolean;
  onAutoDownloadComplete?: () => void;
}

export function PDFGenerator({
  recipes,
  isGenerating = false,
  title = 'My Favorite Recipes',
  autoDownload = false,
  onAutoDownloadComplete,
}: PDFGeneratorProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasPDFAccess, setHasPDFAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  useEffect(() => {
    const checkPDFAccess = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/pdf-access?' + new Date().getTime());
          const data = await response.json();
          setHasPDFAccess(data.hasAccess);
        } catch (error) {
          console.error('Error checking PDF access:', error);
        }
      }
      setCheckingAccess(false);
    };

    checkPDFAccess();
  }, [session]);

  useEffect(() => {
    const download = searchParams.get('download');
    if (download === 'true' && !checkingAccess && session?.user?.id) {
      const recheckAccess = async () => {
        try {
          console.log('Rechecking PDF access after payment...');
          const response = await fetch('/api/user/pdf-access?' + new Date().getTime());
          const data = await response.json();
          console.log('PDF access check result:', data);
          setHasPDFAccess(data.hasAccess);
        } catch (error) {
          console.error('Error rechecking PDF access:', error);

          setHasPDFAccess(true);
        }
      };

      setTimeout(recheckAccess, 1000);
    }
  }, [searchParams, checkingAccess, session]);

  const downloadPDF = useCallback(async () => {
    try {
      toast.success('PDF download started!');

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipes,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-favorite-recipes.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (onAutoDownloadComplete) {
        onAutoDownloadComplete();
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    }
  }, [recipes, title, onAutoDownloadComplete]);

  useEffect(() => {
    if (autoDownload && hasPDFAccess && !checkingAccess) {
      console.log('Auto-download triggered');
      downloadPDF();
    }
  }, [autoDownload, hasPDFAccess, checkingAccess, downloadPDF]);

  const handlePDFClick = async (e: React.MouseEvent) => {
    if (hasPDFAccess) {
      await downloadPDF();
      return;
    }

    e.preventDefault();
    if (!session) {
      setShowLoginModal(true);
    } else {
      handlePurchase();
    }
  };

  const handlePurchase = async () => {
    setProcessingPayment(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeCount: recipes.length }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to start payment process');
      setProcessingPayment(false);
    }
  };

  const refreshAccess = async () => {
    if (!session?.user?.id) return;

    setCheckingAccess(true);
    try {
      console.log('Refreshing PDF access...');
      const response = await fetch('/api/user/pdf-access?' + new Date().getTime());
      const data = await response.json();
      console.log('Access refresh result:', data);
      setHasPDFAccess(data.hasAccess);

      if (data.hasAccess) {
        toast.success('PDF access confirmed!');
      } else {
        toast.error('PDF access not found. Please try again in a moment.');
      }
    } catch (error) {
      console.error('Error refreshing access:', error);
      toast.error('Failed to check access');
    } finally {
      setCheckingAccess(false);
    }
  };

  const calculateDisplayPrice = (recipeCount: number): string => {
    if (recipeCount <= 5) return '2.99';
    if (recipeCount <= 10) return '4.99';
    if (recipeCount <= 20) return '7.99';
    return '9.99';
  };

  if (checkingAccess) {
    return (
      <div className="flex items-center gap-3 border-t border-[var(--ink-line)] py-3 pl-1">
        <div className="h-2 w-2 animate-pulse bg-[var(--ink-50)]" />
        <span className="mono-label text-[var(--ink-60)]">Checking access...</span>
      </div>
    );
  }

  if (hasPDFAccess) {
    return (
      <button
        type="button"
        onClick={handlePDFClick}
        disabled={isGenerating || recipes.length === 0}
        className="btn-ink group disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isGenerating ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin border border-[var(--cream)] border-t-transparent" />
            Generating PDF
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download PDF
            <span className="mono-label ml-1 text-[var(--cream-70)]">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col">
          <span className="eyebrow text-[var(--tomato)]">PDF / One-time</span>
          <span className="mono-label mt-1 text-[var(--ink-60)]">
            ${calculateDisplayPrice(recipes.length)} for {recipes.length}{' '}
            {recipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePDFClick}
          disabled={processingPayment || recipes.length === 0}
          className="btn-tomato disabled:cursor-not-allowed disabled:opacity-40"
        >
          {processingPayment ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin border border-[var(--cream)] border-t-transparent" />
              Processing
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Buy PDF access
            </>
          )}
        </button>

        {session?.user && (
          <button
            type="button"
            onClick={refreshAccess}
            disabled={checkingAccess}
            className="btn-link disabled:cursor-not-allowed disabled:opacity-40"
            title="Click if you've already paid but don't see access"
          >
            {checkingAccess ? 'Checking...' : 'Refresh access'}
          </button>
        )}
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60">
          <div className="relative">
            <SignInOverlay noBackground onClose={() => setShowLoginModal(false)} />
            <button
              type="button"
              className="absolute right-3 top-3 text-2xl leading-none text-[var(--ink-60)] hover:text-[var(--tomato)]"
              onClick={() => setShowLoginModal(false)}
              aria-label="Close login modal"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
