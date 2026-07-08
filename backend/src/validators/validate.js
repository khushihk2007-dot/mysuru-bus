/**
 * src/validators/validate.js
 *
 * Reusable Zod validation middleware factory.
 *
 * Usage — apply to any route:
 *
 *   import { validate } from '../validators/validate.js';
 *   import { z } from 'zod';
 *
 *   const schema = z.object({
 *     body:   z.object({ name: z.string().min(1) }),
 *     query:  z.object({ page: z.coerce.number().optional() }),
 *     params: z.object({ id: z.string().uuid() }),
 *   });
 *
 *   router.post('/resource/:id', validate(schema), handler);
 *
 * Keys that are not provided in the schema are simply ignored (not stripped).
 */

import { z } from 'zod';
import { ValidationError } from '../errors/index.js';

/**
 * Formats Zod issues into a developer-friendly structure.
 * @param {import('zod').ZodIssue[]} issues
 * @returns {Array<{ field: string; message: string }>}
 */
function formatZodErrors(issues) {
  return issues.map((issue) => ({
    field:   issue.path.join('.') || 'root',
    message: issue.message,
  }));
}

/**
 * Creates an Express middleware that validates req.body / req.query / req.params
 * against the provided Zod schema.
 *
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body:   req.body,
      query:  req.query,
      params: req.params,
    });

    if (!result.success) {
      const details = formatZodErrors(result.error.issues);
      return next(new ValidationError('Validation failed. Please check the submitted data.', details));
    }

    // Attach parsed (coerced & stripped) data back onto req
    if (result.data.body   !== undefined) req.body   = result.data.body;
    if (result.data.query  !== undefined) req.query  = result.data.query;
    if (result.data.params !== undefined) req.params = result.data.params;

    next();
  };
}

/**
 * Pre-built common schema fragments — import and compose in route validators.
 */
export const commonSchemas = {
  /** Standard UUID path parameter, e.g. /resource/:id */
  uuidParam: z.object({
    params: z.object({
      id: z.string().uuid({ message: 'Parameter "id" must be a valid UUID' }),
    }),
  }),

  /** Pagination query parameters */
  pagination: z.object({
    query: z.object({
      page:     z.coerce.number().int().min(1).optional().default(1),
      pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
    }),
  }),

  /** Coordinate pair for geo queries */
  coordinates: z.object({
    query: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lon: z.coerce.number().min(-180).max(180),
    }),
  }),
};
