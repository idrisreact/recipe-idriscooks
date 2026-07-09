import { PDFDocument, PDFFont, PDFPage, PDFImage, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import { Recipe } from '@/src/types/recipes.types';

// ─── Page Geometry ───────────────────────────────────────────────────────────

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = { top: 96, right: 64, bottom: 84, left: 64 };
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN.left - MARGIN.right;
const CONTENT_RIGHT = PAGE_WIDTH - MARGIN.right;

// ─── Editorial Palette (mirrors app/globals.css) ─────────────────────────────

const COLORS = {
  cream: rgb(0.961, 0.937, 0.902), // #F5EFE6
  ink: rgb(0.11, 0.102, 0.09), // #1C1A17
  tomato: rgb(0.784, 0.278, 0.176), // #C8472D
  peach: rgb(0.961, 0.718, 0.639), // #F5B7A3
  olive: rgb(0.42, 0.459, 0.282), // #6B7548
  // ink at reduced opacity, pre-blended over cream (predictable in print)
  ink75: rgb(0.323, 0.311, 0.293),
  ink50: rgb(0.535, 0.52, 0.496),
  line: rgb(0.876, 0.854, 0.821), // --ink-line over cream
  // cream at reduced opacity, pre-blended over ink (fallback cover)
  cream70: rgb(0.705, 0.687, 0.659),
  creamLine: rgb(0.237, 0.227, 0.212), // --cream-15 over ink
};

// JetBrains Mono labels are tracked out, matching the site's .eyebrow class
const EYEBROW_TRACKING_EM = 0.18;

interface Fonts {
  serif: PDFFont; // Instrument Serif — display
  serifItalic: PDFFont; // Instrument Serif Italic — descriptions
  sans: PDFFont; // DM Sans — body
  sansBold: PDFFont; // DM Sans Bold — emphasis
  mono: PDFFont; // JetBrains Mono — labels, folios
  monoMedium: PDFFont; // JetBrains Mono Medium — eyebrows
}

interface BookContext {
  doc: PDFDocument;
  fonts: Fonts;
  pages: PDFPage[]; // pages counted for folios; index in this array = page number
  collectionTitle: string;
}

// ─── Text Utilities ──────────────────────────────────────────────────────────

/** Strip characters outside the embedded fonts' latin coverage. */
function sanitize(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E -ſ–—‘’“”…·]/g, '')
    .trim();
}

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

function truncateToWidth(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && font.widthOfTextAtSize(`${result}…`, size) > maxWidth) {
    result = result.slice(0, -1).trimEnd();
  }
  return `${result}…`;
}

function trackedWidth(text: string, font: PDFFont, size: number, trackingEm: number): number {
  if (!text) return 0;
  return font.widthOfTextAtSize(text, size) + trackingEm * size * (text.length - 1);
}

interface TrackedTextOptions {
  x: number;
  y: number;
  size: number;
  font: PDFFont;
  color: ReturnType<typeof rgb>;
  trackingEm?: number;
}

/** Draw letter-spaced text (pdf-lib has no native tracking). Returns the end x. */
function drawTracked(page: PDFPage, text: string, options: TrackedTextOptions): number {
  const { x, y, size, font, color, trackingEm = EYEBROW_TRACKING_EM } = options;
  const tracking = trackingEm * size;
  let curX = x;
  for (const char of text) {
    page.drawText(char, { x: curX, y, size, font, color });
    curX += font.widthOfTextAtSize(char, size) + tracking;
  }
  return text ? curX - tracking : curX;
}

// ─── Page Chrome ─────────────────────────────────────────────────────────────

function paintBackground(page: PDFPage, color = COLORS.cream) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color });
}

