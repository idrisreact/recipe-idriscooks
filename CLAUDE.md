# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build` 
- **Lint**: `npm run lint`
- **Start production**: `npm start`
- **Database migrations**: `npm run db:migrate`
- **Seed database**: `npm run db:seed`
- **Database studio**: `npm run drizzle-studio`
- **Storybook**: `npm run storybook` (runs on port 6006)
- **Build Storybook**: `npm run build-storybook`

## Architecture Overview

This is a Next.js 15 recipe platform using the App Router with server-side content gating for authenticated users.

### Core Technologies
- **Framework**: Next.js 15 with App Router and React 19
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: better-auth with Google OAuth and email/password
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand + TanStack Query for server state
- **Testing**: Vitest with Storybook integration and Playwright
- **Animations**: GSAP

### Key Architecture Patterns

**Authentication Flow**:
- Auth configuration in `src/utils/auth.ts` using better-auth
- Database schemas in `auth-schema.ts` and `src/db/schemas/`
- Client-side auth utilities in `src/utils/auth-client.ts`
- Auth hooks in `src/hooks/use-auth.ts`

**Database Layer**:
- Drizzle config in `drizzle.config.ts` pointing to `src/db/schemas/index.ts`
- Database connection in `src/db/index.ts` with environment-specific SSL config
- Schemas split by domain: `recipe.schema.ts`, `user.schema.ts`, `favorite-recipes.schema.ts`
- Migration files in `drizzle/` directory

**Server-Side Content Gating**:
- Recipe content is conditionally rendered server-side based on auth status
- Unauthenticated users see limited preview content
- Full recipe details only sent to authenticated users' browsers
- API routes in `app/api/` handle server-side operations

**Component Architecture**:
- UI components in `src/components/ui/` (Button, Form, Input, etc.)
- Feature components organized by domain in `src/components/`
- Server components in `src/components/recipe-server-component/`
- Layout components in `src/components/layout/`

**State Management**:
- TanStack Query for server state (recipes, favorites)
- Custom hooks in `src/hooks/` for data fetching and auth
- Zustand for client state management

### Important File Locations

- Database schemas: `src/db/schemas/index.ts`
- Auth configuration: `src/utils/auth.ts` and `auth-schema.ts`
- Recipe types: `src/types/recipes.types.ts`
- Main layout: `app/layout.tsx` with ReactQueryProvider wrapper
- Seed data: `data/recipe.json` with seeding script in `scripts/seed-recipes.ts`

### Development Notes

- Uses Turbopack in development for faster builds
- Environment variables should be in `.env` (not `.env.local`)
- Database requires PostgreSQL with proper connection string in `DATABASE_URL`
- Google OAuth requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Content gating happens at the server component level, not client-side
- PDF export functionality uses jsPDF and html2canvas