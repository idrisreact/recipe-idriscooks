"use client";
import { Recipe } from "@/src/types/recipes.types";
import { useEffect, useState } from "react";

const PRIMARY = "#22c55e";
const TEXT = "#333";
const BG = "#f9fafb";

// Helper to dynamically import all @react-pdf/renderer components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function usePDFRenderer() {
  const [pdf, setPdf] = useState<{
    Document: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    Page: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    Text: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    View: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    StyleSheet: { create: (styles: any) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
    Image: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  } | null>(null);
  useEffect(() => {
    let mounted = true;
    import("@react-pdf/renderer").then((mod) => {
      if (mounted) {
        setPdf({
          Document: mod.Document,
          Page: mod.Page,
          Text: mod.Text,
          View: mod.View,
          StyleSheet: mod.StyleSheet,
          Image: mod.Image,
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);
  return pdf;
}

export function MyDocument({
  recipes,
  title,
}: {
  recipes: Recipe[];
  title: string;
}) {
  const pdf = usePDFRenderer();
  if (!pdf) return null;
  const { Document, Page, Text, View, StyleSheet, Image } = pdf;

  // Move styles inside the component so StyleSheet is available
  const styles = StyleSheet.create({
    page: {
      padding: 32,
      fontFamily: "Helvetica",
      backgroundColor: BG,
      color: TEXT,
    },
    banner: {
      width: "100%",
      height: 120,
      marginBottom: 24,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      marginTop: 0,
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
    recipeCard: {
      backgroundColor: "#fff",
      padding: 16,
      borderRadius: 8,
      marginBottom: 24,
      border: `1px solid ${BG}`,
      marginTop: 0,
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

  return (
    <Document>
      {/* Menu (Table of Contents) Page */}
      <Page size="A4" style={styles.page}>
        <Image src="/images/food background.png" alt="Food background" style={styles.banner} />
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
      {recipes.map((r) => (
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
                <Image src={r.imageUrl} alt={r.title} style={styles.recipeImage} />
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
}
