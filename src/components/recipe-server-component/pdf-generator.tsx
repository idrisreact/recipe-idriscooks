"use client";
import { Recipe } from "@/src/types/recipes.types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { authClient } from "@/src/utils/auth-client";
import { SignInOverlay } from "./sign-in-overlay";

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
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session } = authClient.useSession();

  const generatePDF = async () => {
    if (recipes.length === 0) return;
    setIsLoading(true);
    const loadingToast = toast.loading("Generating PDF...");

    // 1) prepare offscreen container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    // inject global CSS rules for children
    const styleTag = document.createElement("style");
    styleTag.textContent = `* { box-sizing: border-box; }`;
    container.appendChild(styleTag);

    // render your markup (JSX or string)
    container.innerHTML = generatePDFHTML(recipes);

    try {
      // 2) html2canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        onclone: (clonedDoc) => {
          // 1️⃣ remove every stylesheet
          clonedDoc
            .querySelectorAll('link[rel="stylesheet"], style')
            .forEach((el) => el.remove());

          // 2️⃣ inject a minimal reset + your own styles
          const reset = clonedDoc.createElement("style");
          reset.textContent = `
            /* basic reset */
            *, *::before, *::after { box-sizing: border-box !important; margin:0; padding:0; }
            html, body { background: #ffffff !important; color: #333333 !important;
                         font-family: Arial, Helvetica, sans-serif !important; }
          `;
          clonedDoc.head.appendChild(reset);
        },
      });

      // 3) remove container immediately so offscreen DOM is clean
      document.body.removeChild(container);

      // 4) build PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;

      let y = 0;
      pdf.addImage(imgData, "PNG", 0, y, pageW, imgH);
      while (imgH - y > pageH) {
        y += pageH;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pageW, imgH);
      }

      // 5) download
      pdf.save(/* filename */);
      toast.success("PDF downloaded!", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.", { id: loadingToast });
    } finally {
      setIsLoading(false);
      // ensure container is gone even on error
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };

  const handlePDFClick = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    generatePDF();
  };

  const generatePDFHTML = (recipes: Recipe[]): string => {
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #333333; background-color: #ffffff;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
          <h1 style="color: #3b82f6; font-size: 32px; margin: 0 0 10px 0; font-weight: bold;">${title}</h1>
          <p style="color: #666666; font-size: 16px; margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
          <p style="color: #666666; font-size: 14px; margin: 10px 0 0 0;">${
            recipes.length
          } recipe${recipes.length !== 1 ? "s" : ""}</p>
        </div>

        <!-- Recipes -->
        ${recipes
          .map(
            (recipe) => `
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <!-- Recipe Header -->
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">${
                recipe.title
              }</h2>
              <div style="display: flex; gap: 20px; font-size: 14px;">
                <span>⏱️ ${recipe.cookTime}m cook time</span>
                <span>👥 ${recipe.servings} servings</span>
              </div>
            </div>

            <!-- Description -->
            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${
              recipe.description
            }</p>

            <!-- Content Grid -->
            <div style="display: flex; gap: 30px;">
              <!-- Ingredients -->
              <div style="flex: 1;">
                <h3 style="color: #3b82f6; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; font-weight: bold;">Ingredients</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${
                    recipe.ingredients
                      ?.map(
                        (ingredient) => `
                    <li style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                      <div style="width: 8px; height: 8px; background-color: #3b82f6; border-radius: 50%; flex-shrink: 0;"></div>
                      <span style="font-weight: 500; color: #333333;">${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</span>
                    </li>
                  `
                      )
                      .join("") ||
                    '<li style="color: #999999;">No ingredients listed</li>'
                  }
                </ul>
              </div>

              <!-- Instructions -->
              <div style="flex: 1;">
                <h3 style="color: #3b82f6; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; font-weight: bold;">Instructions</h3>
                <ol style="padding-left: 20px; margin: 0;">
                  ${
                    recipe.steps
                      ?.map(
                        (step) => `
                    <li style="margin-bottom: 12px; line-height: 1.5; color: #374151;">${step}</li>
                  `
                      )
                      .join("") ||
                    '<li style="color: #999999;">No steps listed</li>'
                  }
                </ol>
              </div>
            </div>

            <!-- Tags -->
            ${
              recipe.tags && recipe.tags.length > 0
                ? `
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  ${recipe.tags
                    .map(
                      (tag) => `
                    <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${tag}</span>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666666; font-size: 12px;">
          <p>Generated by Idris Cooks App</p>
          <p>Happy cooking! 👨‍🍳</p>
        </div>
      </div>
    `;
  };

  return (
    <>
      <Button
        onClick={handlePDFClick}
        disabled={isLoading || isGenerating || recipes.length === 0}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
      >
        {isLoading || isGenerating ? (
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
