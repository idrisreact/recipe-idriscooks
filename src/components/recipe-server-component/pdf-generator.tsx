"use client";
import { Recipe } from "@/src/types/recipes.types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/src/utils/auth-client";
import { SignInOverlay } from "./sign-in-overlay";
import { MyDocument } from "./my-document";

import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => ({ default: mod.PDFDownloadLink })),
  {
    ssr: false,
    loading: () => <p>Loading PDF generator...</p>
  }
);

interface PDFGeneratorProps {
  recipes: Recipe[];
  isGenerating?: boolean;
  onGenerate?: () => void;
  title?: string;
}


export function PDFGenerator({
  recipes,
  isGenerating = false,
  title = "My Favorite Recipes",
}: PDFGeneratorProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session } = authClient.useSession();

  const handlePDFClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      setShowLoginModal(true);
      return;
    }
    toast.success("PDF download started!");
  };

  return (
    <>
      <PDFDownloadLink
        document={<MyDocument recipes={recipes} title={title} />}
        fileName="recipes.pdf"
      >
        {({ loading }) => (
          <Button
            onClick={handlePDFClick}
            disabled={loading || isGenerating || recipes.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
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
          </Button>
        )}
      </PDFDownloadLink>
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
