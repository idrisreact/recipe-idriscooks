"use client";
import { Recipe } from "@/src/types/recipes.types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/src/utils/auth-client";
import { SignInOverlay } from "./sign-in-overlay";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import dynamic from "next/dynamic";
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
  }
);

interface PDFGeneratorProps {
  recipes: Recipe[];
  isGenerating?: boolean;
  onGenerate?: () => void;
  title?: string;
}

const PRIMARY = "#22c55e";
const TEXT = "#333";
const BG = "#f9fafb";

const styles = StyleSheet.create({
  page: {
    padding: 32, // More padding for standalone look
    fontFamily: "Helvetica",
    backgroundColor: BG,
    color: TEXT,
  },
  // ─── Hero Banner ────────────────────────────────────────────
  banner: {
    width: "100%",
    height: 120,
    marginBottom: 24, // More space below banner
  },
  // ─── Header ────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 0, // Remove if you want header at the very top
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: PRIMARY,
  },
  headerMeta: {
    fontSize: 10,
    color: "#666",
  },
  // ─── Recipe Card ──────────────────────────────────────────
  recipeCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    border: `1px solid ${BG}`,
    marginTop: 0, // Remove if you want content to start at the top
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  badge: {
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    color: "#fff",
    marginRight: 4,
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  recipeMeta: {
    fontSize: 10,
    color: "#666",
    marginBottom: 8,
  },
  contentRow: {
    flexDirection: "row",
    gap: 12,
  },
  textCol: {
    flex: 1,
  },
  imgCol: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 4,
    borderBottom: `1px solid ${BG}`,
    paddingBottom: 2,
  },
  ingredient: {
    fontSize: 10,
    marginBottom: 2,
  },
  step: {
    fontSize: 10,
    marginBottom: 2,
    color: "#444",
  },
  footer: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 8,
    color: "#666",
  },
});

const MyDocument = ({
  recipes,
  title,
}: {
  recipes: Recipe[];
  title: string;
}) => (
  <Document>
    {/* Menu (Table of Contents) Page */}
    <Page size="A4" style={styles.page}>
      <Image src="/images/food background.png" style={styles.banner} />
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={{ marginBottom: 24, color: "#666", fontSize: 12 }}>
        Table of Contents
      </Text>
      {recipes.map((r, idx) => (
        <View
          key={r.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14 }}>
            {idx + 1}. {r.title}
          </Text>
          <Text style={{ fontSize: 12, color: "#888" }}>Page {idx + 2}</Text>
        </View>
      ))}
    </Page>
    {/* Each recipe on its own page (no banner) */}
    {recipes.map((r, idx) => (
      <Page key={r.id} size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{r.title}</Text>
          <Text style={styles.headerMeta}>
            {r.cookTime}m 2 {r.servings} servings
          </Text>
        </View>
        <View style={styles.badges}>
          {r.tags?.map((t) => (
            <Text key={t} style={styles.badge}>
              {t}
            </Text>
          ))}
        </View>
        <View style={styles.contentRow}>
          <View style={styles.textCol}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {Array.isArray(r.ingredients) && r.ingredients.length > 0 ? (
              r.ingredients.map((ing, i) => (
                <Text key={i} style={styles.ingredient}>
                  7 {ing.quantity} {ing.unit} {ing.name}
                </Text>
              ))
            ) : (
              <Text style={styles.ingredient}>No ingredients listed</Text>
            )}
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
              Instructions
            </Text>
            {Array.isArray(r.steps) && r.steps.length > 0 ? (
              r.steps.map((step, i) => (
                <Text key={i} style={styles.step}>
                  {i + 1}. {step}
                </Text>
              ))
            ) : (
              <Text style={styles.step}>No steps listed</Text>
            )}
          </View>
          {r.imageUrl && (
            <View style={styles.imgCol}>
              <Image src={r.imageUrl} style={styles.recipeImage} />
            </View>
          )}
        </View>
        <Text style={styles.footer}>
          Generated by Idris Cooks App 2013 Happy cooking! 1f469 200d 1f373
        </Text>
      </Page>
    ))}
  </Document>
);

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
