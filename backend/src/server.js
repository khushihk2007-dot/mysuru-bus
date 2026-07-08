/**
 * src/server.js
 *
 * HTTP server entry point.
 *
 * Responsibilities:
 *  1. Bootstrap the Express app
 *  2. Start the HTTP server
 *  3. Register process-level signal handlers for graceful shutdown
 *  4. Handle uncaught exceptions and unhandled rejections
 *
 * This module does NOT contain any business logic.
 * All Express configuration lives in app.js.
 */

import http from 'node:http';
import { createApp }    from './app.js';
import { logger }       from './config/logger.js';
import { env }          from './config/env.js';
import { serverConfig } from './config/server.js';
import { APP }          from './constants/app.js';

// ── Bootstrap ──────────────────────────────────────────────────────────────

const app    = createApp();
const server = http.createServer(app);

// ── Start listening ────────────────────────────────────────────────────────

server.listen(serverConfig.port, () => {
  logger.info(
    {
      name:    APP.NAME,
      version: APP.VERSION,
      port:    serverConfig.port,
      env:     env.NODE_ENV,
      pid:     process.pid,
    },
    `🚌 ${APP.NAME} v${APP.VERSION} started on port ${serverConfig.port} [${env.NODE_ENV}]`,
  );
});

// ── Graceful shutdown ──────────────────────────────────────────────────────

/**
 * Graceful shutdown sequence:
 *  1. Stop accepting new connections (server.close)
 *  2. Wait for in-flight requests to complete (up to 10 s)
 *  3. Close DB / Redis connections (Phase 3+)
 *  4. Exit cleanly
 */
function gracefulShutdown(signal) {
  logger.info({ signal }, 'Shutdown signal received — draining connections…');

  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error while closing server');
      process.exit(1);
    }

    logger.info('HTTP server closed — all connections drained');
    // Future: await db.disconnect(); await redis.quit();
    process.exit(0);
  });

  // Force-kill after 10 seconds if draining takes too long
  setTimeout(() => {
    logger.warn('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// ── Process-level error guards ─────────────────────────────────────────────

/**
 * Handles programming errors that slipped through async handlers.
 * Log and exit — a process manager (PM2 / Docker) will restart the service.
 */
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'UNCAUGHT EXCEPTION — shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'UNHANDLED PROMISE REJECTION — shutting down');
  process.exit(1);
});

export { server };
