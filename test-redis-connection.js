/**
 * Test Upstash Redis Connection
 * Run: node test-redis-connection.js
 */

require('dotenv').config();
const { Redis } = require('@upstash/redis');

async function testRedisConnection() {
  console.log('🔍 Testing Upstash Redis Connection...\n');

  // Check environment variables
  console.log('1️⃣ Checking environment variables:');
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log('❌ Missing Upstash credentials in .env file');
    console.log('   UPSTASH_REDIS_REST_URL:', url ? '✅ Set' : '❌ Missing');
    console.log('   UPSTASH_REDIS_REST_TOKEN:', token ? '✅ Set' : '❌ Missing');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log('   URL:', url);
  console.log('   Token:', token.substring(0, 20) + '...\n');

  // Test connection
  console.log('2️⃣ Testing Redis connection:');

  try {
    const redis = new Redis({
      url,
      token,
    });

    // Test PING
    console.log('   Testing PING...');
    const pingResult = await redis.ping();
    console.log('   ✅ PING response:', pingResult);

    // Test SET
    console.log('   Testing SET...');
    await redis.set('test-key', 'test-value');
    console.log('   ✅ SET successful');

    // Test GET
    console.log('   Testing GET...');
    const value = await redis.get('test-key');
    console.log('   ✅ GET response:', value);

    // Test DELETE
    console.log('   Testing DEL...');
    await redis.del('test-key');
    console.log('   ✅ DEL successful');

    // Test rate limiting pattern
    console.log('\n3️⃣ Testing rate limit operations:');
    const identifier = 'test-user';
    const key = `ratelimit:payment:${identifier}`;

    // Increment counter
    await redis.incr(key);
    await redis.expire(key, 60); // 60 seconds expiry
    const count = await redis.get(key);

    console.log('   ✅ Rate limit counter:', count);
    console.log('   ✅ Expiry set to 60 seconds');

    // Cleanup
    await redis.del(key);

    console.log('\n🎉 All tests passed! Redis is working correctly.\n');
    console.log('Next steps:');
    console.log('1. Restart your dev server (npm run dev)');
    console.log('2. Rate limiting will now use Redis instead of memory');
    console.log('3. Test rate limiting with: node test-rate-limiting.js\n');
  } catch (error) {
    console.log('\n❌ Redis connection failed:');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check Upstash dashboard: https://console.upstash.com');
    console.log('2. Verify URL and token are correct');
    console.log('3. Check if Redis instance is active');
    console.log('4. Check network/firewall settings\n');
    process.exit(1);
  }
}

testRedisConnection();
