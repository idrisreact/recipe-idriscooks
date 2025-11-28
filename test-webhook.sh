#!/bin/bash

# Test Webhook Endpoint
# This sends a test event to your local webhook endpoint

echo "🧪 Testing Webhook Endpoint..."
echo ""

# Test that server is running
echo "1️⃣  Checking if server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start it with: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣  Testing webhook endpoint..."
echo ""

# Send a test POST request
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
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
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Test complete!"
echo ""
echo "Expected: HTTP Status: 400 (signature verification failed - this is normal for test)"
echo "This confirms your webhook endpoint is accessible."
echo ""
echo "Next: Use Stripe CLI to test with real signatures:"
echo "  brew install stripe/stripe-cli/stripe"
echo "  stripe login"
echo "  stripe listen --forward-to localhost:3000/api/webhooks/stripe"