function drawRunningHead(page: PDFPage, fonts: Fonts, rightText: string) {
  const y = PAGE_HEIGHT - 44;
  const size = 6.5;

  drawTracked(page, 'IDRIS COOKS', {
    x: MARGIN.left,
    y,
    size,
    font: fonts.monoMedium,
    color: COLORS.ink50,
  });

  const right = truncateToWidth(rightText.toUpperCase(), fonts.mono, size, CONTENT_WIDTH / 2);
  const rightWidth = trackedWidth(right, fonts.mono, size, EYEBROW_TRACKING_EM);
  drawTracked(page, right, {
    x: CONTENT_RIGHT - rightWidth,
    y,
    size,
    font: fonts.mono,
    color: COLORS.ink50,
  });

  page.drawLine({
    start: { x: MARGIN.left, y: y - 9 },
    end: { x: CONTENT_RIGHT, y: y - 9 },
    thickness: 0.5,
    color: COLORS.line,
  });
}

function drawFolio(page: PDFPage, fonts: Fonts, pageNumber: number) {
  const text = `— ${pageNumber} —`;
  const width = fonts.mono.widthOfTextAtSize(text, 8);
  page.drawText(text, {
    x: (PAGE_WIDTH - width) / 2,
    y: 42,
    size: 8,
    font: fonts.mono,
    color: COLORS.ink50,
  });
}

/** Add a cream body page with the running head; used for chapter starts and overflow. */
function addBodyPage(ctx: BookContext): PDFPage {
  const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  paintBackground(page);
  drawRunningHead(page, ctx.fonts, ctx.collectionTitle);
  ctx.pages.push(page);
  return page;
}

function ensureSpace(
  ctx: BookContext,
  page: PDFPage,
  y: number,
  needed: number
): { page: PDFPage; y: number } {
  if (y - needed < MARGIN.bottom) {
    return { page: addBodyPage(ctx), y: PAGE_HEIGHT - MARGIN.top };
  }
  return { page, y };
}

