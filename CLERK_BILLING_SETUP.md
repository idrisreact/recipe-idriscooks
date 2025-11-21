# Clerk Native Billing Setup Guide

## Overview

Your app has been migrated to use **Clerk's native billing features** instead of custom Stripe integration. This guide will walk you through setting up billing in your Clerk Dashboard.

## Benefits of Clerk Native Billing

✅ No need to manage Stripe products separately
✅ Built-in `<PricingTable />` component
✅ Automatic checkout flow
✅ Easy access control with `has({ feature: '...' })`
✅ Clerk handles webhooks automatically

**Trade-off**: 0.7% transaction fee + Stripe fees

---

## Step 1: Enable Billing in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Billing** in the left sidebar
4. Click **Enable Billing**

### Choose Payment Gateway

- **Development Environment**:
  - Select "Use Clerk's shared test Stripe account"
  - This allows you to test without connecting your own Stripe

- **Production Environment**:
  - Select "Connect your own Stripe account"
  - Follow prompts to connect your Stripe account
  - Note: Must use a separate Stripe account from development

---

## Step 2: Create Subscription Plans

Navigate to **Billing → Plans** and select **"Plans for Users"** (B2C).

### Create "Pro" Plan

1. Click **"Create Plan"**
2. Fill in the details:
   - **Plan Name**: `Pro`
   - **Plan ID**: `pro` (lowercase, used in code)
   - **Description**: `For home chefs who love to cook`
   - **Price**: `$9.99/month`
   - **Billing Interval**: `Monthly`
   - **Publicly Available**: ✅ Yes

3. Click **Create**

### Create "Premium" Plan

1. Click **"Create Plan"**
2. Fill in the details:
   - **Plan Name**: `Premium`
   - **Plan ID**: `premium` (lowercase, used in code)
   - **Description**: `For culinary professionals`
   - **Price**: `$19.99/month`
   - **Billing Interval**: `Monthly`
   - **Publicly Available**: ✅ Yes

3. Click **Create**

---

## Step 3: Add Features to Plans

Features control what users can access. You need to create features and attach them to plans.

### Create "Unlimited Recipe Views" Feature

1. Navigate to **Billing → Features**
2. Click **"Create Feature"**
3. Fill in:
   - **Feature Name**: `Unlimited Recipe Views`
   - **Feature ID**: `unlimited-recipe-views` (used in code)
   - **Description**: `View unlimited recipes every month`

4. Click **Create**

### Attach Feature to Plans

1. Go to **Billing → Plans**
2. Click on **"Pro"** plan
3. In the **Features** section, click **"Add Feature"**
4. Select `unlimited-recipe-views`
5. Click **Add**

6. Repeat for **"Premium"** plan

### Additional Features (Optional)

You can create and add more features:

| Feature ID | Feature Name | Attach To |
|-----------|--------------|-----------|
| `pdf-export` | PDF Export | Pro, Premium |
| `recipe-sharing` | Recipe Sharing | Premium only |
| `priority-support` | Priority Support | Premium only |
| `advanced-analytics` | Advanced Analytics | Premium only |

---

## Step 4: Test the Integration

### Access the Pricing Page

1. Start your dev server: `npm run dev`
2. Sign in to your app
3. Navigate to: http://localhost:3001/pricing
4. You should see Clerk's native pricing table with your plans

### Test the Upgrade Flow

1. Click **"Upgrade"** on a plan
2. Clerk will redirect you to their checkout page
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete the checkout

### Verify Access Control

1. After subscribing, visit a recipe page
2. You should see unlimited access (no usage banner)
3. The code checks: `has({ feature: 'unlimited-recipe-views' })`

---

## Step 5: How Access Control Works

The app uses Clerk's `has()` method to check features:

```typescript
// In recipe page (app/(root)/recipes/category/[slug]/page.tsx)
const { userId, has } = await clerkAuth();

// Check if user has unlimited views
const hasUnlimitedViews = has({ feature: 'unlimited-recipe-views' });

if (!hasUnlimitedViews) {
  // Show usage limits for free users
  // Limit: 3 recipe views per month
}
```

### Free Users
- No plan subscription
- Limited to 3 recipe views per month
- Usage tracked in `user_usage` database table
- See usage banner on recipe pages

### Pro/Premium Users
- Have `unlimited-recipe-views` feature
- No usage tracking
- No limits
- No usage banner

---

## Step 6: Manage Subscriptions

