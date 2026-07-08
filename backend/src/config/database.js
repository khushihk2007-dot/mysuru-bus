/**
 * src/config/database.js
 *
 * Future database configuration placeholder.
 *
 * When Phase 3 introduces a database (PostgreSQL / Supabase):
 *  1. Install the driver (e.g. `npm install pg` or `npm install @supabase/supabase-js`)
 *  2. Add DATABASE_URL to .env
 *  3. Replace this stub with an actual connection pool / client
 *  4. Export the pool and a `connectDatabase` bootstrap function
 *  5. Call `connectDatabase()` in server.js before httpServer.listen()
 */

export const databaseConfig = Object.freeze({
  // url: env.DATABASE_URL,
  // pool: { min: 2, max: 10 },
  // ssl: env.isProduction ? { rejectUnauthorized: true } : false,
  connected: false,
  message: 'Database not yet configured — stub only',
});
