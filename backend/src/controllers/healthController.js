/**
 * src/controllers/healthController.js
 *
 * Health-check controller.
 * GET /health → returns platform vitals for load balancers, uptime monitors,
 * and the operations team.
 *
 * This endpoint deliberately has NO authentication so monitoring tools
 * can reach it without credentials.
 */

import os from 'node:os';
import { sendSuccess }   from '../utils/response.js';
import { APP }           from '../constants/app.js';
import { MESSAGES }      from '../constants/messages.js';
import { env }           from '../config/env.js';
import { databaseConfig } from '../config/database.js';
import { redisConfig }   from '../config/redis.js';
import { mitraClient }   from '../services/mitra/index.js';

const startTime = Date.now();

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export function getHealth(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const data = {
    status:      'healthy',
    application: APP.NAME,
    version:     APP.VERSION,
    environment: env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    uptime: {
      seconds: uptimeSeconds,
      human:   formatUptime(uptimeSeconds),
    },
    system: {
      platform:    process.platform,
      nodeVersion: process.version,
      memory: {
        totalMB:  Math.round(os.totalmem()  / 1024 / 1024),
        freeMB:   Math.round(os.freemem()   / 1024 / 1024),
        usedMB:   Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      cpuCount: os.cpus().length,
      loadAvg:  os.loadavg().map((n) => Math.round(n * 100) / 100),
    },
    services: {
      database: databaseConfig.connected ? 'connected' : 'not configured',
      redis:    redisConfig.connected    ? 'connected' : 'not configured',
      mitra: {
        baseUrl: env.MITRA_BASE_URL,
        metrics: mitraClient.getMetrics(),
      },
    },
  };

  sendSuccess(res, data, MESSAGES.HEALTH_OK, 200, req.id);
}

/**
 * Converts seconds to a human-readable uptime string.
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}
