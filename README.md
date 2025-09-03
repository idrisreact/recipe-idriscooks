# Idris Cooks App

A modern, full-stack recipe platform built with Next.js, Drizzle ORM, and Tailwind CSS. Discover, save, and share delicious recipes with smooth scroll animations and an elegant user experience.

## Features

- **Browse Recipes:**
  - Interactive home page with popular and recent recipes sections
  - Smooth scroll animations powered by GSAP
  - Search and filter recipes by tags, cooking time, and more
  - Responsive grid/list view options
- **Recipe Discovery:**
  - Most popular recipes section with real-time data
  - Recent recipes with animated cards and hover effects
  - Advanced filtering and sorting capabilities
- **Recipe Details:**
  - Detailed recipe pages with ingredients, instructions, and nutritional info
  - Server-side content gating - full content only for authenticated users
  - Interactive recipe cards with preview, share, and favorite actions
- **Authentication & User Features:**
  - Google OAuth and email/password authentication via better-auth
  - User favorites system with persistent storage
  - Subscription-based premium features
- **Advanced Functionality:**
  - PDF export of recipes with custom formatting
  - Real-time search with debouncing
  - Tag-based recipe organization
- **UI/UX Excellence:**
  - Murakamicity design system with consistent styling
  - Fully responsive mobile-first design
  - GSAP-powered scroll animations and micro-interactions
  - Loading states and error boundaries

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
   - Copy `.env.example` to `.env` and fill in your database and auth provider credentials.

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
- **Next.js 15** (App Router, SSR, API routes, Turbopack)
- **React 19** (Latest React with concurrent features)
- **TypeScript** (Full type safety)
- **Drizzle ORM** (Type-safe PostgreSQL queries)
- **better-auth** (Modern authentication with Google OAuth)
- **TanStack Query** (Server state management and caching)
- **Zustand** (Client-side state management)
- **Tailwind CSS** (Utility-first styling with custom design system)
- **GSAP** (High-performance animations and scroll triggers)
- **jsPDF & html2canvas** (Client-side PDF generation)
- **Vitest** (Unit testing framework)
- **Playwright** (End-to-end testing)
- **Storybook** (Component development and documentation)

## Project Structure
```
├── app/                          # Next.js App Router
│   ├── (root)/                  # Main application routes
│   │   ├── page.tsx             # Home page with hero and features
│   │   └── recipes/             # Recipe-related pages
│   ├── api/                     # API routes
│   │   └── recipes/             # Recipe CRUD operations
│   └── layout.tsx               # Root layout with providers
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # Base UI components (Button, Card, etc.)
│   │   ├── layout/              # Layout components (Header, Footer)
│   │   ├── recipe-server-component/  # Server-side recipe components
│   │   ├── recent-recipes-section.tsx  # Animated recent recipes
│   │   └── features-section.tsx # Home page features
│   ├── db/                      # Database layer
│   │   ├── schemas/             # Drizzle schema definitions
│   │   └── index.ts             # Database connection
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-recipes.ts       # Recipe data fetching
│   │   └── use-auth.ts          # Authentication logic
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
├── tests/                       # End-to-end tests
├── scripts/                     # Database seeding scripts
├── data/                        # Seed data (recipe.json)
├── auth-schema.ts              # Authentication schema
├── drizzle.config.ts           # Drizzle ORM configuration
└── CLAUDE.md                   # Development instructions
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run drizzle-studio` - Open Drizzle Studio (database GUI)
- `npm run storybook` - Start Storybook development server
- `npm run test` - Run unit tests with Vitest
- `npx playwright test` - Run end-to-end tests

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
