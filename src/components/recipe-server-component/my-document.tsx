'use client';
import { Recipe } from '@/src/types/recipes.types';
import { useEffect, useState } from 'react';

const PRIMARY = '#F20094'; // Murakamicity primary color
const ACCENT = '#FF6B9D'; // Lighter pink accent
const TEXT = '#0A0A0A'; // Dark text
const MUTED = '#6B7280'; // Muted text
const BG = '#FAFAFA'; // Light background
const CARD_BG = '#FFFFFF'; // Card background

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
    import('@react-pdf/renderer').then((mod) => {
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

export function MyDocument({ recipes, title }: { recipes: Recipe[]; title: string }) {
  const pdf = usePDFRenderer();
  if (!pdf) return null;
  const { Document, Page, Text, View, StyleSheet, Image } = pdf;

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Helvetica',
      backgroundColor: BG,
      color: TEXT,
    },
    coverPage: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },
    coverTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: PRIMARY,
      marginBottom: 16,
      letterSpacing: -1,
    },
    coverSubtitle: {
      fontSize: 18,
      color: MUTED,
      marginBottom: 32,
    },
    coverStats: {
      fontSize: 14,
      color: PRIMARY,
      fontWeight: 'bold',
      backgroundColor: CARD_BG,
      padding: 16,
      borderRadius: 8,
      border: `2px solid ${PRIMARY}`,
    },
    tocTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: PRIMARY,
      marginBottom: 24,
      borderBottom: `3px solid ${PRIMARY}`,
      paddingBottom: 8,
    },
    tocItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      padding: 12,
      backgroundColor: CARD_BG,
      borderRadius: 8,
      border: `1px solid ${BG}`,
    },
    tocItemTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: TEXT,
      flex: 1,
    },
    tocItemPage: {
      fontSize: 12,
      color: PRIMARY,
      fontWeight: 'bold',
      backgroundColor: BG,
      padding: 4,
      borderRadius: 4,
      minWidth: 40,
      textAlign: 'center',
    },
    recipeHeader: {
      backgroundColor: PRIMARY,
      padding: 24,
      borderRadius: 16,
      marginBottom: 32,
      color: 'white',
    },
    recipeTitle: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 8,
      color: 'white',
    },
    recipeDescription: {
      fontSize: 14,
      color: 'white',
      opacity: 0.9,
      marginBottom: 16,
    },
    recipeMeta: {
      flexDirection: 'row',
      gap: 20,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaLabel: {
      fontSize: 12,
      color: 'white',
      opacity: 0.8,
    },
    metaValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: 'white',
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 32,
      gap: 8,
    },
    badge: {
      fontSize: 10,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: ACCENT,
      color: 'white',
      fontWeight: 'bold',
    },
    contentSection: {
      backgroundColor: CARD_BG,
      padding: 24,
      borderRadius: 16,
      marginBottom: 24,
      border: `1px solid ${BG}`,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: PRIMARY,
      marginBottom: 16,
      borderBottom: `2px solid ${PRIMARY}`,
      paddingBottom: 8,
    },
    contentRow: {
      flexDirection: 'row',
      gap: 24,
    },
    textCol: {
      flex: 1,
    },
    imgCol: {
      width: 120,
      height: 120,
      borderRadius: 16,
      overflow: 'hidden',
      border: `3px solid ${PRIMARY}`,
    },
    recipeImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    ingredient: {
      fontSize: 12,
      marginBottom: 8,
      padding: 8,
      backgroundColor: BG,
      borderRadius: 8,
      borderLeft: `4px solid ${PRIMARY}`,
    },
    step: {
      fontSize: 12,
      marginBottom: 12,
      padding: 12,
      backgroundColor: BG,
      borderRadius: 8,
      lineHeight: 1.5,
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: PRIMARY,
      marginBottom: 4,
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 10,
      color: MUTED,
      borderTop: `1px solid ${BG}`,
      paddingTop: 12,
    },
    watermark: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      fontSize: 80,
      color: PRIMARY,
      opacity: 0.05,
      zIndex: -1,
    },
  });

  return (
    <Document>
      {}
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <Text style={styles.watermark}>IDRISCOOKS</Text>
        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverSubtitle}>A curated collection of your favorite recipes</Text>
        <Text style={styles.coverStats}>
          {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''} • Generated by Idris Cooks
        </Text>
      </Page>

      {}
      <Page size="A4" style={styles.page}>
        <Text style={styles.tocTitle}>Table of Contents</Text>
        {recipes.map((r, idx) => (
          <View key={r.id} style={styles.tocItem}>
            <Text style={styles.tocItemTitle}>
              {idx + 1}. {r.title}
            </Text>
            <Text style={styles.tocItemPage}>{idx + 3}</Text>
          </View>
        ))}
      </Page>

      {}
      {recipes.map((r) => (
        <Page key={r.id} size="A4" style={styles.page}>
          {}
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle}>{r.title}</Text>
            <Text style={styles.recipeDescription}>{r.description}</Text>
            <View style={styles.recipeMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Prep Time:</Text>
                <Text style={styles.metaValue}>{r.prepTime}m</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Cook Time:</Text>
                <Text style={styles.metaValue}>{r.cookTime}m</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Servings:</Text>
                <Text style={styles.metaValue}>{r.servings}</Text>
              </View>
            </View>
          </View>

          {}
          {r.tags && r.tags.length > 0 && (
            <View style={styles.badges}>
              {r.tags.map((t) => (
                <Text key={t} style={styles.badge}>
                  {t}
                </Text>
              ))}
            </View>
          )}

          {}
          <View style={styles.contentRow}>
            <View style={styles.textCol}>
              {}
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                {Array.isArray(r.ingredients) && r.ingredients.length > 0 ? (
                  r.ingredients.map((ing, i) => (
                    <Text key={i} style={styles.ingredient}>
                      • {ing.quantity} {ing.unit} {ing.name}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.ingredient}>No ingredients listed</Text>
                )}
              </View>

              {}
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                {Array.isArray(r.steps) && r.steps.length > 0 ? (
                  r.steps.map((step, i) => (
                    <View key={i} style={styles.step}>
                      <Text style={styles.stepNumber}>Step {i + 1}</Text>
                      <Text>{step}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.step}>No instructions listed</Text>
                )}
              </View>
            </View>

            {}
            {r.imageUrl && (
              <View style={styles.imgCol}>
                <Image src={r.imageUrl} alt={r.title} style={styles.recipeImage} />
              </View>
            )}
          </View>

          {}
          <Text style={styles.footer}>Generated with ❤️ by Idris Cooks • www.idriscooks.com</Text>
        </Page>
      ))}
    </Document>
  );
}
