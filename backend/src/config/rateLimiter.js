/**
 * src/config/rateLimiter.js
 *
 * Rate-limiting strategy using express-rate-limit.
 * Multiple presets let different route groups have different budgets.
 *
 * Usage (in route files):
 *   import { defaultLimiter, strictLimiter } from '../config/rateLimiter.js';
 *   router.use(defaultLimiter);
 */

import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { sendError } from '../utils/response.js';
import { AppError } from '../errors/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/** Standard response when rate-limit is hit */
const rateLimitHandler = (req, res) => {
  const error = new AppError(
    'Too many requests. Please slow down and try again later.',
    HTTP_STATUS.TOO_MANY_REQUESTS,
    'RATE_LIMIT_EXCEEDED',
  );
  sendError(res, error, req.id);
};

/**
 * Default limiter — suitable for most API endpoints.
 * Reads window and max from env so they can be tuned without code changes.
 */
export const defaultLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => env.isTest,
});

/**
 * Strict limiter — for sensitive endpoints like auth, feedback, etc.
 * 20 requests per 15 minutes.
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => env.isTest,
});

/**
 * Burst limiter — for high-frequency polling endpoints (e.g. live GPS).
 * 300 requests per minute.
 */
export const burstLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => env.isTest,
});
