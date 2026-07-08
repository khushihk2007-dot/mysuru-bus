/**
 * src/middleware/requestLogger.js
 *
 * HTTP request / response logger powered by pino-http.
 * Logs method, URL, status code, and response time on each request.
 *
 * Sensitive headers (Authorization, Cookie) are never logged thanks to
 * the redact configuration in src/config/logger.js.
 */

import pinoHttp from 'pino-http';
import { logger } from '../config/logger.js';

export const requestLogger = pinoHttp({
  logger,

  // Attach req.id to every log line
  genReqId: (req) => req.id,

  // Suppress 200-level health-check spam in production
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },

  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400)        return 'warn';
    return 'info';
  },

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} → ${res.statusCode}`;
  },

  customErrorMessage(req, res, err) {
    return `${req.method} ${req.url} → ${res.statusCode} — ${err.message}`;
  },

  serializers: {
    req(req) {
      return {
        id:     req.id,
        method: req.method,
        url:    req.url,
        // Omit full headers to avoid accidental secret leakage
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});
