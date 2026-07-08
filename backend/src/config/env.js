/**
 * src/config/env.js
 *
 * Environment configuration loader.
 * Validates all required env variables at startup so the server fails fast
 * rather than crashing midway through a request.
 *
 * All other config modules import from here instead of reading process.env
 * directly, keeping env access centralised and auditable.
 */

import 'dotenv/config';

/**
 * Reads an environment variable, returning a fallback if it is absent.
 * @param {string} key
 * @param {string} [fallback]
 * @returns {string}
 */
function get(key, fallback) {
  const value = process.env[key];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

/**
 * Reads an env variable as a positive integer.
 * @param {string} key
 * @param {number} fallback
 * @returns {number}
 */
function getInt(key, fallback) {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) throw new Error(`Env variable ${key} must be an integer, got: "${raw}"`);
  return parsed;
}

export const env = Object.freeze({
  // ── Server ─────────────────────────────────────────────────
  PORT: getInt('PORT', 4000),
  NODE_ENV: get('NODE_ENV', 'development'),

  // ── CORS ───────────────────────────────────────────────────
  CLIENT_URL: get('CLIENT_URL', 'http://localhost:3000'),

  // ── External APIs ─────────────────────────────────────────
  MITRA_BASE_URL: get('MITRA_BASE_URL', 'https://mtis.mysuru.gov.in/api'),
  MITRA_API_KEY: get('MITRA_API_KEY', ''),

  // ── HTTP Client ───────────────────────────────────────────
  REQUEST_TIMEOUT: getInt('REQUEST_TIMEOUT', 10000),

  // ── Logging ───────────────────────────────────────────────
  LOG_LEVEL: get('LOG_LEVEL', 'info'),

  // ── Rate Limiting ─────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: getInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  RATE_LIMIT_MAX: getInt('RATE_LIMIT_MAX', 100),

  // ── Security ──────────────────────────────────────────────
  REQUEST_SIZE_LIMIT: get('REQUEST_SIZE_LIMIT', '10kb'),

  // ── Convenience flags ─────────────────────────────────────
  get isDevelopment() { return this.NODE_ENV === 'development'; },
  get isProduction()  { return this.NODE_ENV === 'production';  },
  get isTest()        { return this.NODE_ENV === 'test';        },
});
