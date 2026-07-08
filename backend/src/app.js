/**
 * src/app.js
 *
 * Express application factory.
 *
 * This module ONLY configures the Express app — it does not start listening.
 * Separating app from server makes the app independently testable:
 *
 *   import { createApp } from './app.js';
 *   const app = createApp();
 *   supertest(app).get('/health')...
 *
 * Middleware order is intentional and must not be changed carelessly:
 *   1. Security headers (Helmet)
 *   2. Request ID  ← must be before logger so every log line has an ID
 *   3. Request logger
 *   4. CORS
 *   5. Compression
 *   6. Cookie parser
 *   7. Body parsers
 *   8. Rate limiter
 *   9. Routes
 *  10. 404 handler
 *  11. Global error handler  ← must be last, 4-arity signature
 */

import express          from 'express';
import helmet           from 'helmet';
import cors             from 'cors';
import compression      from 'compression';
import cookieParser     from 'cookie-parser';

import { corsConfig }      from './config/cors.js';
import { helmetConfig }    from './config/security.js';
import { serverConfig }    from './config/server.js';
import { defaultLimiter }  from './config/rateLimiter.js';
import { env }             from './config/env.js';

import { requestId }      from './middleware/requestId.js';
import { requestLogger }  from './middleware/requestLogger.js';
import { notFound }       from './middleware/notFound.js';
import { errorHandler }   from './middleware/errorHandler.js';

import healthRouter from './routes/health.js';
import apiRouter    from './api/routes/index.js';

/**
 * Creates and configures a fresh Express application instance.
 * @returns {import('express').Application}
 */
export function createApp() {
  const app = express();

  // ── Trust proxy (Nginx / cloud LB in production) ──────────────────────────
  if (serverConfig.trustProxy) {
    app.set('trust proxy', serverConfig.trustProxy);
  }

  // ── 1. Security headers ───────────────────────────────────────────────────
  app.use(helmet(helmetConfig));

  // ── 2. Request ID ─────────────────────────────────────────────────────────
  app.use(requestId);

  // ── 3. HTTP request logger ────────────────────────────────────────────────
  app.use(requestLogger);

  // CORS — handles preflight OPTIONS automatically in Express 5
  app.use(cors(corsConfig));

  // ── 5. Compression ────────────────────────────────────────────────────────
  app.use(compression());

  // ── 6. Cookie parser ──────────────────────────────────────────────────────
  app.use(cookieParser());

  // ── 7. Body parsers ───────────────────────────────────────────────────────
  app.use(express.json({ limit: serverConfig.jsonLimit }));
  app.use(express.urlencoded({ extended: true, limit: serverConfig.urlencodedLimit }));

  // ── 8. Rate limiter ───────────────────────────────────────────────────────
  // Applied globally; individual routes can override with strictLimiter / burstLimiter
  if (!env.isTest) {
    app.use(defaultLimiter);
  }

  // ── 9. Routes ─────────────────────────────────────────────────────────────
  app.use('/health',  healthRouter);
  app.use('/api/v1',  apiRouter);

  // ── 10. 404 handler ───────────────────────────────────────────────────────
  app.use(notFound);

  // ── 11. Global error handler ──────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
