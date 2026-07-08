/**
 * src/config/logger.js
 *
 * Pino logger factory.
 * Returns a singleton logger configured for the current NODE_ENV.
 *
 * Development  → human-readable pretty output via pino-pretty
 * Production   → JSON (NDJSON) output suitable for log aggregators
 *                (Datadog, Loki, CloudWatch, etc.)
 */

import pino from 'pino';
import { env } from './env.js';

const transport = env.isDevelopment
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: '{msg}',
        singleLine: false,
      },
    }
  : undefined; // production → raw JSON to stdout

export const logger = pino(
  {
    level: env.LOG_LEVEL,
    base: { service: 'mysore-bus-backend', env: env.NODE_ENV },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
    redact: {
      // Never log secrets, even by accident
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.apiKey'],
      censor: '[REDACTED]',
    },
  },
  transport ? pino.transport(transport) : undefined,
);
