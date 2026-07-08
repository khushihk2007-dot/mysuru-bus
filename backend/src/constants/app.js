/**
 * src/constants/app.js
 *
 * Application-level constants.
 * Covers versioning, limits, and identifiers used across modules.
 */

export const APP = Object.freeze({
  NAME:        'Mysore Bus Backend',
  VERSION:     '1.0.0',
  API_VERSION: 'v1',

  // Pagination defaults (used when transit API returns lists)
  DEFAULT_PAGE:      1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE:     100,

  // Request ID header sent back to clients for tracing
  REQUEST_ID_HEADER: 'X-Request-ID',

  // Default coordinate precision (decimal places)
  COORD_PRECISION: 6,
});
