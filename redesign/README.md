# Handoff: idriscooks.com Redesign

## Overview
A site-wide redesign direction for **idriscooks.com**, a personal recipe site. The current site reads like a generic moody-restaurant template — stock taglines, no food photography in the hero, category tiles where recipes should be, and a self-quote that undercuts credibility. This handoff proposes a quieter, editorial-cookbook aesthetic with a stronger voice and a real recipe-page layout.

The package contains:
- An annotated audit of the current homepage with 7 specific issues called out
- A proposed brand system (palette + type)
- Two hero directions
- A redesigned "featured" section that shows actual recipes
- Before/after copy with rationale
- A full individual-recipe page layout (where most of the site's value lives)

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these HTML designs in idriscooks.com's existing environment** (or the best framework choice if rebuilding) using its established patterns and component library. Treat the HTML as the visual + copy spec, not as files to ship.

The annotated "current site" board (`components/audit.jsx`) is for reference only — it's a recreation of what's there now, not something to build.

## Fidelity
**High-fidelity for layout, typography, color, and copy.** Exact hex values, font families, type sizes, and copy strings are intentional and should be matched.

**Lower-fidelity for imagery.** Photos are diagonal-stripe placeholders with descriptive labels (e.g. "overhead — braised short ribs, herbs, citrus zest"). Real food photography needs to be commissioned or sourced; the placeholder labels describe the intended shot.

## Screens / Views

### 1. Homepage — Hero (two directions to pick from)

**A · Editorial split** (`components/heroes.jsx → HeroEditorial`)
- Full-width nav bar (cream bg, ink type, "Idris cooks" wordmark with italic tomato "cooks")
- Two-column body: 1.1fr text / 1fr photo
- Left column padding: 72px 48px 48px 64px
- Eyebrow: JetBrains Mono 11px / 0.2em letter-spacing / olive `#6B7548`, with leading 24×1px rule
- Headline: Instrument Serif 124px / line-height 0.95 / "Cook *like* you mean it." — italic word in tomato `#C8472D`
- Sub: DM Sans 17px / opacity 0.75 / max-width 420px
- Primary CTA: ink bg `#1C1A17`, cream text, square corners, 16px 28px padding
- Secondary: underline link, 4px underline-offset
- Right column: full-bleed photo placeholder, with a 280px-wide cream callout card overlapping at `left: -48px; bottom: 56px` — top border 2px tomato

**B · Full-bleed photo** (`components/heroes.jsx → HeroFullBleed`)
- Dark mode: ink `#1C1A17` page, photo full-bleed at brightness 0.55
- Nav inverted (cream type)
- Content anchored bottom-left of viewport (padding-bottom 72px)
- Two-column bottom row (1.4fr / 1fr): headline left, body + CTAs right
- Eyebrow "Hi, I'm Idris." in soft peach `#F5B7A3`
- Headline: Instrument Serif 104px, italic peach for the word "good"
- Primary CTA: cream bg, ink text

### 2. Brand System (`components/system.jsx`)
Reference board, not a screen to build.

### 3. Featured / "This month's rotation" (`components/featured.jsx`)
Replaces the current "Curated for You" category-tile section.
- Cream `#F5EFE6` background, padding 72px 64px
- Header row with bottom border 1px ink:
  - Eyebrow + Instrument Serif 72px headline ("This month's *rotation*", italic word)
  - Right-aligned chip filter row: All / 30 min / Slow / One pan / Vegetarian (active = ink fill, inactive = 1px ink outline, all 999px radius)
- Three cards in a 1.3fr / 1fr / 1fr grid, gap 36
- Each card:
  - Top border 1px ink, padding-top 14
  - Mono header row with tag (olive or tomato) + time (ink @ 50%)
  - Photo placeholder below, 380px tall for the featured card, 240px for the others
  - Title in Instrument Serif (40px featured / 26px secondary), tight line-height
  - Optional 13px body note

### 4. Individual Recipe Page (`components/recipe-page.jsx`)
The most important screen — most traffic lives here.
- Cream page, 64px horizontal padding
- Breadcrumb in JetBrains Mono 11px olive
- Recipe title: Instrument Serif 88px, italic on the descriptor word
- Meta row: 12px Mono, 32px gap — total time, serves, last cooked date, star rating in tomato
- Two-column hero block (1.4fr / 1fr, gap 48):
  - Left: full-color hero photo, 520px tall
  - Right: ink-filled card, 32px padding, holds:
    - "The promise" — one sentence in Instrument Serif 28px, summarising why this recipe exists
    - Skip-to nav with dashed-bottom-border rows: Why this works / Ingredients / Method / Make-ahead / Comments
    - Tomato CTA "Start cook mode →" full-width at bottom
- Two-column body (1fr / 1.4fr, gap 64):
  - Ingredients column: Mono quantity in tomato (100px) + ingredient name; each row 12px padded with 1px @ 10% bottom border
  - Method column: numbered steps in 60px / 1fr grid; step number "01" in tomato Mono; step heading in Instrument Serif 22px; step body 14px / line-height 1.6 / opacity 0.85

### 5. Voice & Copy (`components/voice.jsx`)
Reference board only — but the before/after table is the single highest-impact change. Apply these rewrites everywhere:

| Before | After |
|---|---|
| Where Every Dish Tells A Story | A small archive of good things to cook. |
| The Art of Culinary Excellence | Tested until they aren't fussy. |
| Expert Chefs · Fresh Ingredients · Quick Recipes · Global Community | Three pillars: weeknight, weekend, project. |
| Discover recipes that transform ordinary ingredients into extraordinary experiences. | No life stories before the recipe. No 47-ingredient lists. |
| Self-quote band | Drop entirely, or replace with a real reader/press line. |

## Interactions & Behavior

- **Nav**: persistent across pages, transparent over photo hero (variant B), solid cream on cream-bg pages. Search opens a `⌘K` palette (out of scope for this handoff).
- **Hero CTA**: primary scrolls to / links to recipe index. Secondary is a text link to a longer about/story page.
- **Featured chips**: filter the three cards client-side by tag. Active chip swaps to ink fill.
- **Recipe page skip-to links**: smooth-scroll to anchor sections.
- **"Start cook mode"**: opens a fullscreen step-by-step view (one method step at a time, large type, tap to advance). Out of scope for v1 — leave as a placeholder.
- **Star rating + cook count**: real data from a backend; show 0 state gracefully ("First to cook this →").
- **Hover states**: underline-on-hover for inline links; cards lift 2px with a 1px ink border on hover; CTAs darken ink to `#0F0E0C`.

## State Management
- **Featured filter**: single `activeFilter` string, default `"all"`.
- **Recipe page**: `cookModeOpen` boolean, `currentStep` integer.
- **Search palette**: `searchOpen` boolean, `query` string, `results` array.
- Recipes are static content — markdown/MDX or a CMS. No client-side fetching needed for the page itself.

## Design Tokens

### Colors
```
--cream:      #F5EFE6   /* page surface */
--parchment:  #E8DFD0   /* card surface, alt section bg */
--ink:        #1C1A17   /* type, lines */
--tomato:     #C8472D   /* one accent — used sparingly */
--peach:      #F5B7A3   /* tomato on dark backgrounds */
--olive:      #6B7548   /* secondary, eyebrows, tags */
--ink-60:     rgba(28,26,23,0.6)
--ink-50:     rgba(28,26,23,0.5)
--ink-line:   rgba(28,26,23,0.1)
```

### Typography
- **Display**: `'Instrument Serif', Georgia, serif` — weight 400, supports italic
- **Body / UI**: `'DM Sans', system-ui, sans-serif` — 400/500/600/700
- **Mono / labels**: `'JetBrains Mono', monospace` — 400/500

Type scale used:
- Display XL: 124px / 0.95 / -0.01em
- Display L: 104px / 1
- Display M: 88px / 1
- Display S: 72px / 1
- Heading: 40px / 1.1
- Subhead: 28px / 1.2
- Body L: 17px / 1.5
- Body: 14–15px / 1.5–1.6
- Eyebrow / Mono label: 11px / 0.2em letter-spacing / uppercase

### Spacing
8px base. Section padding 64–72px. Card padding 24–32px. Grid gaps 16 / 24 / 36 / 48 / 64.

### Borders & Radius
- Lines: 1px ink, or 1px @ 10% ink for subtle dividers
- Pill chips: 999px
- Buttons: **0px** (square — intentional, part of the editorial look)
- Cards: 0–12px depending on context (most are square in the editorial system)

### Shadows
None used. The aesthetic is flat / printed.

## Assets

- **Fonts**: Google Fonts — Instrument Serif, DM Sans, JetBrains Mono (already loaded via `<link>` in the HTML).
- **Imagery**: every photo is a placeholder. Each placeholder carries a label describing the intended shot. Real photography needs commissioning.
- **Logo**: wordmark only — "Idris" in Instrument Serif + italic "cooks" in tomato. No icon mark.

## Files

Source files in this bundle:
- `Idris Cooks Audit.html` — entry point; mounts the design canvas
- `design-canvas.jsx` — canvas/artboard host (presentation only — not part of the design)
- `components/audit.jsx` — annotated recreation of the current site
- `components/system.jsx` — palette + type system
- `components/heroes.jsx` — `HeroEditorial`, `HeroFullBleed`
- `components/featured.jsx` — `FeaturedBoard`, `RecipeCard`
- `components/voice.jsx` — copy rewrite reference
- `components/recipe-page.jsx` — full individual-recipe layout

To open: load `Idris Cooks Audit.html` in a browser. Pan/zoom across the artboards; click any artboard to focus fullscreen.
