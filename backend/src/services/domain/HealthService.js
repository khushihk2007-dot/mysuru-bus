/**
 * src/services/domain/HealthService.js
 *
 * Transit Backend Health Service.
 *
 * Evaluates the reachability and performance metrics of external connections,
 * resource utilization, and internal client states.
 */

import os from 'node:os';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { APP } from '../../constants/app.js';
import { databaseConfig } from '../../config/database.js';
import { redisConfig } from '../../config/redis.js';
import { mitraClient as defaultMitraClient } from '../mitra/index.js';

const startTime = Date.now();

export class HealthService {
  /**
   * @param {object} [deps]
   * @param {import('../mitra/MitraClient').MitraClient} [deps.mitraClient]
   */
  constructor({ mitraClient = defaultMitraClient } = {}) {
    this._mitraClient = mitraClient;
  }

  /**
   * Evaluates if the MITRA base API is reachable via an active HTTP connection probe.
   *
   * @returns {Promise<{ status: string, latencyMs: number, reachability: boolean }>}
   */
  async checkMitraReachability() {
    const start = Date.now();
    logger.debug('Probing MITRA reachability');

    try {
      // Direct GET / request with a short timeout override to prevent hanging
      await this._mitraClient.get('/', {}, { timeout: 3000, maxRetries: 0 });
      const latencyMs = Date.now() - start;

      return {
        status: 'UP',
        latencyMs,
        reachability: true,
      };
    } catch (err) {
      // 404 or any other response status means the server is reachable and active.
      // Network timeouts, socket hangs, DNS resolution failures mean it is DOWN.
      const latencyMs = Date.now() - start;
      const isReachable = err.code !== 'MITRA_TIMEOUT' && err.code !== 'MITRA_NETWORK_ERROR';

      logger.warn({ err: err.message, isReachable }, 'MITRA reachability probe finished');

      return {
        status: isReachable ? 'UP' : 'DOWN',
        latencyMs,
        reachability: isReachable,
      };
    }
  }

  /**
   * Compiles diagnostic reports and metrics for backend services.
   *
   * @returns {Promise<object>}
   */
  async getHealthDetails() {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const mitraReachability = await this.checkMitraReachability();
    const mitraMetrics = this._mitraClient.getMetrics();

    return Object.freeze({
      status: mitraReachability.reachability ? 'healthy' : 'degraded',
      application: APP.NAME,
      version: APP.VERSION,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        human: this._formatUptime(uptimeSeconds),
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          totalMB: Math.round(os.totalmem() / 1024 / 1024),
          freeMB: Math.round(os.freemem() / 1024 / 1024),
          usedMB: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
          heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        },
        cpuCount: os.cpus().length,
        loadAvg: os.loadavg().map((n) => Math.round(n * 100) / 100),
      },
      services: {
        database: {
          status: databaseConfig.connected ? 'connected' : 'not_configured',
          connected: databaseConfig.connected || false,
        },
        redis: {
          status: redisConfig.connected ? 'connected' : 'not_configured',
          connected: redisConfig.connected || false,
          cacheStatus: 'inactive', // placeholder for future caching
        },
        mitra: {
          status: mitraReachability.status,
          reachability: mitraReachability.reachability,
          latencyMs: mitraReachability.latencyMs,
          baseUrl: env.MITRA_BASE_URL,
          metrics: {
            totalRequests: mitraMetrics.totalRequests,
            successRequests: mitraMetrics.successRequests,
            failedRequests: mitraMetrics.failedRequests,
            totalRetries: mitraMetrics.totalRetries,
            averageResponseTimeMs: mitraMetrics.avgDurationMs,
          },
          normalizationMetrics: {
            status: 'operational',
            totalValidatedCount: mitraMetrics.successRequests, // proxy count
            validationFailures: 0, // placeholder
          },
        },
      },
    });
  }

  /**
   * Converts uptime seconds into formatted text.
   *
   * @private
   */
  _formatUptime(seconds) {
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
}
