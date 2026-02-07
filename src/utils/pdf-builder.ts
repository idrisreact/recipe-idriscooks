import { PDFDocument, PDFFont, PDFPage, PDFImage, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import { Recipe } from '@/src/types/recipes.types';

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = { top: 50, right: 50, bottom: 60, left: 50 };
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN.left - MARGIN.right;

const COLORS = {
  gold: rgb(0.831, 0.659, 0.325),
  dark: rgb(0.102, 0.102, 0.102),
  body: rgb(0.2, 0.2, 0.2),
  light: rgb(0.4, 0.4, 0.4),
  rule: rgb(0.878, 0.878, 0.878),
  pillBg: rgb(0.966, 0.932, 0.865),
  white: rgb(1, 1, 1),
};

interface Fonts {
  playfairBold: PDFFont;
  interRegular: PDFFont;
  interBold: PDFFont;
}

// ─── Text Utilities ──────────────────────────────────────────────────────────

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [''];
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function drawFooter(page: PDFPage, fonts: Fonts, pageNumber: number, totalPages: number) {
  const y = MARGIN.bottom / 2;

  page.drawText('Idris Cooks', {
    x: MARGIN.left,
    y,
    size: 8,
    font: fonts.interRegular,
    color: COLORS.light,
  });

  const pageText = `Page ${pageNumber} of ${totalPages}`;
  const pageTextWidth = fonts.interRegular.widthOfTextAtSize(pageText, 8);
  page.drawText(pageText, {
    x: PAGE_WIDTH - MARGIN.right - pageTextWidth,
    y,
    size: 8,
    font: fonts.interRegular,
    color: COLORS.light,
  });
}

// ─── Image Fetching ──────────────────────────────────────────────────────────

async function fetchAndEmbedImage(pdfDoc: PDFDocument, imageUrl: string): Promise<PDFImage | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (contentType.includes('png')) {
      return await pdfDoc.embedPng(bytes);
    }
    // Default to JPEG for jpg, jpeg, and any other image type
    return await pdfDoc.embedJpg(bytes);
  } catch {
    return null;
  }
}

// ─── Cover Page ──────────────────────────────────────────────────────────────

function drawCoverPage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  fonts: Fonts,
  title: string,
  count: number
) {
  const centerX = PAGE_WIDTH / 2;
  let y = PAGE_HEIGHT / 2 + 80;

  // "IDRIS COOKS" brand text
  const brandText = 'IDRIS COOKS';
  const brandWidth = fonts.playfairBold.widthOfTextAtSize(brandText, 11);
  page.drawText(brandText, {
    x: centerX - brandWidth / 2,
    y,
    size: 11,
    font: fonts.playfairBold,
    color: COLORS.gold,
  });
  y -= 20;

  // Thin gold rule (100pt)
  page.drawLine({
    start: { x: centerX - 50, y },
    end: { x: centerX + 50, y },
    thickness: 0.5,
    color: COLORS.gold,
  });
  y -= 40;

  // Collection title
  const titleLines = wrapText(title, fonts.playfairBold, 36, CONTENT_WIDTH - 60);
  for (const line of titleLines) {
    const lineWidth = fonts.playfairBold.widthOfTextAtSize(line, 36);
    page.drawText(line, {
      x: centerX - lineWidth / 2,
      y,
      size: 36,
      font: fonts.playfairBold,
      color: COLORS.dark,
    });
    y -= 48;
  }
  y -= 10;

  // Thin gold rule (200pt)
  page.drawLine({
    start: { x: centerX - 100, y },
    end: { x: centerX + 100, y },
    thickness: 0.5,
    color: COLORS.gold,
  });
  y -= 30;

  // Recipe count
  const countText = `${count} Recipe${count !== 1 ? 's' : ''}`;
  const countWidth = fonts.interRegular.widthOfTextAtSize(countText, 12);
  page.drawText(countText, {
    x: centerX - countWidth / 2,
    y,
    size: 12,
    font: fonts.interRegular,
    color: COLORS.body,
  });
  y -= 18;

  // Generation date
  const dateText = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateWidth = fonts.interRegular.widthOfTextAtSize(dateText, 10);
  page.drawText(dateText, {
    x: centerX - dateWidth / 2,
    y,
    size: 10,
    font: fonts.interRegular,
    color: COLORS.light,
  });

  // "idriscooks.com" near bottom
  const siteText = 'idriscooks.com';
  const siteWidth = fonts.interRegular.widthOfTextAtSize(siteText, 10);
  page.drawText(siteText, {
    x: centerX - siteWidth / 2,
    y: MARGIN.bottom + 20,
    size: 10,
    font: fonts.interRegular,
    color: COLORS.gold,
  });
}

