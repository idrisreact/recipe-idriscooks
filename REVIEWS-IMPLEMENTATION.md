# Recipe Reviews Implementation

## Overview

A complete recipe review and rating system has been implemented for the Idris Cooks app. This feature allows paid users to leave reviews with star ratings, text feedback, and photo uploads.

## Features Implemented

### 1. Database Schema ✅

**File:** `src/db/schemas/review.schema.ts`

Created a new `reviews` table with:

- `id` - Primary key
- `recipeId` - Foreign key to recipes table (cascade delete)
- `userId` - User who wrote the review
- `userName` - Display name
- `userImage` - User profile picture
- `rating` - Integer (1-5 stars)
- `reviewText` - Optional review content
- `photos` - JSON array of image URLs
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Constraints:**

- One review per user per recipe
- Reviews are deleted if the recipe is deleted

### 2. API Routes ✅

#### POST /api/reviews

Creates a new review.

**Requirements:**

- User must be authenticated
- User must have paid access (`checkRecipeAccess`)
- User cannot review the same recipe twice

**Body:**

```json
{
  "recipeId": 1,
  "rating": 5,
  "reviewText": "Amazing recipe!",
  "photos": ["url1", "url2"]
}
```

#### GET /api/reviews/[recipeId]

Fetches all reviews for a recipe with aggregate statistics.

**Response:**

```json
{
  "reviews": [...],
  "stats": {
    "count": 10,
    "avgRating": 4.5,
    "fiveStars": 6,
    "fourStars": 3,
    "threeStars": 1,
    "twoStars": 0,
    "oneStar": 0
  }
}
```

#### PATCH /api/reviews/edit/[id]

Updates an existing review.

**Requirements:**

- User must be authenticated
- User must own the review

**Body:**

```json
{
  "rating": 4,
  "reviewText": "Updated review",
  "photos": ["new_url"]
}
```

#### DELETE /api/reviews/edit/[id]

Deletes a review.

**Requirements:**

- User must be authenticated
- User must own the review

### 3. UI Components ✅

#### StarRating Component

**File:** `src/components/reviews/star-rating.tsx`

Interactive star rating component with:

- Read-only and editable modes
- Hover effects for user feedback
- Size variants (sm, md, lg)
- Optional review count display

**Props:**

```typescript
{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}
```

#### ReviewForm Component

**File:** `src/components/reviews/review-form.tsx`

Form for submitting and editing reviews with:

- Star rating selector
- Text area for review (1000 char limit)
- Photo URL input (paste image URLs)
- Photo preview grid with removal
- Loading states
- Edit/create modes

**Props:**

```typescript
{
  recipeId: number;
  existingReview?: Review;
  onSuccess: () => void;
  onCancel?: () => void;
}
```

#### ReviewsSection Component

**File:** `src/components/reviews/reviews-section.tsx`

Complete reviews section with:

- Aggregate rating display
- Rating distribution chart
- "Write a Review" button (for eligible users)
- Reviews list with user info
- Edit/delete buttons for own reviews
- Empty state messaging

**Props:**

```typescript
{
  recipeId: number;
  userId?: string;
  hasPaidAccess: boolean;
}
```

### 4. SEO Integration ✅

#### Enhanced Recipe Schema

