"use client";
import { Recipe } from "@/src/types/recipes.types";
// Using regular button element since no Button component in ui folder
import { Download, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/src/utils/auth-client";
import { SignInOverlay } from "./sign-in-overlay";
import { MyDocument } from "./my-document";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => ({ default: mod.PDFDownloadLink })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse">Loading PDF generator...</div>
  }
);

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
  title = "My Favorite Recipes",
  autoDownload = false,
  onAutoDownloadComplete,
}: PDFGeneratorProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasPDFAccess, setHasPDFAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const [shouldAutoDownload, setShouldAutoDownload] = useState(false);

  // Check if user has PDF access
  useEffect(() => {
    const checkPDFAccess = async () => {
      if (session?.user?.id) {
        try {
          // Add cache busting to ensure fresh data after payment
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

  // Handle direct download from payment success
  useEffect(() => {
    const download = searchParams.get('download');
    if (download === 'true' && !checkingAccess && session?.user?.id) {
      // Recheck access from database when coming from payment success
      const recheckAccess = async () => {
        try {
          console.log('Rechecking PDF access after payment...');
          const response = await fetch('/api/user/pdf-access?' + new Date().getTime());
          const data = await response.json();
          console.log('PDF access check result:', data);
          setHasPDFAccess(data.hasAccess);
        } catch (error) {
          console.error('Error rechecking PDF access:', error);
          // Fallback: allow access temporarily
          setHasPDFAccess(true);
        }
      };
      
      // Add delay to allow webhook to process
      setTimeout(recheckAccess, 1000);
    }
  }, [searchParams, checkingAccess, session]);

  // Handle auto-download trigger from parent component
  useEffect(() => {
    if (autoDownload && hasPDFAccess && !checkingAccess) {
      console.log('Auto-download triggered');
      setShouldAutoDownload(true);
    }
  }, [autoDownload, hasPDFAccess, checkingAccess]);

  const handlePDFClick = (e: React.MouseEvent) => {
    if (hasPDFAccess) {
      toast.success("PDF download started!");
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
        // Redirect to Stripe checkout
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

  // Calculate display price
  const calculateDisplayPrice = (recipeCount: number): string => {
    if (recipeCount <= 5) return '2.99';
    if (recipeCount <= 10) return '4.99';
    if (recipeCount <= 20) return '7.99';
    return '9.99';
  };

  if (checkingAccess) {
    return (
      <div className="animate-pulse flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
        <div className="w-4 h-4 bg-muted-foreground/30 rounded"></div>
        <span className="text-muted-foreground">Checking access...</span>
      </div>
    );
  }

  // If user has access, show regular download button
  if (hasPDFAccess) {
    return (
      <PDFDownloadLink
        document={<MyDocument recipes={recipes} title={title} />}
        fileName="my-favorite-recipes.pdf"
      >
        {({ loading, url }) => {
          // Handle auto-download
          if (shouldAutoDownload && url && !loading) {
            setShouldAutoDownload(false);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'my-favorite-recipes.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("PDF download started!");
            if (onAutoDownloadComplete) {
              onAutoDownloadComplete();
            }
          }

          return (
            <button
              onClick={handlePDFClick}
              disabled={loading || isGenerating || recipes.length === 0}
              className="murakamicity-button flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {loading || isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF ({recipes.length} recipes)
              </>
            )}
          </button>
          );
        }}
      </PDFDownloadLink>
    );
  }

  // If user doesn't have access, show purchase button
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handlePDFClick}
          disabled={processingPayment || recipes.length === 0}
          className="murakamicity-button flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processingPayment ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Buy PDF Access - ${calculateDisplayPrice(recipes.length)}
            </>
          )}
        </button>
        
        {session?.user && (
          <button
            onClick={refreshAccess}
            disabled={checkingAccess}
            className="murakamicity-button-outline flex items-center gap-2 text-sm"
            title="Click if you've already paid but don't see access"
          >
            {checkingAccess ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Checking...
              </>
            ) : (
              <>
                🔄 Refresh Access
              </>
            )}
          </button>
        )}
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative">
            <SignInOverlay
              noBackground
              onClose={() => setShowLoginModal(false)}
            />
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowLoginModal(false)}
              aria-label="Close login modal"
              style={{ zIndex: 10 }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