// ─── Tag Pills ───────────────────────────────────────────────────────────────

function drawTagPills(
  page: PDFPage,
  tags: string[],
  fonts: Fonts,
  x: number,
  y: number,
  maxWidth: number
): number {
  if (!tags || tags.length === 0) return y;

  const fontSize = 9;
  const pillPaddingX = 8;
  const pillPaddingY = 3;
  const pillGap = 6;
  const pillHeight = fontSize + pillPaddingY * 2;

  let curX = x;
  let curY = y;

  for (const tag of tags) {
    const textWidth = fonts.interBold.widthOfTextAtSize(tag, fontSize);
    const pillWidth = textWidth + pillPaddingX * 2;

    // Wrap to next line if needed
    if (curX + pillWidth > x + maxWidth && curX > x) {
      curX = x;
      curY -= pillHeight + 4;
    }

    // Draw rounded rect background

    // Approximate rounded rect with a rectangle (pdf-lib doesn't have rounded rect natively)
    page.drawRectangle({
      x: curX,
      y: curY - pillHeight + pillPaddingY,
      width: pillWidth,
      height: pillHeight,
      color: COLORS.pillBg,
      borderColor: COLORS.gold,
      borderWidth: 0.5,
    });

    page.drawText(tag, {
      x: curX + pillPaddingX,
      y: curY - fontSize + pillPaddingY,
      size: fontSize,
      font: fonts.interBold,
      color: COLORS.gold,
    });

    curX += pillWidth + pillGap;
  }

  return curY - pillHeight - 8;
}

// ─── Info Bar ────────────────────────────────────────────────────────────────

function drawInfoBar(page: PDFPage, recipe: Recipe, fonts: Fonts, y: number): number {
  const items = [
    { label: 'Serves', value: `${recipe.servings}` },
    { label: 'Prep Time', value: `${recipe.prepTime} min` },
    { label: 'Cook Time', value: `${recipe.cookTime} min` },
  ];

  // Top rule
  page.drawLine({
    start: { x: MARGIN.left, y },
    end: { x: PAGE_WIDTH - MARGIN.right, y },
    thickness: 0.5,
    color: COLORS.rule,
  });
  y -= 16;

  let curX = MARGIN.left;
  for (let i = 0; i < items.length; i++) {
    const { label, value } = items[i];

    const labelWidth = fonts.interRegular.widthOfTextAtSize(label, 10);
    page.drawText(label, {
      x: curX,
      y,
      size: 10,
      font: fonts.interRegular,
      color: COLORS.light,
    });

    page.drawText(value, {
      x: curX + labelWidth + 6,
      y,
      size: 10,
      font: fonts.interBold,
      color: COLORS.dark,
    });

    const valueWidth = fonts.interBold.widthOfTextAtSize(value, 10);
    curX += labelWidth + 6 + valueWidth + 30;

    // Separator
    if (i < items.length - 1) {
      page.drawText('|', {
        x: curX - 20,
        y,
        size: 10,
        font: fonts.interRegular,
        color: COLORS.rule,
      });
    }
  }

  y -= 12;
  // Bottom rule
  page.drawLine({
    start: { x: MARGIN.left, y },
    end: { x: PAGE_WIDTH - MARGIN.right, y },
    thickness: 0.5,
    color: COLORS.rule,
  });

  return y - 14;
}

// ─── Ingredients ─────────────────────────────────────────────────────────────

