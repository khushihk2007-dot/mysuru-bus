/**
 * src/config/redis.js
 *
 * Future Redis / cache configuration placeholder.
 *
 * When Phase 4 introduces caching (e.g. ioredis / upstash-redis):
 *  1. Install the client: `npm install ioredis`
 *  2. Add REDIS_URL to .env
 *  3. Replace this stub with the real client and `connectRedis()` function
 *  4. Call `connectRedis()` in server.js after database connects
 *
 * Planned use cases:
 *  - Route / stop data cache (TTL: 5 min)
 *  - Real-time bus position cache (TTL: 15 s)
 *  - ETA computation cache (TTL: 30 s)
 *  - Session / token store
 */

export const redisConfig = Object.freeze({
  // url: env.REDIS_URL,
  // keyPrefix: 'mysore-bus:',
  // defaultTTL: 300,
  connected: false,
  message: 'Redis not yet configured — stub only',
});
