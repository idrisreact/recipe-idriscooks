# Webhook Testing Guide

## Quick Test (Basic)

Run this script to verify your webhook endpoint is accessible:

```bash
./test-webhook.sh
```

Expected result: HTTP 400 (signature verification failed) - This is GOOD! It means the endpoint is working.

---

## Proper Testing with Stripe CLI (Recommended)

### 1. Install Stripe CLI

**macOS:**

```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**

```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**

```bash
# Download from: https://github.com/stripe/stripe-cli/releases/latest
```

### 2. Login to Stripe

```bash
stripe login
```

This will open your browser to authorize the CLI.

### 3. Forward Webhooks to Local Server

**Terminal 1: Start your Next.js server**

```bash
npm run dev
```

**Terminal 2: Start Stripe webhook forwarding**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:

```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**IMPORTANT:** Copy this `whsec_xxxxx` and temporarily update your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Restart your dev server after changing .env.

### 4. Trigger Test Events

**In Terminal 3:**

```bash
# Test PDF download purchase
stripe trigger checkout.session.completed

# Test refund
stripe trigger charge.refunded

# Test subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Test invoice events
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### 5. Watch the Logs

In Terminal 2 (where `stripe listen` is running), you'll see:

- Events being forwarded
- HTTP status codes (200 = success)
- Any errors

In your Next.js server logs (Terminal 1), you'll see:

- "Webhook: Checkout session completed..."
- "Invoice created and marked as paid..."
- All your console.log statements

---

## Test Real Payment Flow

### Test Mode Cards:

**Success:**

- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Decline:**

- Card: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**

- Card: `4000 0025 0000 3155`

### Test Flow:

1. **Start Stripe listener:**

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Make a purchase:**
   - Go to http://localhost:3000/favorites
   - Add recipes
   - Click "Download PDF"
   - Use test card: 4242 4242 4242 4242
   - Complete checkout

3. **Verify:**
   - ✅ Payment successful page shows
   - ✅ Stripe listener shows `checkout.session.completed` event
   - ✅ Server logs show: "Invoice created and marked as paid"
   - ✅ Database has premium_features record
   - ✅ Can download PDF

---

## Debugging Webhook Issues

### Issue: "Webhook signature verification failed"

**Solution:**

1. Make sure you're using the webhook secret from `stripe listen` output
2. Update `.env` with the new secret
3. Restart your dev server

### Issue: "No webhook events received"

**Check:**

1. Is `stripe listen` running?
2. Is your dev server running on port 3000?
3. Is the endpoint `/api/webhooks/stripe` correct?
4. Check firewall settings

### Issue: "Event received but not processing"

**Check server logs for:**

- "Webhook: Checkout session completed" - should appear
- Database errors
- Missing user ID
- Payment status not 'paid'

### View Webhook Logs:

**In Stripe Dashboard:**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click "Events" tab
4. See all recent webhook deliveries and responses

**In Stripe CLI:**

```bash
stripe events list
stripe events resend evt_xxxxx  # Resend a specific event
```

---

## Production Webhook Setup

When deploying to production:

### 1. Update Webhook Endpoint in Stripe

Go to: https://dashboard.stripe.com/webhooks (LIVE MODE)

1. Click "+ Add endpoint"
2. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
3. Select same 7 events:
   - checkout.session.completed
   - charge.refunded
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed

### 2. Update Environment Variables

In your production environment:

```bash
STRIPE_SECRET_KEY=sk_live_xxxxx  # NOT sk_test_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # From LIVE webhook endpoint
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Test in Production

1. Make a real purchase with a real card (small amount!)
2. Check Stripe Dashboard → Webhooks → Events
3. Verify webhook was delivered successfully (200 status)
4. Check your database for the record

---

## Monitoring Webhooks

### Set up alerts for:

- Webhook delivery failures
- 4xx/5xx responses
- Signature verification failures

### Stripe Dashboard:

- Webhooks → Your endpoint → "Configure"
- Enable "Email me when webhook deliveries fail"

---

## Common Events You'll See

### After PDF Purchase:

```
1. checkout.session.completed
2. (Your code creates invoice)
3. payment_intent.succeeded (optional)
```

### After Refund:

```
1. charge.refunded
2. (Your code revokes access)
```

### After Subscription:

```
1. checkout.session.completed
2. customer.subscription.created
3. invoice.payment_succeeded
```

---

## Quick Reference

**Test webhook locally:**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Trigger test event:**

```bash
stripe trigger checkout.session.completed
```

**View recent events:**

```bash
stripe events list
```

**Resend event:**

```bash
stripe events resend evt_xxxxx
```

**Test in browser:**

```bash
# Start server
npm run dev

# In another terminal
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Go to http://localhost:3000/favorites and make a purchase
```

---

## Success Criteria

✅ Stripe CLI connected successfully
✅ Webhook events forwarded to local server
✅ Server responds with 200 status
✅ Database records created
✅ Invoice created in Stripe
✅ User access granted
✅ Refund properly revokes access
✅ No errors in logs
