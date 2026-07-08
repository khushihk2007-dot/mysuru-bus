/**
 * src/middleware/requestId.js
 *
 * Attaches a unique UUID v4 to every incoming request as `req.id`.
 * The ID is echoed back in the X-Request-ID response header so clients
 * can correlate their requests with server-side log entries.
 *
 * If the client sends an X-Request-ID header, we honour it instead of
 * generating a new one — useful for distributed tracing.
 */

import { v4 as uuidv4 } from 'uuid';
import { APP } from '../constants/app.js';

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requestId(req, res, next) {
  // Honour client-provided trace IDs (e.g. from API gateways)
  const existing = req.headers[APP.REQUEST_ID_HEADER.toLowerCase()];
  req.id = (typeof existing === 'string' && existing.trim()) ? existing.trim() : uuidv4();

  // Echo back so clients can correlate
  res.setHeader(APP.REQUEST_ID_HEADER, req.id);

  next();
}
