/**
 * src/errors/index.js
 *
 * Central export point for all custom error classes.
 * Import from here to keep imports clean across the codebase:
 *
 *   import { NotFoundError, ValidationError } from '../errors/index.js';
 */

import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// ── Validation Error (400) ───────────────────────────────────────────────────
export class ValidationError extends AppError {
  /** @param {string} message @param {*} [details] */
  constructor(message = 'Validation failed', details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }
}

// ── Not Found Error (404) ────────────────────────────────────────────────────
export class NotFoundError extends AppError {
  /** @param {string} [resource] */
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
}

// ── Unauthorized Error (401) ─────────────────────────────────────────────────
export class UnauthorizedError extends AppError {
  /** @param {string} [message] */
  constructor(message = 'Authentication required') {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}

// ── Forbidden Error (403) ────────────────────────────────────────────────────
export class ForbiddenError extends AppError {
  /** @param {string} [message] */
  constructor(message = 'You do not have permission to perform this action') {
    super(message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }
}

// ── Conflict Error (409) ─────────────────────────────────────────────────────
export class ConflictError extends AppError {
  /** @param {string} [message] */
  constructor(message = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT, 'CONFLICT');
  }
}

// ── API / Gateway Error (502) ────────────────────────────────────────────────
/**
 * Used when an upstream service (e.g. MITRA API) returns an error
 * or is unreachable. Keeps third-party details out of the client response.
 */
export class ApiError extends AppError {
  /**
   * @param {string} [message]
   * @param {number} [statusCode]
   * @param {*}      [details]
   */
  constructor(
    message   = 'An upstream API error occurred',
    statusCode = HTTP_STATUS.BAD_GATEWAY,
    details    = null,
  ) {
    super(message, statusCode, 'API_ERROR', details);
  }
}

// ── Internal Server Error (500) ──────────────────────────────────────────────
/**
 * Use only for logic bugs where you want to communicate "this is our fault".
 * For truly unexpected errors, let them bubble as plain Error instances —
 * the global handler will map them to 500 anyway.
 */
export class InternalServerError extends AppError {
  /** @param {string} [message] */
  constructor(message = 'An unexpected internal error occurred') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR');
    this.isOperational = false; // Do NOT expose stack to client
  }
}

// Re-export the base so callers can catch `instanceof AppError`
export { AppError };
