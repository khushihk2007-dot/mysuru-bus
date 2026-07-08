/**
 * src/services/mitra/MitraConstants.js
 *
 * All MITRA-specific constants in one place.
 *
 * These were reverse-engineered from the KSRTC MITRA Android application
 * and the public transit tracking web interface.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT: These constants encode how the MITRA backend API works.
 * Any changes to endpoint paths or parameter names must be tested against
 * the live MITRA service before merging.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Client identity ──────────────────────────────────────────────────────────
export const USER_AGENT     = 'MysoreTransitClient/2.0 (KSRTC-Transit-Platform)';
export const ACCEPT         = '*/*';
export const ACCEPT_ENCODING = 'gzip, deflate';

// ── Content types ────────────────────────────────────────────────────────────
// MITRA endpoints expect form-encoded POST bodies, NOT JSON.
export const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded';
export const CONTENT_TYPE_JSON = 'application/json';

// ── Default timeout tiers (milliseconds) ─────────────────────────────────────
// These are advisory — actual timeouts are driven by env vars in MitraConfig.
export const TIMEOUT_FAST    = 5_000;   // Cheap lookups (stop info, route meta)
export const TIMEOUT_DEFAULT = 10_000;  // Standard requests (live bus positions)
export const TIMEOUT_SLOW    = 20_000;  // Heavy payloads (full route list)

// ── Retry policy ──────────────────────────────────────────────────────────────
// HTTP status codes that are safe to retry.
export const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

// HTTP status codes that should NEVER be retried (client errors = our fault).
export const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403, 404, 405, 422]);

// ── MITRA API parameter names ─────────────────────────────────────────────────
// These exact strings are required by the MITRA backend.
export const PARAM = Object.freeze({
  CITY_ID:         'city_id',
  ROUTE_ID:        'route_id',
  TRIP_ID:         'trip_id',
  STOP_ID:         'stop_id',
  VEHICLE_ID:      'vehicleId',
  SOURCE_STOP:     'source',
  DESTINATION_STOP:'destination',
  LANGUAGE:        'lan',
  PAGE:            'pageNo',
  PAGE_SIZE:       'pageSize',
});

// ── Known MITRA city / region identifiers ─────────────────────────────────────
export const CITY = Object.freeze({
  MYSORE: '1',
});

// ── Default language code ─────────────────────────────────────────────────────
export const DEFAULT_LANGUAGE = 'en';

// ── Connection keep-alive ──────────────────────────────────────────────────────
export const KEEP_ALIVE_TIMEOUT_MS  = 60_000; // 60 seconds
export const KEEP_ALIVE_MAX_SOCKETS = 10;
