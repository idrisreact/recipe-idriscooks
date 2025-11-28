/**
 * Test Rate Limiting
 * Run: node test-rate-limiting.js
 * Make sure your dev server is running: npm run dev
 */

async function testRateLimiting() {
  console.log('🔍 Testing Rate Limiting on Payment Endpoint...\n');
  console.log('Configuration:');
  console.log('- Endpoint: /api/stripe/checkout');
  console.log('- Limit: 5 requests per minute');
  console.log('- Expected: First 5 succeed, 6th gets 429\n');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const endpoint = `${baseUrl}/api/stripe/checkout`;

  console.log('Starting test...\n');

  for (let i = 1; i <= 7; i++) {
    try {
      console.log(`Request ${i}:`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeCount: 5 }),
      });

      const status = response.status;
      const headers = {
        limit: response.headers.get('X-RateLimit-Limit'),
        remaining: response.headers.get('X-RateLimit-Remaining'),
        reset: response.headers.get('X-RateLimit-Reset'),
        retryAfter: response.headers.get('Retry-After'),
      };

      if (status === 429) {
        const data = await response.json();
        console.log(`  ⚠️  Status: ${status} (Rate Limited)`);
        console.log(`  Message: ${data.message}`);
        console.log(`  Retry After: ${headers.retryAfter} seconds`);
        console.log(`  Limit: ${headers.limit}`);
        console.log(`  Remaining: ${headers.remaining}\n`);

        console.log('✅ Rate limiting is working correctly!');
        console.log('\nTest Summary:');
        console.log(`- Allowed requests: ${i - 1}/5`);
        console.log(`- Rate limited on request: ${i}`);
        console.log('- Status: PASS ✅\n');
        break;
      } else if (status === 400) {
        const data = await response.json();
        console.log(`  ✅ Status: ${status} (Expected - no auth session)`);
        console.log(`  Message: ${data.error}`);
        console.log(`  Rate Limit Headers:`);
        console.log(`    - Limit: ${headers.limit}`);
        console.log(`    - Remaining: ${headers.remaining}\n`);

        if (headers.remaining === '0') {
          console.log('⚠️  Next request will be rate limited');
        }
      } else {
        console.log(`  Status: ${status}`);
        console.log(`  Rate Limit Headers:`);
        console.log(`    - Limit: ${headers.limit}`);
        console.log(`    - Remaining: ${headers.remaining}\n`);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);

      if (error.message.includes('ECONNREFUSED')) {
        console.log('❌ Dev server not running!');
        console.log('   Start it with: npm run dev\n');
        process.exit(1);
      }
    }
  }

  console.log('\nNext steps:');
  console.log('1. Wait 60 seconds for rate limit to reset');
  console.log('2. Test webhook: node test-webhook-final.js');
  console.log('3. Test full payment flow in browser\n');
}

testRateLimiting();