Users can manage their subscriptions through Clerk's built-in portal.

### Add User Button with Billing

Update your user menu to include billing management:

```tsx
import { UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          userButtonPopoverCard: "shadow-lg"
        }
      }}
    />
  );
}
```

Clerk automatically adds "Manage billing" option to the user menu.

---

## Testing Checklist

- [ ] Billing enabled in Clerk Dashboard
- [ ] Pro plan created ($9.99/month)
- [ ] Premium plan created ($19.99/month)
- [ ] `unlimited-recipe-views` feature created
- [ ] Feature attached to both Pro and Premium plans
- [ ] Pricing page shows Clerk's pricing table
- [ ] Can complete test checkout
- [ ] Subscribed users have unlimited access
- [ ] Free users see usage limits (3 views/month)
- [ ] Users can manage subscriptions via user menu

---

## Production Deployment

### Before Going Live

1. **Connect Production Stripe Account**:
   - In Clerk Dashboard, switch to Production environment
   - Navigate to Billing settings
   - Connect your production Stripe account
   - ⚠️ Must be different from development Stripe account

2. **Recreate Plans in Production**:
   - Plans from development don't carry over
   - Create the same plans in production environment
   - Create and attach the same features

3. **Pricing Recommendations**:
   - Free: 3 recipe views/month
   - Pro: $9.99/month - Unlimited views, PDF export
   - Premium: $19.99/month - Everything + sharing + priority support

4. **Test in Production**:
   - Use real payment methods
   - Verify webhooks are working
   - Test subscription lifecycle (upgrade, downgrade, cancel)

---

## Troubleshooting

### "Feature not found" Error

**Problem**: Code checks `has({ feature: 'unlimited-recipe-views' })` but feature doesn't exist

**Solution**:
1. Verify feature ID exactly matches: `unlimited-recipe-views`
2. Make sure feature is attached to Pro and Premium plans
3. Check feature is marked as active

### Pricing Table Not Showing

**Problem**: Blank screen or error on `/pricing` page

**Solution**:
1. Verify billing is enabled in Clerk Dashboard
2. Check at least one plan is marked "Publicly Available"
3. Look for errors in browser console
4. Ensure `@clerk/nextjs` is version 6.0 or higher

### Users Still Seeing Limits After Subscribing

**Problem**: Subscribed users still hit the 3-view limit

**Solution**:
1. Verify user actually has an active subscription in Clerk Dashboard
2. Check feature ID matches exactly in code
3. Clear browser cache and reload
4. Check Clerk webhook events were processed

### Webhooks Not Working

**Problem**: Subscription status not updating

**Solution**:
- **Development**: Webhooks handled automatically by Clerk
- **Production**:
  1. Verify Stripe is connected in production environment
  2. Check webhook events in Clerk Dashboard → Webhooks
  3. Clerk handles webhook endpoints automatically

---

## Code Examples

### Check Plan Access

```typescript
// Check specific plan
const hasPro = has({ plan: 'pro' });
const hasPremium = has({ plan: 'premium' });

// Check specific feature
const canExportPdf = has({ feature: 'pdf-export' });
const canShare = has({ feature: 'recipe-sharing' });
```

### Protect Components

```tsx
import { Protect } from '@clerk/nextjs';

<Protect
  feature="pdf-export"
  fallback={<UpgradePrompt />}
>
  <PDFExportButton />
</Protect>
```

### Server-Side Protection

```typescript
export default async function ProtectedPage() {
  const { userId, has } = await auth();

  if (!has({ feature: 'advanced-analytics' })) {
    return <UpgradePrompt />;
  }

  return <AnalyticsDashboard />;
}
```

---

## Support

- **Clerk Documentation**: https://clerk.com/docs/billing
- **Clerk Discord**: https://clerk.com/discord
- **Stripe Testing**: https://stripe.com/docs/testing

---

## Migration Summary

### What Was Removed ❌

- Custom Stripe checkout flow (`/api/billing/checkout`)
- Custom billing portal (`/api/billing/portal`)
- Custom webhook handler (`/api/billing/webhook`)
- Custom pricing cards component
- Stripe price IDs in `.env` (no longer needed)

### What Was Added ✅

- Clerk's `<PricingTable />` component
- Clerk's `has()` method for access control
- Feature-based permissions system
- Automatic subscription management

### What Stayed The Same ✔️

- Usage tracking in database (for analytics)
- 3 recipe view limit for free users
- Recipe access enforcement
- User authentication flow
