/**
 * src/config/security.js
 *
 * Helmet configuration.
 * Helmet sets security-focused HTTP response headers by default.
 * The configuration below is tuned for a JSON API (no HTML served).
 */

export const helmetConfig = {
  // Disable CSP for a pure JSON API — re-enable if you ever serve HTML
  contentSecurityPolicy: false,

  // Prevent clickjacking (irrelevant for API, but harmless)
  frameguard: { action: 'deny' },

  // Disable caching on all API responses so clients always fetch fresh data
  noCache: true,

  // Remove the X-Powered-By header (already removed by Helmet by default)
  hidePoweredBy: true,

  // Enable HSTS in production only
  hsts: {
    maxAge: 31536000,           // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Prevent MIME-type sniffing
  noSniff: true,

  // Enable XSS filter in older browsers
  xssFilter: true,
};
