/**
 * src/middleware/errorHandler.js
 *
 * Global error-handling middleware.
 * Must be registered LAST in the Express middleware chain (after all routes).
 *
 * Responsibilities:
 *  1. Log the error with full context
 *  2. Distinguish operational errors (AppError) from programming bugs
 *  3. Send a standardised JSON error response via sendError()
 *  4. Never leak stack traces or internal details in production
 */

import { AppError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Normalises any thrown value into an AppError-like object.
 * @param {*} err
 * @returns {AppError | Error}
 */
function normalise(err) {
  if (err instanceof AppError) return err;

  // Wrap plain errors in a generic server error
  const wrapped       = new AppError(
    'An unexpected error occurred',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'INTERNAL_SERVER_ERROR',
  );
  wrapped.isOperational = false;
  wrapped.originalError = err;
  return wrapped;
}

/**
 * Express 4-arity error handler.
 * The `_next` parameter is required even if unused — Express uses arity
 * to detect error handlers.
 *
 * @param {*}      err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const error = normalise(err);

  // Log at 'error' for server faults, 'warn' for client faults
  const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](
    {
      requestId: req.id,
      method:    req.method,
      url:       req.originalUrl,
      statusCode: error.statusCode,
      code:      error.code,
      ...(error.isOperational ? {} : { stack: error.stack }),
    },
    error.message,
  );

  if (req.originalUrl?.startsWith('/api/')) {
    const statusCode = error.statusCode ?? 500;
    const code = error.code ?? 'INTERNAL_SERVER_ERROR';
    const message = error.isOperational ? error.message : 'An unexpected error occurred';
    res.status(statusCode).json({
      success: false,
      error: { code, message },
      timestamp: new Date().toISOString(),
      requestId: req.id ?? null,
    });
  } else {
    sendError(res, error, req.id);
  }
}
