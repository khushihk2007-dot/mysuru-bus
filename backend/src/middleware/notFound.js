/**
 * src/middleware/notFound.js
 *
 * Catch-all 404 handler.
 * Registered AFTER all routes but BEFORE the global error handler.
 * Any request that doesn't match a route falls through to here.
 */

import { NotFoundError } from '../errors/index.js';

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function notFound(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
}
