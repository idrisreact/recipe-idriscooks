# Subscription Enforcement - Update Summary

## Changes Made

### 1. Updated Free Plan Limit ✅
- **Changed from**: 10 recipe views per month
- **Changed to**: 3 recipe views per month

**Files Updated:**
- `src/lib/clerk-billing.ts` - Updated plan definition
- `src/lib/subscription.ts` - Updated default fallback limits

### 2. Integrated Subscription Enforcement into Recipe Pages ✅

**Updated File:** `app/(root)/recipes/category/[slug]/page.tsx`

#### What Happens Now:

1. **Authentication Check**
   - Users must be signed in to view recipes
   - Unauthenticated users are redirected to sign-in

2. **Subscription Limit Check (BEFORE loading recipe)**
   - Checks if user can view another recipe
   - Free users: 3 views per month
   - Pro/Premium users: Unlimited views

3. **Limit Reached Screen**
   - Shows warning icon
   - Displays clear message: "Recipe View Limit Reached"
   - Shows current usage (e.g., "You've viewed 3 of 3 recipes this month")
   - Big "Upgrade to Pro" button
   - Link to return home

4. **Usage Tracking**
   - Increments view counter AFTER recipe loads successfully
   - Only counts actual recipe views, not failed attempts

5. **Usage Banner (for Free Users)**
   - Shows at top of recipe page
   - Displays: "X of 3 recipe views used this month"
   - Special warning when on last view: "Last recipe view!"
   - Quick link to upgrade

## How It Works

### Free User Journey:

**First View:**
```
┌─────────────────────────────────────────┐
│ ℹ️ 1 of 3 recipe views used this month │
│           Upgrade for unlimited →       │
├─────────────────────────────────────────┤
│                                         │
│         [Recipe Content]                │
│                                         │
└─────────────────────────────────────────┘
```

**Third View (Last One):**
```
┌─────────────────────────────────────────┐
│ ℹ️ 3 of 3 recipe views used - Last     │
│   recipe view!  Upgrade for unlimited → │
├─────────────────────────────────────────┤
│                                         │
│         [Recipe Content]                │
│                                         │
└─────────────────────────────────────────┘
```

**Fourth View Attempt:**
```
┌─────────────────────────────────────────┐
│            ⚠️                            │
│   Recipe View Limit Reached             │
│                                         │
│  You've reached your monthly limit of 3 │
│  recipe views. Upgrade to view more!    │
│                                         │
│  You've viewed 3 of 3 recipes this month│
│                                         │
│  [Upgrade to Pro for Unlimited Views]   │
│                                         │
│         Return to Home                  │
└─────────────────────────────────────────┘
```

### Pro/Premium User Journey:
- No usage banner shown
- No limits
- View as many recipes as they want

## Testing the Feature

### Test as Free User:

1. **Sign up** or **sign in** as a new user
2. **View a recipe** - You should see: "1 of 3 recipe views used"
3. **View another recipe** - You should see: "2 of 3 recipe views used"
4. **View a third recipe** - You should see: "3 of 3 recipe views used - Last recipe view!"
5. **Try to view a fourth** - You should be blocked with upgrade prompt

### Reset Usage (for testing):

Run this in your database console to reset a user's usage:
```sql
DELETE FROM user_usage WHERE user_id = 'your_clerk_user_id';
```

Or wait until next month - usage automatically resets monthly!

## Next Steps

### For Production:

1. **Test the flow** with real Stripe payments
2. **Monitor usage** in the database
3. **Adjust limits** if needed (change in `clerk-billing.ts`)

### To Add More Protected Features:

Follow the same pattern for other features:

```typescript
// In your component/page
const { allowed, reason } = await canPerformAction('exportPdf');

if (!allowed) {
  return <UpgradePrompt message={reason} />;
}

// Perform the action
await doSomething();

// Track usage
await incrementUsage('pdfExports');
```

## Important Notes

⚠️ **Usage Tracking:**
- Views are counted AFTER the recipe loads successfully
- Failed recipe loads don't count against the limit
- Usage resets automatically each month

⚠️ **Free Plan Default:**
- All new users start on the Free plan
- No Stripe subscription created for free tier
- Limits are enforced server-side

✅ **Upgrades:**
- When user upgrades, limits immediately become unlimited
- Existing usage counter stays (doesn't reset on upgrade)
- Usage tracking continues for analytics

## Technical Implementation Details

### Clerk + Better-Auth User Mapping

The app uses Clerk for authentication but has a better-auth user table in the database. To track usage without breaking foreign key constraints:

**Problem**: Clerk user IDs (e.g., `user_34sRQI9uHNYZ2Tnyr97eRbAmKTy`) don't exist in the better-auth `user` table, which uses different IDs.

**Solution**: `getDbUserIdForClerkUser()` in `sync-clerk-user.ts` maps Clerk users to database users by email:
1. Gets the Clerk user's email
2. Finds existing user in database by email
3. Returns their database user ID for use in foreign key relationships
4. If no match, creates new user with generated UUID

This allows subscription enforcement and usage tracking to work seamlessly with both auth systems.

**Files Involved**:
- `src/lib/sync-clerk-user.ts` - User ID mapping logic
- `src/lib/subscription.ts` - Uses mapped IDs for all database operations

## Build Status

✅ **Build Passes Successfully** - All changes tested and working!
✅ **User Mapping Fixed** - Clerk and better-auth integration working correctly!
