#!/bin/bash

# Test Production Webhook Endpoint
# Tests that your production webhook at https://recipe-idriscooks.vercel.app is accessible

echo "🧪 Testing Production Webhook Endpoint..."
echo ""
echo "Testing: https://recipe-idriscooks.vercel.app/api/webhooks/stripe"
echo ""

# Test that endpoint is accessible
echo "1️⃣  Checking if webhook endpoint is accessible..."
response=$(curl -X POST https://recipe-idriscooks.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{
    "id": "evt_test_webhook",
    "object": "event",
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "payment_status": "paid",
        "customer_email": "test@example.com",
        "amount_total": 299,
        "currency": "gbp",
        "metadata": {
          "userId": "test_user",
          "type": "pdf_download",
          "recipeCount": "5"
        }
      }
    }
  }' \
  -s \
  -w "\nHTTP_STATUS:%{http_code}" \
  -o /tmp/webhook-response.txt)

http_code=$(echo "$response" | grep "HTTP_STATUS:" | cut -d':' -f2)
response_body=$(cat /tmp/webhook-response.txt)

echo ""
echo "Response Status: $http_code"
echo "Response Body: $response_body"
echo ""

if [ "$http_code" = "400" ]; then
    echo "✅ Webhook endpoint is accessible!"
    echo "   HTTP 400 (signature verification failed) is expected for test requests."
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Check Stripe Dashboard → Webhooks"
    echo "   2. Verify webhook endpoint is registered for PRODUCTION"
    echo "   3. Ensure these events are selected:"
    echo "      - checkout.session.completed"
    echo "      - charge.refunded"
    echo "      - customer.subscription.created"
    echo "      - customer.subscription.updated"
    echo "      - customer.subscription.deleted"
    echo "      - invoice.payment_succeeded"
    echo "      - invoice.payment_failed"
    echo "   4. Copy the webhook signing secret"
    echo "   5. Add it to Vercel environment variables as STRIPE_WEBHOOK_SECRET"
    echo ""
elif [ "$http_code" = "500" ]; then
    echo "⚠️  Webhook endpoint is accessible but returned server error"
    echo "   This could indicate:"
    echo "   - Database connection issues"
    echo "   - Missing environment variables"
    echo "   - Code errors in webhook handler"
    echo ""
    echo "🔍 Check Vercel logs:"
    echo "   vercel logs https://recipe-idriscooks.vercel.app"
    echo ""
elif [ "$http_code" = "404" ]; then
    echo "❌ Webhook endpoint NOT FOUND"
    echo "   Expected: /api/webhooks/stripe"
    echo "   Check your deployment and route configuration"
    echo ""
else
    echo "❌ Unexpected response: $http_code"
    echo "   Response: $response_body"
    echo ""
fi

# Test basic connectivity
echo "2️⃣  Testing basic site connectivity..."
site_status=$(curl -s -o /dev/null -w "%{http_code}" https://recipe-idriscooks.vercel.app)
if [ "$site_status" = "200" ]; then
    echo "✅ Site is accessible (HTTP $site_status)"
else
    echo "⚠️  Site returned: HTTP $site_status"
fi

echo ""
echo "========================================="
echo "📋 Quick Checklist for Production Webhooks"
echo "========================================="
echo ""
echo "□ Webhook endpoint registered in Stripe Dashboard (LIVE mode)"
echo "  URL: https://recipe-idriscooks.vercel.app/api/webhooks/stripe"
echo ""
echo "□ All required events selected in Stripe webhook configuration"
echo ""
echo "□ STRIPE_WEBHOOK_SECRET environment variable set in Vercel"
echo "  (Use the signing secret from Stripe Dashboard)"
echo ""
echo "□ STRIPE_SECRET_KEY uses live key (sk_live_...)"
echo ""
echo "□ Database accessible from Vercel deployment"
echo ""
echo "□ Test with real payment to verify end-to-end flow"
echo ""