Updated `src/utils/seo.ts` to include aggregate ratings in Recipe JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 10,
    "bestRating": 5,
    "worstRating": 1
  }
}
```

**Benefits:**

- ⭐ Star ratings in Google search results
- 📈 Higher click-through rates
- 🎯 Recipe rich results eligibility

### 5. Recipe Page Integration ✅

**File:** `app/(root)/recipes/category/[slug]/page.tsx`

Added to recipe detail page:

- Fetches review stats on page load
- Passes stats to SEO schema
- Renders ReviewsSection component below recipe
- Only shows reviews to users who can view the full recipe

## User Flow

### For Paid Users:

1. View full recipe
2. See existing reviews and ratings
3. Click "Write a Review"
4. Select star rating (required)
5. Write review text (optional)
6. Add photo URLs (optional)
7. Submit review
8. Can edit or delete their review later

### For Free Users:

1. View recipe (up to 3/month)
2. See existing reviews and ratings
3. Cannot write reviews (must upgrade)

### For Non-Authenticated Users:

1. Cannot see reviews (paywall)
2. Must sign in to view recipes and reviews

## Access Control

### Who Can Write Reviews?

- ✅ Users with paid recipe access
- ❌ Free users (even within their 3-recipe limit)
- ❌ Non-authenticated users

This ensures:

- Reviews come from committed users
- Higher quality feedback
- Incentive to upgrade to paid plan

### Who Can Edit/Delete Reviews?

- Only the review author can edit or delete their own review
- API enforces user ownership checks

## Database Migration

The reviews table was created using:

```bash
npx drizzle-kit push
```

**Schema Changes:**

- ✅ New `reviews` table
- ✅ Foreign key to `recipes` table
- ✅ Indexes on `recipeId` and `userId` (implicit via foreign keys)

## Dependencies Added

```json
{
  "date-fns": "^latest"
}
```

Used for formatting review timestamps ("2 hours ago", "3 days ago", etc.)

## Testing Checklist

### Manual Testing Required:

- [ ] Submit a review as a paid user
- [ ] Verify review appears in the list
- [ ] Edit your own review
- [ ] Delete your own review
- [ ] Try to review the same recipe twice (should fail)
- [ ] Try to submit review without rating (should fail)
- [ ] Try to review as a free user (should see error)
- [ ] Verify aggregate stats update correctly
- [ ] Check star ratings display in Google Rich Results Test
- [ ] Test photo upload and preview
- [ ] Test responsive layout on mobile

### SEO Testing:

1. Visit a recipe page with reviews
2. View page source
3. Find the JSON-LD script tag
4. Verify `aggregateRating` appears with correct values
5. Use [Google Rich Results Test](https://search.google.com/test/rich-results)
6. Enter recipe URL
7. Verify "Recipe" rich result shows rating stars

## UI/UX Features

### Review Display:

- ⭐ Visual star ratings
- 📊 Rating distribution chart
- 👤 User avatars and names
- 🕐 Relative timestamps ("2 hours ago")
- 📸 Photo grid display
- ✏️ Edit/delete buttons for own reviews

### Form Experience:

- 🎨 Dark theme styling
- ✨ Hover effects on stars
- 📝 Character counter for review text
- 🖼️ Photo preview before submission
- ⏳ Loading states
- ✅ Success/error toasts

## Future Enhancements (Optional)

### 1. Helpful/Unhelpful Votes

Add ability for users to mark reviews as helpful:

```typescript
{
  helpfulCount: integer;
  unhelpfulCount: integer;
}
```

### 2. Review Moderation

Admin dashboard to:

- Flag inappropriate reviews
- Delete spam
- Feature best reviews

### 3. Review Notifications

Email users when:

- Someone reviews their submitted recipe
- Their review gets marked helpful
- Recipe owner responds to review

### 4. Recipe Response

Allow recipe creators to respond to reviews:

```typescript
{
  response: text;
  responseDate: timestamp;
}
```

### 5. Image Upload (Not URLs)

Replace URL input with actual file upload:

- Use UploadThing or Cloudinary
- Image compression
- Automatic resizing

### 6. Review Filtering

Add filters:

- By rating (5 stars, 4+ stars, etc.)
- Most recent
- Most helpful
- With photos only

### 7. Review Verification

Add "Verified Cook" badge for users who:

- Left multiple reviews
- Have been active for 30+ days
- Consistently provide quality feedback

## Files Changed/Created

### New Files:

1. `src/db/schemas/review.schema.ts` - Database schema
2. `app/api/reviews/route.ts` - Create review endpoint
3. `app/api/reviews/[recipeId]/route.ts` - Get reviews endpoint
4. `app/api/reviews/edit/[id]/route.ts` - Update/delete endpoints
5. `src/components/reviews/star-rating.tsx` - Star rating component
6. `src/components/reviews/review-form.tsx` - Review form
7. `src/components/reviews/reviews-section.tsx` - Main reviews UI
8. `REVIEWS-IMPLEMENTATION.md` - This documentation

### Modified Files:

1. `src/db/schemas/index.ts` - Export review schema
2. `src/utils/seo.ts` - Add aggregate rating to recipe schema
3. `app/(root)/recipes/category/[slug]/page.tsx` - Integrate reviews UI

## Performance Considerations

### Database Queries:

- Review fetching uses single query with stats aggregation
- Proper indexing on `recipeId` (foreign key)
- Limited to 50 reviews per fetch (can add pagination later)

### SEO Impact:

- Recipe schema generation happens server-side
- No client-side performance impact
- Aggregate stats cached during SSR

### Client-Side:

- Reviews load on mount via API
- Optimistic updates on edit/delete
- Lazy-loaded photos (only render if URL valid)

## Security

### Authentication:

- All write operations require valid session
- User ownership verified on edit/delete

### Authorization:

- Only paid users can create reviews
- API validates `checkRecipeAccess()` before creation

### Input Validation:

- Rating must be 1-5
- Review text max 1000 characters
- Photo arrays validated and sanitized

### SQL Injection:

- Drizzle ORM handles parameterization
- No raw SQL queries in review endpoints

## Support & Resources

- [Schema.org AggregateRating](https://schema.org/AggregateRating)
- [Google Recipe Reviews](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [date-fns Docs](https://date-fns.org/)

---

**Implementation Date:** December 5, 2025
**Status:** ✅ Complete
**Next Steps:** Test on production and monitor review quality
