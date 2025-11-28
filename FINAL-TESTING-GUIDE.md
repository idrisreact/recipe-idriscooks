# Final Testing Guide 🧪

Complete checklist before going live!

---

## Pre-Testing Checklist

- [x] Upstash Redis configured
- [x] Webhook endpoint configured in Stripe Dashboard
- [x] Rate limiting implemented
- [x] Refund handling added
- [ ] Dev server running
- [ ] All dependencies installed

---

## Test 1: Redis Connection ✅

**Purpose:** Verify Upstash Redis is working

**Command:**

```bash
node test-redis-connection.js
```

**Expected Output:**

```
✅ Environment variables found
✅ PING response: PONG
✅ SET successful
✅ GET response: test-value
✅ DEL successful
✅ Rate limit counter: 1
🎉 All tests passed!
```

**If Failed:**

- Check Upstash dashboard is active
- Verify credentials in .env
- Check network connection

---

## Test 2: Rate Limiting 🚦

**Purpose:** Verify rate limiting works with Redis

**Step 1: Start Dev Server**

```bash
npm run dev
```

**Step 2: Test Rate Limiting**

```bash
# In a new terminal
node test-rate-limiting.js
```

**Expected Output:**

```
Request 1: ✅ Status: 400 (no auth) - Remaining: 4
Request 2: ✅ Status: 400 - Remaining: 3
Request 3: ✅ Status: 400 - Remaining: 2
Request 4: ✅ Status: 400 - Remaining: 1
Request 5: ✅ Status: 400 - Remaining: 0
Request 6: ⚠️  Status: 429 (Rate Limited)
✅ Rate limiting is working correctly!
```

**What This Tests:**

- Redis connection from API route
- Rate limit counters incrementing
- 429 error after limit exceeded
- Proper headers returned

**If Failed:**

- Check server logs for errors
- Verify Redis credentials
- Restart dev server

---

## Test 3: Webhook Endpoint 🪝

**Purpose:** Test webhook receives and processes events

**Step 1: Install Stripe CLI** (if not already)

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

**Step 2: Forward Webhooks**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Expected Output:**

```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**Step 3: Update Webhook Secret** (IMPORTANT!)
Copy the new `whsec_xxxxx` and temporarily update your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # The one from CLI output
```

**Step 4: Restart Dev Server**

```bash
# Stop and restart
npm run dev
```

**Step 5: Trigger Test Event**

```bash
# In a new terminal
stripe trigger checkout.session.completed
```

**Expected Output (in stripe listen terminal):**

```
✅ Received event: checkout.session.completed
✅ --> POST http://localhost:3000/api/webhooks/stripe [200]
```

**Check Server Logs:**
Should see:

```
Webhook: Checkout session completed: {...}
Webhook: Session metadata: {...}
✅ Invoice created and marked as paid: in_xxxxx
```

**What This Tests:**

- Webhook endpoint accessible
- Signature verification working
- Event processing
- Invoice creation
- Database updates

---

## Test 4: Full Payment Flow 💳

**Purpose:** End-to-end payment test

### 4.1 PDF Download Test

**Step 1: Prepare**

- Keep `stripe listen` running
- Dev server running
- Browser open to http://localhost:3000

**Step 2: Add Recipes to Favorites**

1. Go to http://localhost:3000/recipes
2. Find and favorite 5 recipes (click heart icon)
3. Go to http://localhost:3000/favorites

**Step 3: Initiate Checkout**

1. Click "Download PDF" button
2. Should redirect to Stripe Checkout page

**Step 4: Complete Payment**

- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Name: Test User
- Email: Your email (you'll get receipt!)

**Step 5: Verify Success**

After payment:

- ✅ Redirected to `/payment/success`
- ✅ Shows correct amount with £ symbol
- ✅ Shows payment ID
- ✅ "Download PDF Now" button appears
- ✅ Can click and download PDF

**Step 6: Check Webhook Processing**

In `stripe listen` terminal:

```
✅ checkout.session.completed [200]
```

In server logs:

```
Webhook: Checkout session completed
Webhook: PDF access granted successfully
✅ Invoice created and marked as paid
```

**Step 7: Check Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/test/payments
2. Find your payment
3. Click on it
4. Verify:
   - ✅ Status: Succeeded
   - ✅ Amount: Correct (£2.99 for 5 recipes)
   - ✅ Customer email: Your email

5. Go to: https://dashboard.stripe.com/test/invoices
6. Find invoice
7. Verify:
   - ✅ Status: Paid
   - ✅ Line items match purchase

**Step 8: Check Database**

```bash
# Connect to your database
psql postgres://idris:secretpassword@localhost:5432/idris_cooks

# Check premium features
SELECT * FROM premium_features WHERE feature = 'pdf_downloads';

# Should show:
# - user_id: your user ID
# - feature: pdf_downloads
# - granted_at: recent timestamp
# - expires_at: null (lifetime)
```

### 4.2 Recipe Access Test

**Repeat steps above but:**

- Instead of PDF download, click "Get Full Access" (£10)
- Check for `recipe_access` in premium_features table
- Verify £10.00 charged

---

## Test 5: Refund Flow 💸

**Purpose:** Test refund handling and access revocation

**Step 1: Issue Refund in Stripe**

1. Go to: https://dashboard.stripe.com/test/payments
2. Find your test payment
3. Click on it
4. Click "Refund" button
5. Click "Refund £2.99" (or £10.00)

**Step 2: Verify Webhook**

In `stripe listen` terminal:

```
✅ charge.refunded [200]
```

In server logs:

```
Webhook: Processing refund for charge: ch_xxxxx
Refund details: {...}
Revoked access for user xxxxx due to refund
✅ Refund recorded in billing history
```

**Step 3: Verify Access Revoked**

Check database:

```sql
SELECT * FROM premium_features WHERE feature = 'pdf_downloads';
-- Should be deleted/empty
```

Try to download PDF:

- Go to /favorites
- Click "Download PDF"
- Should fail or require new payment

**Step 4: Check Billing History**

```sql
SELECT * FROM billing_history WHERE status = 'refunded';
-- Should show refund record
```

---

## Test 6: Error Handling 🚨

**Purpose:** Test edge cases and error scenarios

### 6.1 Invalid Checkout Data

**Test:**

```bash
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"recipeCount": 0}'
```

**Expected:**

```json
{
  "error": "Invalid recipe count"
}
```

### 6.2 Webhook Signature Verification

**Test:**

```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid" \
  -d '{"type": "test"}'
```

**Expected:**

```json
{
  "error": "Invalid signature"
}
```

### 6.3 Rate Limit Exceeded

Run `node test-rate-limiting.js` again

**Expected:** 429 error on 6th request

---

## Test 7: Production Webhook Test 🌐

**Purpose:** Test your configured webhook in Stripe Dashboard

**Step 1: Find Your Webhook**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint

**Step 2: Send Test Webhook**

1. Scroll to "Send test webhook"
2. Select event: `checkout.session.completed`
3. Click "Send test webhook"

**Expected Response:**

```
200 OK
```

**Step 3: Check Event Details**
Click on the event in the events list

**Should show:**

- Request sent: ✅
- Response: 200
- Response body: `{"received": true}`

---

## Test 8: Invoice Email Test 📧

**Purpose:** Verify customers receive invoice emails

**Step 1: Configure Email in Stripe**

1. Go to: https://dashboard.stripe.com/test/settings/emails
2. Ensure "Successful payments" is enabled
3. Check "Send customers a receipt via email"

**Step 2: Make Test Purchase**

- Use a real email you can access
- Complete payment
- Check your inbox

**Expected Email:**

- Subject: "Receipt from IdrisCooks"
- Shows amount charged
- Shows payment method
- Includes invoice link

---

## Final Checklist Before Production ✅

### Code

- [x] Duplicate webhooks removed
- [x] Invoice creation implemented
- [x] Refund handling added
- [x] Rate limiting applied
- [x] Currency display fixed
- [x] Error handling in place

### Configuration

- [ ] Upstash Redis working in production
- [ ] Webhook endpoint configured (LIVE mode)
- [ ] Live Stripe keys added
- [ ] Production domain in NEXT_PUBLIC_BASE_URL
- [ ] Environment variables verified

### Testing

- [ ] Redis connection test passed
- [ ] Rate limiting test passed
- [ ] Webhook test passed (test mode)
- [ ] Full payment flow tested
- [ ] Refund flow tested
- [ ] Invoice email received
- [ ] PDF download working
- [ ] Recipe access working

### Documentation

- [ ] Refund policy live
- [ ] Footer with legal links
- [ ] Support email configured
- [ ] Rate limiting documented

### Monitoring

- [ ] Stripe webhook monitoring enabled
- [ ] Server error logging configured
- [ ] Rate limit logging working
- [ ] Database backups scheduled

---

## Troubleshooting Common Issues

### Issue: Webhook signature verification failed

**Solution:**

```bash
# Make sure you're using the webhook secret from Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the whsec_xxxxx and update .env
# Restart dev server
```

### Issue: Rate limiting not working

**Check:**

1. Redis connection: `node test-redis-connection.js`
2. Server logs for Redis errors
3. Environment variables are set
4. Server restarted after .env changes

### Issue: Invoice not created

**Check:**

1. Webhook fired successfully (check Stripe Dashboard)
2. Server logs for invoice creation errors
3. Stripe API version matches (2025-08-27.basil)
4. Checkout session has line items

### Issue: Refund not revoking access

**Check:**

1. `charge.refunded` event in webhook configuration
2. Server logs for refund processing
3. Database for deleted premium_features record
4. User ID matching correctly

---

## Success Criteria ✅

All tests pass when:

1. **Redis**: ✅ `node test-redis-connection.js` → All tests pass
2. **Rate Limiting**: ✅ `node test-rate-limiting.js` → 6th request gets 429
3. **Webhook**: ✅ `stripe trigger checkout.session.completed` → 200 response
4. **Payment**: ✅ Complete test purchase → Success page shown
5. **Invoice**: ✅ Check Stripe Dashboard → Invoice created and paid
6. **Database**: ✅ Check premium_features → Access granted
7. **Refund**: ✅ Issue refund → Access revoked
8. **Email**: ✅ Receive invoice receipt email

---

## Ready for Production! 🚀

When all tests pass, you're ready to:

1. Switch to live Stripe keys
2. Update production environment variables
3. Deploy to production
4. Configure live webhook endpoint
5. Test with small real payment (£2.99)
6. Monitor for 24 hours
7. Full launch! 🎉

---

**Need Help?**

If any test fails:

1. Check server logs: `npm run dev` output
2. Check Stripe Dashboard → Webhooks → Events
3. Review error messages carefully
4. Check the troubleshooting section above
5. Review the specific test's "What This Tests" section

**Test Results Log:**

```
Test 1 - Redis Connection:     [ ]
Test 2 - Rate Limiting:         [ ]
Test 3 - Webhook Endpoint:      [ ]
Test 4 - Payment Flow:          [ ]
Test 5 - Refund Flow:           [ ]
Test 6 - Error Handling:        [ ]
Test 7 - Production Webhook:    [ ]
Test 8 - Invoice Email:         [ ]

All tests passed: Ready for production! ✅
```
