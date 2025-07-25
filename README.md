# Idris Cooks App

A modern, full-stack recipe platform built with Next.js, Drizzle ORM, and Tailwind CSS. Discover, save, and share delicious recipes, with features for both guests and authenticated users.

## Features

- **Browse Recipes:**
  - View a curated list of recipes with images, descriptions, and tags.
  - Unauthenticated users can preview a limited number of recipes.
- **Recipe Details:**
  - View detailed recipe pages with ingredients, instructions, and tags.
  - Recipe images and basic info are visible to all; full content is gated for logged-in users.
- **Authentication:**
  - Sign up or log in with Google or email/password.
  - Authenticated users can access all recipes and features.
- **Favorites:**
  - Save your favorite recipes for quick access (requires login).
- **PDF Export:**
  - Download all visible recipes as a PDF (login required; unauthenticated users are prompted to log in).
- **Responsive Design:**
  - Fully responsive and mobile-friendly UI.
- **SEO Optimized:**
  - Server-side rendering and semantic HTML for optimal search engine visibility.
- **Content Gating:**
  - Full recipe content is only sent to the browser for authenticated users (true server-side gating).

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database (for Drizzle ORM)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/idrisreact/recipe-idriscooks.git
   cd recipe-idriscooks
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your database and auth provider credentials.

4. **Run database migrations and seed data:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack
- **Next.js 15** (App Router, SSR, API routes)
- **Drizzle ORM** (PostgreSQL)
- **Tailwind CSS** (utility-first styling)
- **React 19**
- **GSAP** (animations)
- **jsPDF & html2canvas** (PDF export)
- **better-auth** (authentication)

## Project Structure
- `app/` — Next.js app directory (routing, pages)
- `src/components/` — UI and feature components
- `src/db/` — Database schema and Drizzle setup
- `public/` — Static assets (images, icons)
- `scripts/` — Seed scripts

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
