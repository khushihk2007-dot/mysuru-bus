/**
 * src/config/cors.js
 *
 * CORS policy for Express.
 * The allowed-origins list is driven by the CLIENT_URL env variable.
 * Add additional origins by separating them with commas in .env.
 *
 * Example:
 *   CLIENT_URL=http://localhost:3000,https://app.mysurubus.in
 */

import { env } from './env.js';

/** Parse and normalise the comma-separated CLIENT_URL list */
const allowedOrigins = env.CLIENT_URL
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

/**
 * @param {string} origin
 * @param {Function} callback
 */
function originValidator(origin, callback) {
  // Allow server-to-server requests (no Origin header)
  if (!origin) return callback(null, true);

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error(`CORS policy: origin "${origin}" is not allowed.`));
  }
}

export const corsConfig = {
  origin: originValidator,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 h preflight cache
};