function drawIngredients(
  page: PDFPage,
  pdfDoc: PDFDocument,
  ingredients: Recipe['ingredients'],
  fonts: Fonts,
  y: number,
  pages: PDFPage[],
  allFonts: Fonts
): { y: number; page: PDFPage } {
  if (!ingredients || ingredients.length === 0) return { y, page };

  let currentPage = page;
  let curY = y;

  // Section header
  const headerText = 'Ingredients';
  currentPage.drawText(headerText, {
    x: MARGIN.left,
    y: curY,
    size: 14,
    font: fonts.playfairBold,
    color: COLORS.dark,
  });
  curY -= 4;

  // Gold underline
  const headerWidth = fonts.playfairBold.widthOfTextAtSize(headerText, 14);
  currentPage.drawLine({
    start: { x: MARGIN.left, y: curY },
    end: { x: MARGIN.left + headerWidth, y: curY },
    thickness: 2,
    color: COLORS.gold,
  });
  curY -= 16;

  const useColumns = ingredients.length > 8;
  const columnWidth = useColumns ? (CONTENT_WIDTH - 20) / 2 : CONTENT_WIDTH;

  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    const colIndex = useColumns ? (i < Math.ceil(ingredients.length / 2) ? 0 : 1) : 0;
    const colX = MARGIN.left + colIndex * (columnWidth + 20);

    // Calculate Y position for two-column layout
    if (useColumns && i === Math.ceil(ingredients.length / 2)) {
      curY = y - 20; // Reset Y for second column
    }

    // Overflow check
    if (curY < MARGIN.bottom + 30) {
      drawFooter(currentPage, allFonts, pages.length, 0); // placeholder total
      const newPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pages.push(newPage);
      currentPage = newPage;
      curY = PAGE_HEIGHT - MARGIN.top;
    }

    const qtyUnit = `${ing.quantity} ${ing.unit}`.trim();
    const qtyUnitWidth = fonts.interBold.widthOfTextAtSize(qtyUnit, 10);

    currentPage.drawText(qtyUnit, {
      x: colX,
      y: curY,
      size: 10,
      font: fonts.interBold,
      color: COLORS.dark,
    });

    currentPage.drawText(ing.name, {
      x: colX + qtyUnitWidth + 8,
      y: curY,
      size: 10,
      font: fonts.interRegular,
      color: COLORS.body,
    });

    curY -= 18;

    // Thin rule separator
    if (!useColumns || colIndex === 0) {
      currentPage.drawLine({
        start: { x: colX, y: curY + 6 },
        end: { x: colX + columnWidth, y: curY + 6 },
        thickness: 0.3,
        color: COLORS.rule,
      });
    }
  }

  return { y: curY - 10, page: currentPage };
}

// ─── Instructions ────────────────────────────────────────────────────────────

function drawSteps(
  page: PDFPage,
  pdfDoc: PDFDocument,
  steps: string[],
  fonts: Fonts,
  y: number,
  pages: PDFPage[],
  allFonts: Fonts
): { y: number; page: PDFPage } {
  if (!steps || steps.length === 0) return { y, page };

  let currentPage = page;
  let curY = y;

  // Section header
  const headerText = 'Instructions';
  currentPage.drawText(headerText, {
    x: MARGIN.left,
    y: curY,
    size: 14,
    font: fonts.playfairBold,
    color: COLORS.dark,
  });
  curY -= 4;

  const headerWidth = fonts.playfairBold.widthOfTextAtSize(headerText, 14);
  currentPage.drawLine({
    start: { x: MARGIN.left, y: curY },
    end: { x: MARGIN.left + headerWidth, y: curY },
    thickness: 2,
    color: COLORS.gold,
  });
  curY -= 20;

  const circleRadius = 10;
  const textIndent = MARGIN.left + circleRadius * 2 + 12;
  const textMaxWidth = PAGE_WIDTH - MARGIN.right - textIndent;

  for (let i = 0; i < steps.length; i++) {
    const lines = wrapText(steps[i], fonts.interRegular, 10, textMaxWidth);
    const blockHeight = lines.length * 14 + 12;

    // Overflow check
    if (curY - blockHeight < MARGIN.bottom + 30) {
      drawFooter(currentPage, allFonts, pages.length, 0);
      const newPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pages.push(newPage);
      currentPage = newPage;
      curY = PAGE_HEIGHT - MARGIN.top;
    }

    // Gold circle with step number
    const circleX = MARGIN.left + circleRadius;
    const circleY = curY - circleRadius + 4;
    currentPage.drawCircle({
      x: circleX,
      y: circleY,
      size: circleRadius,
      color: COLORS.gold,
    });

    const numStr = `${i + 1}`;
    const numWidth = fonts.interBold.widthOfTextAtSize(numStr, 9);
    currentPage.drawText(numStr, {
      x: circleX - numWidth / 2,
      y: circleY - 3,
      size: 9,
      font: fonts.interBold,
      color: COLORS.white,
    });

    // Step text
    for (let j = 0; j < lines.length; j++) {
      currentPage.drawText(lines[j], {
        x: textIndent,
        y: curY - j * 14,
        size: 10,
        font: fonts.interRegular,
        color: COLORS.body,
      });
    }

    curY -= blockHeight;
  }

  return { y: curY, page: currentPage };
}

// ─── Main Entry ──────────────────────────────────────────────────────────────

