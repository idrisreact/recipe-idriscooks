  🎯 High Priority - Quick Wins

  1. Testing Coverage

  Currently you have test files in src/hooks/__tests__/ but they need @testing-library/react installed:
  npm install -D @testing-library/react @testing-library/jest-dom @types/jest
  Then expand test coverage to:
  - API route tests
  - Component integration tests
  - Payment flow tests (mock Stripe)

  2. SEO & Meta Tags

  Your metadata is minimal. Add:
  - Dynamic Open Graph images per recipe
  - Recipe schema markup (JSON-LD) for Google
  - Sitemap generation
  - robots.txt optimization

  3. Performance Optimization

  - Add image optimization (use next/image everywhere)
  - Implement ISR (Incremental Static Regeneration) for recipe pages
  - Add loading skeletons for better perceived performance
  - Lazy load non-critical components

  4. Error Handling

  - Create error boundaries for graceful failures
  - Add global error page (app/error.tsx)
  - Implement retry logic for failed API calls
  - Better toast error messages

  ---
  🚀 Medium Priority - Features

  5. User Experience

  - Recipe search with filters (difficulty, time, dietary restrictions)
  - Recipe reviews & ratings system
  - Social sharing (share recipes to social media)
  - Print-friendly recipe view
  - Recipe collections/playlists (group recipes together)
  - Recently viewed recipes (session history)

  6. Email Integration

  You have Nodemailer installed but likely underutilized:
  - Welcome email on sign-up
  - Purchase confirmation emails
  - Weekly recipe newsletter
  - Password reset (if you add email/password auth)

  7. Analytics & Tracking

  You have LogRocket and Vercel Analytics, expand to:
  - Track recipe views, favorites, conversions
  - A/B test pricing strategies
  - User journey funnels
  - Heatmaps (consider Hotjar)

  8. Mobile App Features

  - Offline mode (PWA with service worker)
  - Add to home screen prompt
  - Push notifications (new recipes, cooking reminders)
  - Better mobile cooking mode with wake lock

  ---
  💎 Long-term - Advanced Features

  9. Community Features

  - User-submitted recipes
  - Comments on recipes
  - Recipe modifications/variations
  - Following other users
  - Recipe contests/challenges

  10. AI Integration

  - Recipe recommendations based on preferences
  - Ingredient substitution suggestions
  - Meal planning assistant
  - Generate shopping lists from meal plans
  - Dietary restriction filtering

  11. Monetization Expansion

  Your current model is £10 one-time payment. Consider:
  - Subscription tiers (already in code but not active)
    - Free: 5 recipes/month
    - Premium: Unlimited recipes, meal planning
    - Pro: All features + exclusive recipes
  - Recipe bundles (themed collections)
  - Affiliate links for ingredients/equipment
  - Sponsored recipes (partnerships with brands)

  12. Admin Dashboard

  - Recipe management UI (currently manual)
  - User analytics
  - Payment/subscription management
  - Content moderation (if adding user recipes)

  ---
  🛠️ Technical Debt & Cleanup

  13. Dependencies

  Remove unused dependencies found by knip:
  npm uninstall @heroicons/react @radix-ui/react-icons @stripe/stripe-js react-icons swiper zustand

  14. Type Safety

  - Fix remaining TypeScript errors in test files
  - Add stricter TypeScript config
  - Remove any types throughout codebase

  15. Documentation

  - API documentation
  - Component Storybook stories (you have Storybook set up!)
  - Contribution guidelines
  - Architecture decision records (ADRs)

  ---
  📊 Which to Tackle First?

  If you want more users:
  1. SEO & Meta Tags (#2)
  2. Recipe search (#5)
  3. Email integration (#6)

  If you want more revenue:
  1. Subscription model (#11)
  2. Analytics tracking (#7)
  3. A/B testing pricing

  If you want better UX:
  1. Performance optimization (#3)
  2. Error handling (#4)
  3. Mobile PWA features (#8)

  If you want to scale safely:
  1. Testing coverage (#1)
  2. Type safety (#14)
  3. Error boundaries (#4)