/** Eyebrow label with a hairline rule filling the rest of the content width. */
function drawSectionEyebrow(page: PDFPage, fonts: Fonts, label: string, y: number): number {
  const endX = drawTracked(page, label.toUpperCase(), {
    x: MARGIN.left,
    y,
    size: 8,
    font: fonts.monoMedium,
    color: COLORS.olive,
  });
  page.drawLine({
    start: { x: endX + 12, y: y + 2.5 },
    end: { x: CONTENT_RIGHT, y: y + 2.5 },
    thickness: 0.5,
    color: COLORS.line,
  });
  return y - 24;
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

// ─── Cover ───────────────────────────────────────────────────────────────────

async function loadCoverImage(doc: PDFDocument): Promise<PDFImage | null> {
  try {
    const file = path.join(process.cwd(), 'public', 'images', 'idris-cooks-book-cover.jpg');
    return await doc.embedJpg(fs.readFileSync(file));
  } catch {
    return null;
  }
}

/** Full-bleed cover artwork, scaled to cover the page and cropped evenly. */
function drawImageCover(page: PDFPage, image: PDFImage) {
  const scale = Math.max(PAGE_WIDTH / image.width, PAGE_HEIGHT / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  page.drawImage(image, {
    x: (PAGE_WIDTH - width) / 2,
    y: (PAGE_HEIGHT - height) / 2,
    width,
    height,
  });
}

/** Typographic ink cover, used only if the cover artwork is missing. */
function drawFallbackCover(page: PDFPage, fonts: Fonts, title: string, count: number) {
  paintBackground(page, COLORS.ink);

  // Double hairline frame, book-cover style
  for (const inset of [20, 26]) {
    page.drawRectangle({
      x: inset,
      y: inset,
      width: PAGE_WIDTH - inset * 2,
      height: PAGE_HEIGHT - inset * 2,
      borderColor: COLORS.creamLine,
      borderWidth: 0.75,
    });
  }

  const centerX = PAGE_WIDTH / 2;
  let y = PAGE_HEIGHT / 2 + 150;

  const brand = 'IDRIS COOKS';
  const brandWidth = trackedWidth(brand, fonts.monoMedium, 9, EYEBROW_TRACKING_EM);
  drawTracked(page, brand, {
    x: centerX - brandWidth / 2,
    y,
    size: 9,
    font: fonts.monoMedium,
    color: COLORS.peach,
  });
  y -= 26;

  page.drawLine({
    start: { x: centerX - 20, y },
    end: { x: centerX + 20, y },
    thickness: 1,
    color: COLORS.peach,
  });
  y -= 60;

  const titleLines = wrapText(title, fonts.serif, 42, CONTENT_WIDTH - 40);
  for (const line of titleLines) {
    const lineWidth = fonts.serif.widthOfTextAtSize(line, 42);
    page.drawText(line, {
      x: centerX - lineWidth / 2,
      y,
      size: 42,
      font: fonts.serif,
      color: COLORS.cream,
    });
    y -= 50;
  }
  y -= 8;

  const subtitle = `A collection of ${count} recipe${count === 1 ? '' : 's'}`;
  const subtitleWidth = fonts.serifItalic.widthOfTextAtSize(subtitle, 14);
  page.drawText(subtitle, {
    x: centerX - subtitleWidth / 2,
    y,
    size: 14,
    font: fonts.serifItalic,
    color: COLORS.cream70,
  });

  const site = 'IDRISCOOKS.COM';
  const siteWidth = trackedWidth(site, fonts.monoMedium, 7.5, EYEBROW_TRACKING_EM);
  drawTracked(page, site, {
    x: centerX - siteWidth / 2,
    y: 112,
    size: 7.5,
    font: fonts.monoMedium,
    color: COLORS.peach,
  });
}

// ─── Title Page ──────────────────────────────────────────────────────────────

function drawTitlePage(page: PDFPage, fonts: Fonts, title: string, count: number) {
  const centerX = PAGE_WIDTH / 2;
  let y = PAGE_HEIGHT / 2 + 130;

  const brand = 'IDRIS COOKS';
  const brandWidth = trackedWidth(brand, fonts.monoMedium, 9, EYEBROW_TRACKING_EM);
  drawTracked(page, brand, {
    x: centerX - brandWidth / 2,
    y,
    size: 9,
    font: fonts.monoMedium,
    color: COLORS.olive,
  });
  y -= 26;

  page.drawLine({
    start: { x: centerX - 20, y },
    end: { x: centerX + 20, y },
    thickness: 1.5,
    color: COLORS.tomato,
  });
  y -= 56;

  const titleLines = wrapText(title, fonts.serif, 38, CONTENT_WIDTH - 40);
  for (const line of titleLines) {
    const lineWidth = fonts.serif.widthOfTextAtSize(line, 38);
    page.drawText(line, {
      x: centerX - lineWidth / 2,
      y,
      size: 38,
      font: fonts.serif,
      color: COLORS.ink,
    });
    y -= 46;
  }
  y -= 8;

  const subtitle = `A collection of ${count} recipe${count === 1 ? '' : 's'}`;
  const subtitleWidth = fonts.serifItalic.widthOfTextAtSize(subtitle, 14);
  page.drawText(subtitle, {
    x: centerX - subtitleWidth / 2,
    y,
    size: 14,
    font: fonts.serifItalic,
    color: COLORS.ink75,
  });

  const site = 'IDRISCOOKS.COM';
  const siteWidth = trackedWidth(site, fonts.monoMedium, 7.5, EYEBROW_TRACKING_EM);
  drawTracked(page, site, {
    x: centerX - siteWidth / 2,
    y: 112,
    size: 7.5,
    font: fonts.monoMedium,
    color: COLORS.olive,
  });

  const dateText = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateWidth = fonts.mono.widthOfTextAtSize(dateText, 7);
  page.drawText(dateText, {
    x: centerX - dateWidth / 2,
    y: 94,
    size: 7,
    font: fonts.mono,
    color: COLORS.ink50,
  });
}

// ─── Table of Contents ───────────────────────────────────────────────────────

const TOC_ROW_HEIGHT = 26;
const TOC_ROWS_FIRST_PAGE = 19;
const TOC_ROWS_NEXT_PAGE = 25;

function tocPageCount(recipeCount: number): number {
  if (recipeCount <= TOC_ROWS_FIRST_PAGE) return 1;
  return 1 + Math.ceil((recipeCount - TOC_ROWS_FIRST_PAGE) / TOC_ROWS_NEXT_PAGE);
}

interface TocEntry {
  title: string;
  pageNumber: number;
}

function drawTocEntry(page: PDFPage, fonts: Fonts, entry: TocEntry, index: number, y: number) {
  const numberText = String(index + 1).padStart(2, '0');
  drawTracked(page, numberText, {
    x: MARGIN.left,
    y,
    size: 8,
    font: fonts.monoMedium,
    color: COLORS.tomato,
    trackingEm: 0.08,
  });

  const pageNumText = String(entry.pageNumber);
  const pageNumWidth = fonts.mono.widthOfTextAtSize(pageNumText, 9);
  const pageNumX = CONTENT_RIGHT - pageNumWidth;

  const titleX = MARGIN.left + 32;
  const maxTitleWidth = pageNumX - titleX - 48;
  const title = truncateToWidth(entry.title, fonts.serif, 13, maxTitleWidth);
  page.drawText(title, { x: titleX, y, size: 13, font: fonts.serif, color: COLORS.ink });

  // Dot leaders between title and page number
  const titleEnd = titleX + fonts.serif.widthOfTextAtSize(title, 13);
  for (let x = titleEnd + 10; x <= pageNumX - 10; x += 5) {
    page.drawText('.', { x, y, size: 8, font: fonts.mono, color: COLORS.ink50 });
  }

  page.drawText(pageNumText, {
    x: pageNumX,
    y,
    size: 9,
    font: fonts.mono,
    color: COLORS.ink75,
  });
}

function drawContents(tocPages: PDFPage[], fonts: Fonts, entries: TocEntry[]) {
  const firstPage = tocPages[0];

  let y = PAGE_HEIGHT - 150;
  drawTracked(firstPage, 'THE COLLECTION', {
    x: MARGIN.left,
    y,
    size: 8,
    font: fonts.monoMedium,
    color: COLORS.olive,
  });
  y -= 40;

  firstPage.drawText('Contents', {
    x: MARGIN.left,
    y,
    size: 34,
    font: fonts.serif,
    color: COLORS.ink,
  });
  y -= 18;

  firstPage.drawLine({
    start: { x: MARGIN.left, y },
    end: { x: CONTENT_RIGHT, y },
    thickness: 0.5,
    color: COLORS.line,
  });
  y -= 34;

  let pageIndex = 0;
  let rowsLeft = TOC_ROWS_FIRST_PAGE;

  for (let i = 0; i < entries.length; i++) {
    if (rowsLeft === 0) {
      pageIndex += 1;
      rowsLeft = TOC_ROWS_NEXT_PAGE;
      y = PAGE_HEIGHT - MARGIN.top;
    }
    drawTocEntry(tocPages[pageIndex], fonts, entries[i], i, y);
    y -= TOC_ROW_HEIGHT;
    rowsLeft -= 1;
  }
}

// ─── Recipe Chapter ──────────────────────────────────────────────────────────

function drawChapterOpener(
  page: PDFPage,
  fonts: Fonts,
  recipe: Recipe,
  index: number,
  total: number
): number {
  let y = PAGE_HEIGHT - MARGIN.top - 8;

  const eyebrow = `RECIPE NO. ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  drawTracked(page, eyebrow, {
    x: MARGIN.left,
    y,
    size: 8,
    font: fonts.monoMedium,
    color: COLORS.olive,
  });
  y -= 34;

  const titleLines = wrapText(sanitize(recipe.title), fonts.serif, 30, CONTENT_WIDTH);
  for (const line of titleLines) {
    page.drawText(line, { x: MARGIN.left, y, size: 30, font: fonts.serif, color: COLORS.ink });
    y -= 38;
  }
  y += 14;

  // Short tomato accent rule, echoing the site's single-accent style
  page.drawLine({
    start: { x: MARGIN.left, y },
    end: { x: MARGIN.left + 28, y },
    thickness: 1.5,
    color: COLORS.tomato,
  });
  y -= 24;

  const description = sanitize(recipe.description);
  if (description) {
    const descLines = wrapText(description, fonts.serifItalic, 12, CONTENT_WIDTH - 40);
    for (const line of descLines) {
      page.drawText(line, {
        x: MARGIN.left,
        y,
        size: 12,
        font: fonts.serifItalic,
        color: COLORS.ink75,
      });
      y -= 17;
    }
    y -= 10;
  }

  return y;
}

function drawMetaBar(page: PDFPage, fonts: Fonts, recipe: Recipe, y: number): number {
  const items = [
    { label: 'SERVES', value: `${recipe.servings}` },
    { label: 'PREP TIME', value: `${recipe.prepTime} min` },
    { label: 'COOK TIME', value: `${recipe.cookTime} min` },
  ];
  const columnWidth = CONTENT_WIDTH / items.length;
  const barHeight = 46;

  page.drawLine({
    start: { x: MARGIN.left, y },
    end: { x: CONTENT_RIGHT, y },
    thickness: 0.5,
    color: COLORS.line,
  });

  for (let i = 0; i < items.length; i++) {
    const x = MARGIN.left + i * columnWidth;

    drawTracked(page, items[i].label, {
      x,
      y: y - 16,
      size: 6.5,
      font: fonts.monoMedium,
      color: COLORS.ink50,
    });
    page.drawText(items[i].value, {
      x,
      y: y - 36,
      size: 15,
      font: fonts.serif,
      color: COLORS.ink,
    });

    if (i > 0) {
      page.drawLine({
        start: { x: x - 18, y: y - 8 },
        end: { x: x - 18, y: y - barHeight + 8 },
        thickness: 0.5,
        color: COLORS.line,
      });
    }
  }

  page.drawLine({
    start: { x: MARGIN.left, y: y - barHeight },
    end: { x: CONTENT_RIGHT, y: y - barHeight },
    thickness: 0.5,
    color: COLORS.line,
  });

  return y - barHeight - 18;
}

function drawTags(page: PDFPage, fonts: Fonts, tags: string[], y: number): number {
  if (!tags || tags.length === 0) return y;

  const line = truncateToWidth(
    sanitize(tags.join(' · ')).toUpperCase(),
    fonts.monoMedium,
    7,
    CONTENT_WIDTH / (1 + EYEBROW_TRACKING_EM) // rough allowance for tracking
  );
  drawTracked(page, line, {
    x: MARGIN.left,
    y,
    size: 7,
    font: fonts.monoMedium,
    color: COLORS.olive,
  });
  return y - 24;
}

function drawPhoto(page: PDFPage, image: PDFImage, y: number): number {
  const maxHeight = 230;
  const aspect = image.width / image.height;
  let width = CONTENT_WIDTH;
  let height = width / aspect;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }
  const x = MARGIN.left + (CONTENT_WIDTH - width) / 2;

  page.drawImage(image, { x, y: y - height, width, height });
  // Flat hairline frame — radius 0, like every surface on the site
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    borderColor: COLORS.ink,
    borderWidth: 0.75,
  });

  return y - height - 26;
}

function drawIngredients(
  ctx: BookContext,
  page: PDFPage,
  ingredients: Recipe['ingredients'],
  y: number
): { page: PDFPage; y: number } {
  if (!ingredients || ingredients.length === 0) return { page, y };

  const rowHeight = 20;
  ({ page, y } = ensureSpace(ctx, page, y, 24 + rowHeight * 2));
  y = drawSectionEyebrow(page, ctx.fonts, 'Ingredients', y);

  const useColumns = ingredients.length > 8;
  const gutter = 24;
  const columnWidth = useColumns ? (CONTENT_WIDTH - gutter) / 2 : CONTENT_WIDTH;
  const rows = useColumns ? Math.ceil(ingredients.length / 2) : ingredients.length;

  for (let row = 0; row < rows; row++) {
    // Second-to-last row reserves room for the last one, so a single row never orphans
    const needed = row === rows - 2 ? rowHeight * 2 : rowHeight;
    ({ page, y } = ensureSpace(ctx, page, y, needed));

    const rowItems = useColumns
      ? [ingredients[row], ingredients[rows + row]].filter(Boolean)
      : [ingredients[row]];

    for (let col = 0; col < rowItems.length; col++) {
      const ingredient = rowItems[col];
      const x = MARGIN.left + col * (columnWidth + gutter);

      const quantity = sanitize(`${ingredient.quantity} ${ingredient.unit}`);
      const quantityWidth = ctx.fonts.sansBold.widthOfTextAtSize(quantity, 9.5);
      page.drawText(quantity, {
        x,
        y,
        size: 9.5,
        font: ctx.fonts.sansBold,
        color: COLORS.ink,
      });

      const name = truncateToWidth(
        sanitize(ingredient.name),
        ctx.fonts.sans,
        9.5,
        columnWidth - quantityWidth - 10
      );
      page.drawText(name, {
        x: x + quantityWidth + 10,
        y,
        size: 9.5,
        font: ctx.fonts.sans,
        color: COLORS.ink75,
      });

      page.drawLine({
        start: { x, y: y - 6 },
        end: { x: x + columnWidth, y: y - 6 },
        thickness: 0.3,
        color: COLORS.line,
      });
    }

    y -= rowHeight;
  }

  return { page, y: y - 8 };
}

function drawMethod(
  ctx: BookContext,
  page: PDFPage,
  steps: string[],
  y: number
): { page: PDFPage; y: number } {
  if (!steps || steps.length === 0) return { page, y };

  const lineHeight = 15;
  ({ page, y } = ensureSpace(ctx, page, y, 24 + lineHeight * 2));
  y = drawSectionEyebrow(page, ctx.fonts, 'Method', y);

  const numberColumnWidth = ctx.fonts.serif.widthOfTextAtSize('00', 20) + 14;
  const textX = MARGIN.left + numberColumnWidth;
  const textMaxWidth = CONTENT_RIGHT - textX;

  for (let i = 0; i < steps.length; i++) {
    const lines = wrapText(sanitize(steps[i]), ctx.fonts.sans, 10, textMaxWidth);

    // Keep the numeral and at least two lines together
    const keepTogether = Math.min(lines.length, 2) * lineHeight + 14;
    ({ page, y } = ensureSpace(ctx, page, y, keepTogether));

    // Large serif numeral in tomato, sharing the first line's baseline
    page.drawText(`${i + 1}`, {
      x: MARGIN.left,
      y,
      size: 20,
      font: ctx.fonts.serif,
      color: COLORS.tomato,
    });

    for (const line of lines) {
      ({ page, y } = ensureSpace(ctx, page, y, lineHeight));
      page.drawText(line, { x: textX, y, size: 10, font: ctx.fonts.sans, color: COLORS.ink75 });
      y -= lineHeight;
    }
    y -= 14;
  }

  return { page, y };
}

function drawRecipeChapter(
  ctx: BookContext,
  recipe: Recipe,
  image: PDFImage | null,
  index: number,
  total: number
) {
  let page = addBodyPage(ctx);

  let y = drawChapterOpener(page, ctx.fonts, recipe, index, total);
  y = drawMetaBar(page, ctx.fonts, recipe, y);
  y = drawTags(page, ctx.fonts, recipe.tags, y);

  if (image) {
    ({ page, y } = ensureSpace(ctx, page, y, 120));
    y = drawPhoto(page, image, y);
  }

  ({ page, y } = drawIngredients(ctx, page, recipe.ingredients, y));
  y -= 10;
  drawMethod(ctx, page, recipe.steps, y);
}

// ─── Colophon ────────────────────────────────────────────────────────────────

function drawColophon(doc: PDFDocument, fonts: Fonts) {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  paintBackground(page);

  const centerX = PAGE_WIDTH / 2;
  let y = PAGE_HEIGHT / 2 + 40;

  page.drawLine({
    start: { x: centerX - 14, y },
    end: { x: centerX + 14, y },
    thickness: 1.5,
    color: COLORS.tomato,
  });
  y -= 36;

  const closing = 'Cooked with love.';
  const closingWidth = fonts.serifItalic.widthOfTextAtSize(closing, 17);
  page.drawText(closing, {
    x: centerX - closingWidth / 2,
    y,
    size: 17,
    font: fonts.serifItalic,
    color: COLORS.ink,
  });
  y -= 30;

  const site = 'IDRISCOOKS.COM';
  const siteWidth = trackedWidth(site, fonts.monoMedium, 8, EYEBROW_TRACKING_EM);
  drawTracked(page, site, {
    x: centerX - siteWidth / 2,
    y,
    size: 8,
    font: fonts.monoMedium,
    color: COLORS.olive,
  });
}

// ─── Fonts ───────────────────────────────────────────────────────────────────

async function loadFonts(doc: PDFDocument): Promise<Fonts> {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  const embed = (file: string) =>
    doc.embedFont(fs.readFileSync(path.join(fontsDir, file)), { subset: true });

  const [serif, serifItalic, sans, sansBold, mono, monoMedium] = await Promise.all([
    embed('InstrumentSerif-Regular.ttf'),
    embed('InstrumentSerif-Italic.ttf'),
    embed('DMSans-Regular.ttf'),
    embed('DMSans-Bold.ttf'),
    embed('JetBrainsMono-Regular.ttf'),
    embed('JetBrainsMono-Medium.ttf'),
  ]);

  return { serif, serifItalic, sans, sansBold, mono, monoMedium };
}

// ─── Main Entry ──────────────────────────────────────────────────────────────

export async function buildRecipePDF(recipes: Recipe[], title: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fonts = await loadFonts(doc);

  const collectionTitle = sanitize(title) || 'My Favorite Recipes';
  doc.setTitle(collectionTitle);
  doc.setAuthor('Idris Cooks');
  doc.setCreator('idriscooks.com');

  const ctx: BookContext = { doc, fonts, pages: [], collectionTitle };

  // ── Cover (unnumbered) ──
  const cover = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.pages.push(cover);
  const coverImage = await loadCoverImage(doc);
  if (coverImage) {
    drawImageCover(cover, coverImage);
  } else {
    drawFallbackCover(cover, fonts, collectionTitle, recipes.length);
  }

  // ── Title page (unnumbered, like a book's half title) ──
  const titlePage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  paintBackground(titlePage);
  ctx.pages.push(titlePage);
  drawTitlePage(titlePage, fonts, collectionTitle, recipes.length);

  // ── Contents placeholders (filled once chapter page numbers are known) ──
  const tocPages: PDFPage[] = [];
  for (let i = 0; i < tocPageCount(recipes.length); i++) {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    paintBackground(page);
    ctx.pages.push(page);
    tocPages.push(page);
  }

  // ── Fetch all recipe photos in parallel ──
  const imageResults = await Promise.allSettled(
    recipes.map((r) => (r.imageUrl ? fetchAndEmbedImage(doc, r.imageUrl) : Promise.resolve(null)))
  );
  const images = imageResults.map((r) => (r.status === 'fulfilled' ? r.value : null));

  // ── Recipe chapters ──
  const tocEntries: TocEntry[] = [];
  for (let i = 0; i < recipes.length; i++) {
    tocEntries.push({ title: sanitize(recipes[i].title), pageNumber: ctx.pages.length });
    drawRecipeChapter(ctx, recipes[i], images[i], i, recipes.length);
  }

  drawContents(tocPages, fonts, tocEntries);

  // ── Folios: a page's number is its index; cover and title page stay bare ──
  for (let i = 2; i < ctx.pages.length; i++) {
    drawFolio(ctx.pages[i], fonts, i);
  }

  drawColophon(doc, fonts);

  return await doc.save();
}
