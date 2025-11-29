# Production Webhook Not Setting Access - Fix Guide

## The Problem

Your Stripe webhook is not granting access to users on production (https://recipe-idriscooks.vercel.app/).

## Root Cause Analysis

The webhook code in `app/api/webhooks/stripe/route.ts` is correctly implemented. The issue is likely one of these:

1. **Webhook not registered in Stripe Dashboard for production**
2. **Wrong webhook secret in Vercel environment variables**
3. **Database connectivity issues from Vercel**
4. **Missing or incorrect environment variables**

## Step-by-Step Fix

### Step 1: Test Webhook Endpoint Accessibility

Run the test script:

```bash
./test-production-webhook.sh
```

**Expected Result:** HTTP 400 (signature verification failed) - This is GOOD! It means the endpoint exists.

**If you get HTTP 404:** The route is not deployed. Check your deployment.

**If you get HTTP 500:** There's a server error. Check Vercel logs (see below).

---

### Step 2: Register Webhook in Stripe Dashboard (PRODUCTION)

⚠️ **IMPORTANT: Make sure you're in LIVE MODE (not test mode)**

1. Go to: https://dashboard.stripe.com/webhooks
2. Toggle to **LIVE MODE** (top right corner)
3. Click **"+ Add endpoint"**
4. Enter these details:
   - **Endpoint URL:** `https://recipe-idriscooks.vercel.app/api/webhooks/stripe`
   - **Description:** Production webhook for user access
   - **Events to send:**
     - ✅ `checkout.session.completed`
     - ✅ `charge.refunded`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`

5. Click **"Add endpoint"**
6. **Copy the Signing Secret** (starts with `whsec_`)

---

### Step 3: Update Vercel Environment Variables

1. Go to: https://vercel.com/[your-username]/idris-cooks-app/settings/environment-variables

2. Verify/Update these variables for **Production**:

| Variable                             | Value                                  | Notes                          |
| ------------------------------------ | -------------------------------------- | ------------------------------ |
| `STRIPE_SECRET_KEY`                  | `sk_live_...`                          | Must be LIVE key, not test     |
| `STRIPE_WEBHOOK_SECRET`              | `whsec_...`                            | From Step 2 above              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...`                          | Must be LIVE key               |
| `DATABASE_URL`                       | Your production DB URL                 | Must be accessible from Vercel |
| `BETTER_AUTH_SECRET`                 | Your auth secret                       | Required for user sessions     |
| `NEXT_PUBLIC_BASE_URL`               | `https://recipe-idriscooks.vercel.app` | Your production URL            |

3. **IMPORTANT:** After updating environment variables, redeploy:
   ```bash
   vercel --prod
   ```
   Or trigger a redeploy from the Vercel dashboard.

---

### Step 4: Check Vercel Logs

To see what's happening with your webhooks:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# View logs
vercel logs https://recipe-idriscooks.vercel.app --follow
```

**Then make a test purchase** and watch the logs in real-time.

**Look for:**

- ✅ "Webhook: Checkout session completed..."
- ✅ "Webhook: Recipe access granted successfully..."
- ❌ Database connection errors
- ❌ "Missing userId"
- ❌ Signature verification errors

---

### Step 5: Test with Real Purchase

1. Go to: https://recipe-idriscooks.vercel.app
2. Make a purchase using Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

3. Check Stripe Dashboard → Webhooks → Your endpoint → Events
   - You should see the `checkout.session.completed` event
   - It should show **200** status (success)
   - If it shows **400** or **500**, click on the event to see the error

4. Check your database:
   ```sql
   SELECT * FROM premium_features
   WHERE "userId" = '[your-user-id]'
   ORDER BY "grantedAt" DESC;
   ```

---

## Common Issues & Solutions

### Issue 1: "Webhook signature verification failed"

**Symptoms:**

- Stripe shows webhook event with 400 status
- Logs show: "Webhook signature verification failed"

**Solution:**

1. Copy the **production** webhook signing secret from Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in Vercel (Production environment)
3. Redeploy your app
4. The secret starts with `whsec_` - make sure you copied the entire string

---

### Issue 2: "No userId in webhook"

**Symptoms:**

- Logs show: "Missing userId for subscription checkout"
- Access not granted

**Solution:**
This means the checkout session didn't include user metadata. Check:

1. User is logged in when initiating checkout
2. `auth.api.getSession()` is working correctly
3. Session has `user.id` field

**Verify in code:** `app/api/stripe/checkout/route.ts:49`

---

### Issue 3: Database Connection Errors

**Symptoms:**

- Logs show database connection timeouts or errors
- Webhook returns 500 status

**Solution:**

1. Verify `DATABASE_URL` in Vercel environment variables
2. Check if database allows connections from Vercel IPs
3. If using connection pooling, verify pool settings
4. Test database connectivity:
   ```bash
   # From your local terminal
   psql "YOUR_DATABASE_URL" -c "SELECT NOW();"
   ```

---

### Issue 4: Webhooks Working in Test but Not Live

**Symptoms:**

- Local testing with `stripe listen` works
- Production webhooks fail

**Solution:**

1. Make sure you registered a **separate webhook** in LIVE mode
2. Use the **LIVE** webhook secret (not the test one from `stripe listen`)
3. Use **LIVE** Stripe keys (`sk_live_`, `pk_live_`)
4. Make purchases with real cards (or test cards in test mode)

---

## Verification Checklist

After following all steps, verify:

- [ ] Webhook registered in Stripe Dashboard (LIVE mode)
- [ ] Webhook URL is correct: `https://recipe-idriscooks.vercel.app/api/webhooks/stripe`
- [ ] All 7 events are selected in Stripe webhook configuration
- [ ] `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe Dashboard
- [ ] `STRIPE_SECRET_KEY` is the LIVE key (starts with `sk_live_`)
- [ ] `DATABASE_URL` is accessible from Vercel
- [ ] Environment variables are set for "Production" (not just Preview)
- [ ] App has been redeployed after environment variable changes
- [ ] Test purchase shows 200 status in Stripe webhook events
- [ ] User access is granted in database (`premium_features` table)
- [ ] User can access premium features after purchase

---

## Monitoring Production Webhooks

### View Webhook Events in Stripe:

1. https://dashboard.stripe.com/webhooks
2. Click on your production endpoint
3. Click "Events" tab
4. See all deliveries with status codes

### View Vercel Logs:

```bash
vercel logs https://recipe-idriscooks.vercel.app --follow
```

### Check Database Access:

```bash
npm run check-access
```

This script (if exists) will show which users have premium features.

---

## Still Not Working?

If you've followed all steps and it's still not working:

1. **Share the Stripe Event ID:**
   - Go to Stripe Dashboard → Webhooks → Events
   - Find the failed event
   - Copy the event ID (starts with `evt_`)
   - Check the "Response" tab to see the error

2. **Share Vercel Logs:**

   ```bash
   vercel logs https://recipe-idriscooks.vercel.app --since 1h > webhook-logs.txt
   ```

3. **Check the webhook handler code:**
   - File: `app/api/webhooks/stripe/route.ts:198-448`
   - Specifically the `handleCheckoutCompleted` function

4. **Verify metadata is being sent:**
   - Check the checkout session in Stripe Dashboard
   - Find the session (Payments → Sessions)
   - Look at the "Metadata" section
   - Should have: `userId`, `type` (e.g., "pdf_download" or "recipe_access")

---

## Testing Checklist

Run through this checklist to confirm everything works:

### 1. Test Endpoint Accessibility

```bash
./test-production-webhook.sh
```

Expected: HTTP 400 ✅

### 2. Test Real Purchase Flow

- [ ] User can initiate checkout
- [ ] Stripe Checkout loads
- [ ] Payment succeeds
- [ ] User redirected to success page
- [ ] Webhook received (check Stripe Dashboard)
- [ ] Webhook returns 200 status
- [ ] Access granted in database
- [ ] User can use premium feature

### 3. Test Each Purchase Type

**PDF Download:**

```
1. Login to site
2. Add recipes to favorites
3. Click "Download PDF"
4. Complete checkout
5. Verify access in database:
   SELECT * FROM premium_features WHERE feature = 'pdf_downloads';
```

**Recipe Access:**

```
1. Login to site
2. Go to premium recipe
3. Click upgrade/purchase
4. Complete checkout
5. Verify access in database:
   SELECT * FROM premium_features WHERE feature = 'recipe_access';
```

---

## Emergency Rollback

If you need to grant access manually while debugging:

```sql
-- Grant PDF download access
INSERT INTO premium_features ("userId", feature, "grantedAt", "expiresAt", metadata)
VALUES ('user-id-here', 'pdf_downloads', NOW(), NULL, '{"manual": true}');

-- Grant recipe access
INSERT INTO premium_features ("userId", feature, "grantedAt", "expiresAt", metadata)
VALUES ('user-id-here', 'recipe_access', NOW(), NULL, '{"manual": true}');
```

---

## Need Help?

If you're still stuck:

1. Run the test script and share output:

   ```bash
   ./test-production-webhook.sh > webhook-test-results.txt
   ```

2. Share Vercel logs:

   ```bash
   vercel logs https://recipe-idriscooks.vercel.app --since 2h > vercel-logs.txt
   ```

3. Share a failed Stripe event:
   - Go to Stripe Dashboard → Webhooks → Events
   - Find a failed `checkout.session.completed` event
   - Share the event ID and response

4. Check database:
   ```bash
   npm run check-access
   ```
