# Clerk Billing Integration Setup Guide

This guide will help you complete the setup of Clerk-based billing with Stripe for your recipe platform.

## ✅ What's Already Done

The following components have been created and integrated:

1. **Billing Configuration** (`src/lib/clerk-billing.ts`)
   - Subscription plans definition
   - Feature access management

2. **UI Components**
   - Pricing page (`/pricing`)
   - Billing management page (`/billing`)
   - Pricing cards component
   - Upgrade prompt component

3. **API Routes**
   - Checkout session creation (`/api/billing/checkout`)
   - Billing portal access (`/api/billing/portal`)
   - Stripe webhook handler (`/api/webhooks/stripe`)

4. **Subscription Utilities** (`src/lib/subscription.ts`)
   - User subscription info retrieval
   - Feature access checks
   - Usage tracking and limits enforcement

## 🔧 Setup Steps

### 1. Create Stripe Products & Prices

You need to create products and prices in your Stripe Dashboard for each subscription tier.

#### Using Stripe Dashboard:

1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product" for each plan:

**Pro Plan:**
- Name: Pro
- Description: For home chefs who love to cook
- Pricing: $9.99/month (recurring)
- Copy the **Price ID** (starts with `price_`)

**Premium Plan:**
- Name: Premium
- Description: For culinary professionals
- Pricing: $19.99/month (recurring)
- Copy the **Price ID** (starts with `price_`)

#### Or use the Stripe MCP tools (already available):

```javascript
// Create Pro product
await mcp__stripe__create_product({
  name: "Pro",
  description: "For home chefs who love to cook"
});

// Create Pro price (use the product ID from above)
await mcp__stripe__create_price({
  product: "prod_xxx", // Replace with actual product ID
  unit_amount: 999, // $9.99 in cents
  currency: "usd",
  recurring: {
    interval: "month"
  }
});

// Repeat for Premium plan
```

### 2. Update Environment Variables

Add these to your `.env` file:

```bash
# Add the Price IDs you created
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx

# Set your app URL (important for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Stripe Webhooks

For local development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret and add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

For production:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret to your production environment

### 4. Enable Stripe Customer Portal

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Activate the customer portal
3. Configure allowed actions:
   - ✅ Update payment method
   - ✅ Cancel subscription
   - ✅ View invoices
   - ✅ Switch plans (if you want to allow plan switching)

### 5. Test the Integration

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000/pricing
3. Click "Upgrade Now" on Pro or Premium plan
4. Use Stripe test card: `4242 4242 4242 4242`
5. Expiry: Any future date
6. CVC: Any 3 digits
7. Complete checkout
8. Verify subscription appears in `/billing`

## 🎯 Using the Subscription System

### Check Feature Access in Your Components

```typescript
import { canAccessFeature, canPerformAction } from '@/src/lib/subscription';

// Server component
async function MyServerComponent() {
  const canExport = await canAccessFeature('canExportPdf');

  if (!canExport) {
    return <UpgradePrompt message="Upgrade to export PDFs" />;
  }

  return <PDFExportButton />;
}

// Check before performing action
async function handleExport() {
  const { allowed, reason } = await canPerformAction('exportPdf');

  if (!allowed) {
    alert(reason);
    return;
  }

  // Increment usage
  await incrementUsage('pdfExports');

  // Perform export...
}
```

### Track Usage

```typescript
import { incrementUsage } from '@/src/lib/subscription';

// After user views a recipe
await incrementUsage('recipeViews');

// After user exports a PDF
await incrementUsage('pdfExports');

// After user creates a collection
await incrementUsage('collectionsCount');
```

### Protect Routes

```typescript
// In a server component or API route
import { getUserSubscriptionInfo } from '@/src/lib/subscription';
import { redirect } from 'next/navigation';

export default async function PremiumFeaturePage() {
  const subscription = await getUserSubscriptionInfo();

  if (!subscription || subscription.planId === 'free') {
    redirect('/pricing');
  }

  return <PremiumContent />;
}
```

## 📝 Customization

### Modify Subscription Plans

Edit `src/lib/clerk-billing.ts` to change:
- Plan names and descriptions
- Pricing
- Features included in each tier
- Usage limits

### Add New Features

1. Add feature to plan definitions in `clerk-billing.ts`
2. Add feature check in `subscription.ts`
3. Use `canAccessFeature()` to gate the feature

### Customize UI

- Pricing cards: `src/components/billing/PricingCard.tsx`
- Billing page: `app/(root)/billing/page.tsx`
- Pricing page: `app/(root)/pricing/page.tsx`

## 🚀 Going to Production

1. Switch Stripe keys to production mode in `.env`
2. Create production products/prices in Stripe
3. Update webhook endpoint to production URL
4. Test thoroughly with real payment methods
5. Set up monitoring for failed payments

## 🔗 Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)

## 🆘 Troubleshooting

**Webhooks not working?**
- Verify webhook secret is correct
- Check webhook is listening to correct events
- View webhook logs in Stripe Dashboard

**Subscription not showing after payment?**
- Check webhook is receiving events
- Verify database migrations are up to date
- Check server logs for errors

**Can't access billing portal?**
- Ensure customer portal is activated in Stripe
- Verify user has a Stripe customer ID

Need help? Check the Stripe and Clerk documentation or reach out for support!
