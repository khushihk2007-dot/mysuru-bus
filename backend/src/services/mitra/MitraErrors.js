/**
 * src/services/mitra/MitraErrors.js
 *
 * MITRA-specific error hierarchy.
 *
 * Every error that can originate from the MITRA HTTP client is represented
 * here as a named class. Consumers (services, repositories) catch these
 * typed errors and map them to application-level errors — raw Axios errors
 * are NEVER allowed to escape the client layer.
 *
 * Hierarchy:
 *
 *   MitraBaseError
 *   ├── MitraConfigurationError   — bad config / env vars
 *   ├── MitraTimeoutError         — request exceeded timeout
 *   ├── MitraNetworkError         — DNS failure, connection refused, ECONNRESET
 *   ├── MitraResponseError        — unexpected HTTP status or malformed body
 *   └── MitraServerError          — HTTP 5xx from the MITRA backend
 */

// ── Base error ───────────────────────────────────────────────────────────────

export class MitraBaseError extends Error {
  /**
   * @param {string} message
   * @param {string} code          Machine-readable error code
   * @param {object} [context={}]  Diagnostic context (endpoint, attempt, etc.)
   */
  constructor(message, code, context = {}) {
    super(message);
    this.name    = this.constructor.name;
    this.code    = code;
    this.context = context;
    this.isMitraError = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name:    this.name,
      code:    this.code,
      message: this.message,
      context: this.context,
    };
  }
}

// ── Configuration error ──────────────────────────────────────────────────────

/**
 * Thrown when the MITRA client cannot initialise due to invalid or
 * missing configuration (e.g. a bad MITRA_BASE_URL, zero timeout).
 *
 * This error is fatal — the server should not start if it is thrown.
 */
export class MitraConfigurationError extends MitraBaseError {
  /** @param {string} message @param {object} [context] */
  constructor(message, context = {}) {
    super(message, 'MITRA_CONFIG_ERROR', context);
  }
}

// ── Timeout error ────────────────────────────────────────────────────────────

/**
 * Thrown when a request to MITRA exceeds the configured timeout.
 * Axios surfaces this as ECONNABORTED or ERR_CANCELED.
 */
export class MitraTimeoutError extends MitraBaseError {
  /**
   * @param {string} endpoint   URL that timed out
   * @param {number} timeoutMs  Configured timeout in milliseconds
   * @param {object} [context]
   */
  constructor(endpoint, timeoutMs, context = {}) {
    super(
      `MITRA request timed out after ${timeoutMs}ms: ${endpoint}`,
      'MITRA_TIMEOUT',
      { endpoint, timeoutMs, ...context },
    );
    this.endpoint  = endpoint;
    this.timeoutMs = timeoutMs;
  }
}

// ── Network error ────────────────────────────────────────────────────────────

/**
 * Thrown when a network-level error prevents the request from reaching
 * the MITRA backend: DNS failure, connection refused, ECONNRESET, etc.
 * These are typically transient and safe to retry.
 */
export class MitraNetworkError extends MitraBaseError {
  /**
   * @param {string} endpoint
   * @param {string} cause      Original error message from Axios / Node.js
   * @param {object} [context]
   */
  constructor(endpoint, cause, context = {}) {
    super(
      `MITRA network error for ${endpoint}: ${cause}`,
      'MITRA_NETWORK_ERROR',
      { endpoint, cause, ...context },
    );
    this.endpoint = endpoint;
  }
}

// ── Response error ───────────────────────────────────────────────────────────

/**
 * Thrown when the MITRA backend responds with an unexpected HTTP status
 * (4xx) or returns a body that cannot be processed.
 * These are NOT safe to retry automatically.
 */
export class MitraResponseError extends MitraBaseError {
  /**
   * @param {string} endpoint
   * @param {number} statusCode  HTTP status code received
   * @param {string} [body]      Raw response body (truncated)
   * @param {object} [context]
   */
  constructor(endpoint, statusCode, body = '', context = {}) {
    super(
      `MITRA returned HTTP ${statusCode} for ${endpoint}`,
      'MITRA_RESPONSE_ERROR',
      { endpoint, statusCode, body: body.slice(0, 200), ...context },
    );
    this.endpoint   = endpoint;
    this.statusCode = statusCode;
    this.body       = body;
  }
}

// ── Server error ─────────────────────────────────────────────────────────────

/**
 * Thrown when the MITRA backend returns HTTP 5xx.
 * Considered transient — the retry engine will attempt to recover.
 */
export class MitraServerError extends MitraBaseError {
  /**
   * @param {string} endpoint
   * @param {number} statusCode  5xx status code
   * @param {string} [body]
   * @param {object} [context]
   */
  constructor(endpoint, statusCode, body = '', context = {}) {
    super(
      `MITRA server error HTTP ${statusCode} for ${endpoint}`,
      'MITRA_SERVER_ERROR',
      { endpoint, statusCode, body: body.slice(0, 200), ...context },
    );
    this.endpoint   = endpoint;
    this.statusCode = statusCode;
    this.body       = body;
  }
}
