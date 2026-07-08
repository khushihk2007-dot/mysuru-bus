/**
 * src/utils/retryHelper.js
 *
 * Exponential back-off retry utility for unreliable external calls.
 * Used when calling the MITRA API, which may occasionally time out.
 *
 * Features:
 *  - Configurable attempt count
 *  - Exponential back-off with optional jitter
 *  - Per-attempt error logging
 *  - Aborts immediately on non-retryable errors (4xx client errors)
 */

import { logger } from '../config/logger.js';

/**
 * @typedef {Object} RetryOptions
 * @property {number}   [attempts=3]        Maximum total attempts (including first)
 * @property {number}   [baseDelayMs=500]   Base delay before the first retry
 * @property {number}   [maxDelayMs=10000]  Cap on any single delay
 * @property {boolean}  [jitter=true]       Add ±20% random jitter to avoid thundering herd
 * @property {(err: Error, attempt: number) => boolean} [isRetryable]
 *           Return false to abort immediately without retrying (default: retry all)
 */

/**
 * Executes `fn`, retrying on failure with exponential back-off.
 *
 * @template T
 * @param {() => Promise<T>}  fn
 * @param {RetryOptions}      [options]
 * @returns {Promise<T>}
 */
export async function withRetry(fn, options = {}) {
  const {
    attempts    = 3,
    baseDelayMs = 500,
    maxDelayMs  = 10_000,
    jitter      = true,
    isRetryable = () => true,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === attempts || !isRetryable(err, attempt)) {
        logger.warn({ attempt, attempts, err: err.message }, 'Retryable call failed — giving up');
        throw err;
      }

      // Exponential back-off: 500ms, 1000ms, 2000ms…
      let delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      if (jitter) delay *= 0.8 + Math.random() * 0.4; // ±20%

      logger.warn(
        { attempt, attemptsLeft: attempts - attempt, delayMs: Math.round(delay), err: err.message },
        'Retrying after error',
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Returns an `isRetryable` function that skips retry for HTTP 4xx client errors.
 * Pass to withRetry when calling external APIs.
 * @param {Error & { response?: { status?: number } }} err
 * @returns {boolean}
 */
export const skipClientErrors = (err) => {
  const status = err?.response?.status;
  return !status || status >= 500; // retry only on 5xx / network errors
};
