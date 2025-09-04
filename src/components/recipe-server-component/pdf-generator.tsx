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

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/pdf')) {
        // Server returned a PDF directly
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-favorite-recipes.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (contentType.includes('text/html')) {
        // Server returned HTML, convert to PDF on client side
        const htmlContent = await response.text();

        // Create a hidden iframe to render the HTML
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '794px'; // A4 width in pixels at 96 DPI
        iframe.style.height = '1123px'; // A4 height in pixels at 96 DPI
        document.body.appendChild(iframe);

        // Load HTML content into iframe
        iframe.contentDocument!.open();
        iframe.contentDocument!.write(htmlContent);
        iframe.contentDocument!.close();

        // Wait for content to load
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          // Use html2canvas and jsPDF to convert to PDF
          const html2canvas = (await import('html2canvas')).default;
          const { jsPDF } = await import('jspdf');

          const canvas = await html2canvas(iframe.contentDocument!.body, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');

          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save('my-favorite-recipes.pdf');
        } catch (pdfError) {
          console.error('Client-side PDF generation error:', pdfError);
          toast.error('Failed to generate PDF on client side');
        }

        // Clean up iframe
        document.body.removeChild(iframe);
      } else {
        throw new Error('Unexpected response type from server');
      }

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
      <div className="animate-pulse flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
        <div className="w-4 h-4 bg-muted-foreground/30 rounded"></div>
        <span className="text-muted-foreground">Checking access...</span>
      </div>
    );
  }

  if (hasPDFAccess) {
    return (
      <button
        onClick={handlePDFClick}
        disabled={isGenerating || recipes.length === 0}
        className="murakamicity-button flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
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
  }

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
              <>🔄 Refresh Access</>
            )}
          </button>
        )}
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative">
            <SignInOverlay noBackground onClose={() => setShowLoginModal(false)} />
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
