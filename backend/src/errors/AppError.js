/**
 * src/errors/AppError.js
 *
 * Base application error class.
 *
 * All custom errors in this codebase extend AppError.
 * This allows the global error handler to distinguish between
 * "known operational errors" (AppError instances) and
 * "unknown programming errors" (plain Error instances).
 *
 * Properties:
 *  - message      Human-readable description
 *  - statusCode   HTTP status code to send to the client
 *  - code         Machine-readable error code (for client-side handling)
 *  - isOperational Marks safe-to-expose errors (true) vs bugs (false)
 *  - details      Optional extra info (validation errors, context, etc.)
 */

export class AppError extends Error {
  /**
   * @param {string} message       - Human-readable description
   * @param {number} statusCode    - HTTP status code
   * @param {string} [code]        - Machine-readable error code
   * @param {*}      [details]     - Optional extra context
   */
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = null) {
    super(message);

    this.name         = this.constructor.name;
    this.statusCode   = statusCode;
    this.code         = code;
    this.details      = details;
    this.isOperational = true;  // Safe to expose to the client

    // Preserve correct stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
