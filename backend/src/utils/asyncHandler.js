/**
 * src/utils/asyncHandler.js
 *
 * Wraps an async Express route handler so that any rejected promise is
 * automatically forwarded to next(err), eliminating try/catch boilerplate
 * in every controller.
 *
 * Usage:
 *   router.get('/buses', asyncHandler(async (req, res) => {
 *     const data = await busService.getAll();
 *     sendSuccess(res, data);
 *   }));
 */

/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} fn
 * @returns {import('express').RequestHandler}
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