export async function buildRecipePDF(recipes: Recipe[], title: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load fonts from filesystem
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  const playfairBoldBytes = fs.readFileSync(path.join(fontsDir, 'PlayfairDisplay-Bold.ttf'));
  const interRegularBytes = fs.readFileSync(path.join(fontsDir, 'Inter-Regular.ttf'));
  const interBoldBytes = fs.readFileSync(path.join(fontsDir, 'Inter-Bold.ttf'));

  const playfairBold = await pdfDoc.embedFont(playfairBoldBytes);
  const interRegular = await pdfDoc.embedFont(interRegularBytes);
  const interBold = await pdfDoc.embedFont(interBoldBytes);

  const fonts: Fonts = { playfairBold, interRegular, interBold };

  // Track all pages for footer numbering
  const pages: PDFPage[] = [];

  // ── Cover page ──
  const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(coverPage);
  drawCoverPage(pdfDoc, coverPage, fonts, title, recipes.length);

  // ── Recipe pages ──
  // Fetch all images in parallel first
  const imagePromises = recipes.map((r) =>
    r.imageUrl ? fetchAndEmbedImage(pdfDoc, r.imageUrl) : Promise.resolve(null)
  );
  const images = await Promise.allSettled(imagePromises);
  const embeddedImages: (PDFImage | null)[] = images.map((r) =>
    r.status === 'fulfilled' ? r.value : null
  );

  // Draw each recipe page (using pre-fetched images)
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    let curY = PAGE_HEIGHT - MARGIN.top;

    // ── Recipe title ──
    const titleLines = wrapText(recipe.title, fonts.playfairBold, 28, CONTENT_WIDTH);
    for (const line of titleLines) {
      page.drawText(line, {
        x: MARGIN.left,
        y: curY,
        size: 28,
        font: fonts.playfairBold,
        color: COLORS.dark,
      });
      curY -= 36;
    }

    // Gold underline
    curY += 4;
    page.drawLine({
      start: { x: MARGIN.left, y: curY },
      end: { x: PAGE_WIDTH - MARGIN.right, y: curY },
      thickness: 2,
      color: COLORS.gold,
    });
    curY -= 16;

    // ── Tags ──
    if (recipe.tags && recipe.tags.length > 0) {
      curY = drawTagPills(page, recipe.tags, fonts, MARGIN.left, curY, CONTENT_WIDTH);
    }

    // ── Info bar ──
    curY = drawInfoBar(page, recipe, fonts, curY);

    // ── Recipe photo ──
    const image = embeddedImages[i];
    if (image) {
      const maxImgHeight = 220;
      const imgAspect = image.width / image.height;
      let imgWidth = CONTENT_WIDTH;
      let imgHeight = imgWidth / imgAspect;

      if (imgHeight > maxImgHeight) {
        imgHeight = maxImgHeight;
        imgWidth = imgHeight * imgAspect;
      }

      const imgX = MARGIN.left + (CONTENT_WIDTH - imgWidth) / 2;

      if (curY - imgHeight < MARGIN.bottom + 30) {
        drawFooter(page, fonts, pages.length, 0);
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        pages.push(page);
        curY = PAGE_HEIGHT - MARGIN.top;
      }

      page.drawImage(image, {
        x: imgX,
        y: curY - imgHeight,
        width: imgWidth,
        height: imgHeight,
      });
      curY -= imgHeight + 14;
    }

    // ── Description ──
    if (recipe.description) {
      const descLines = wrapText(recipe.description, fonts.interRegular, 10, CONTENT_WIDTH);
      for (const line of descLines) {
        if (curY < MARGIN.bottom + 30) {
          drawFooter(page, fonts, pages.length, 0);
          page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          pages.push(page);
          curY = PAGE_HEIGHT - MARGIN.top;
        }
        page.drawText(line, {
          x: MARGIN.left,
          y: curY,
          size: 10,
          font: fonts.interRegular,
          color: COLORS.body,
        });
        curY -= 14;
      }
      curY -= 10;
    }

    // ── Ingredients ──
    const ingResult = drawIngredients(page, pdfDoc, recipe.ingredients, fonts, curY, pages, fonts);
    curY = ingResult.y;
    page = ingResult.page;

    // ── Instructions ──
    const stepsResult = drawSteps(page, pdfDoc, recipe.steps, fonts, curY, pages, fonts);
    page = stepsResult.page;
  }

  // ── Draw footers on all pages ──
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    drawFooter(pages[i], fonts, i + 1, totalPages);
  }

  return await pdfDoc.save();
}
