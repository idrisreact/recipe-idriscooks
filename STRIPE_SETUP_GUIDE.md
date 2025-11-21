# Stripe Setup Guide

## Problem
The upgrade buttons on the pricing page don't work because the Stripe price IDs are missing from your environment variables.

## Solution

Follow these steps to set up your Stripe products and prices:

### Step 1: Access Stripe Dashboard

1. Go to https://dashboard.stripe.com/
2. Make sure you're in **Test mode** (toggle in the top right)

### Step 2: Create Products

1. Navigate to **Products** in the left sidebar
2. Click **+ Add product**

#### Create Pro Plan Product

1. **Name**: `Recipe Platform - Pro`
2. **Description**: `For home chefs who love to cook`
3. **Pricing**:
   - **Price**: `9.99 USD`
   - **Billing period**: `Monthly`
   - **Payment type**: `Recurring`
4. Click **Add product**
5. **Copy the Price ID** (starts with `price_...`)
6. Save it - you'll need it for the `.env` file

#### Create Premium Plan Product

1. **Name**: `Recipe Platform - Premium`
2. **Description**: `For culinary professionals`
3. **Pricing**:
   - **Price**: `19.99 USD`
   - **Billing period**: `Monthly`
   - **Payment type**: `Recurring`
4. Click **Add product**
5. **Copy the Price ID** (starts with `price_...`)
6. Save it - you'll need it for the `.env` file

### Step 3: Update Environment Variables

Add the price IDs to your `.env` file:

```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_1234567890abcdef
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_0987654321fedcba
```

Replace with your actual price IDs from Stripe.

### Step 4: Restart Dev Server

After updating `.env`, restart your development server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 5: Test the Flow

1. Go to http://localhost:3001/pricing
2. Click **Upgrade Now** on Pro or Premium plan
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Any future expiry date and CVC

## Test Mode vs Live Mode

### Currently in Test Mode ✅
- Your Stripe keys start with `pk_test_` and `sk_test_`
- No real charges are made
- Use test card numbers

### To Go Live Later

1. Create the same products in **Live mode** in Stripe
2. Get the **live price IDs**
3. Update `.env` with:
   - Live publishable key (`pk_live_...`)
   - Live secret key (`sk_live_...`)
   - Live webhook secret (`whsec_...`)
   - Live price IDs

## Webhook Setup (Important for Production)

For webhooks to work, you need to:

### For Local Development:
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3001/api/billing/webhook`
3. Use the webhook secret from the CLI output

### For Production:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/billing/webhook`
4. **Events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add it to your production `.env` as `STRIPE_WEBHOOK_SECRET`

## Current Environment Variables Status

✅ STRIPE_PUBLISHABLE_KEY - Set (test mode)
✅ STRIPE_SECRET_KEY - Set (test mode)
✅ STRIPE_WEBHOOK_SECRET - Set
❌ STRIPE_PRO_MONTHLY_PRICE_ID - **MISSING - Set this**
❌ STRIPE_PREMIUM_MONTHLY_PRICE_ID - **MISSING - Set this**

## Quick Reference

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 3 recipe views/month, 5 favorites, 1 collection |
| Pro | $9.99/mo | Unlimited views, unlimited favorites, 10 collections, PDF exports |
| Premium | $19.99/mo | Everything in Pro + unlimited collections, recipe sharing, priority support |

## Troubleshooting

### "Missing priceId" Error
- Make sure you added the price IDs to `.env`
- Restart the dev server after updating `.env`

### "No such price" Error
- Verify the price IDs are correct in Stripe Dashboard
- Make sure you're in the same mode (test/live) for both keys and prices

### Checkout Page Shows Wrong Amount
- Check that the price in Stripe matches your plan definition in `clerk-billing.ts`

### Webhook Not Receiving Events
- For local dev: Use Stripe CLI
- For production: Verify webhook endpoint URL and events
