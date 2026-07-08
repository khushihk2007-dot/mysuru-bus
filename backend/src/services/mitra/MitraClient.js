/**
 * src/services/mitra/MitraClient.js
 *
 * The MITRA HTTP Client.
 *
 * This is the ONLY module allowed to communicate directly with the MITRA
 * backend. All HTTP mechanics — timeouts, retries, headers, error mapping,
 * and observability — live here. Nothing else in the application knows that
 * MITRA exists or how it works.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture:
 *
 *  MitraClient
 *    │
 *    ├── Axios instance (dedicated, not shared with other clients)
 *    │     • form-encoded Content-Type
 *    │     • keep-alive connection pool
 *    │     • request / response interceptors for timing + logging
 *    │
 *    ├── Retry engine
 *    │     • exponential back-off + jitter
 *    │     • retries on 5xx, timeout, network error
 *    │     • never retries 4xx
 *    │
 *    └── Error mapper
 *          • Axios errors → typed MitraErrors
 *          • raw Axios never escapes this class
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage:
 *
 *   import { mitraClient } from './index.js';
 *
 *   const response = await mitraClient.post(
 *     ENDPOINT.LIVE_BUS_POSITIONS,
 *     buildLiveBusParams({ routeId: '10A' }),
 *   );
 * ─────────────────────────────────────────────────────────────────────────────
 */

import http  from 'node:http';
import https from 'node:https';
import axios from 'axios';
import { z } from 'zod';

import { logger }   from '../../config/logger.js';
import { env }      from '../../config/env.js';
import {
  USER_AGENT,
  ACCEPT,
  ACCEPT_ENCODING,
  CONTENT_TYPE_FORM,
  RETRYABLE_STATUS_CODES,
  NON_RETRYABLE_STATUS_CODES,
  KEEP_ALIVE_TIMEOUT_MS,
  KEEP_ALIVE_MAX_SOCKETS,
} from './MitraConstants.js';
import {
  MitraConfigurationError,
  MitraTimeoutError,
  MitraNetworkError,
  MitraResponseError,
  MitraServerError,
} from './MitraErrors.js';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration schema (validated via Zod at instantiation time)
// ─────────────────────────────────────────────────────────────────────────────

const MitraConfigSchema = z.object({
  baseUrl:    z.string().url({ message: 'MITRA_BASE_URL must be a valid URL' }),
  timeout:    z.number().int().positive({ message: 'REQUEST_TIMEOUT must be a positive integer (ms)' }),
  maxRetries: z.number().int().min(0).max(10, { message: 'MAX_RETRIES must be between 0 and 10' }),
  retryDelay: z.number().int().positive({ message: 'RETRY_DELAY must be a positive integer (ms)' }),
});

// ─────────────────────────────────────────────────────────────────────────────
// MitraClient class
// ─────────────────────────────────────────────────────────────────────────────

export class MitraClient {
  /**
   * @param {object} [config]             Override default env-driven configuration.
   * @param {string} [config.baseUrl]
   * @param {number} [config.timeout]
   * @param {number} [config.maxRetries]
   * @param {number} [config.retryDelay]
   */
  constructor(config = {}) {
    // ── Validate configuration ──────────────────────────────────────────────
    const parsed = MitraConfigSchema.safeParse({
      baseUrl:    config.baseUrl    ?? env.MITRA_BASE_URL,
      timeout:    config.timeout    ?? env.REQUEST_TIMEOUT,
      maxRetries: config.maxRetries ?? env.MAX_RETRIES,
      retryDelay: config.retryDelay ?? env.RETRY_DELAY,
    });

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new MitraConfigurationError(`Invalid MITRA client configuration — ${issues}`, { issues });
    }

    this._config = parsed.data;

    // ── Metrics accumulator ─────────────────────────────────────────────────
    this._metrics = {
      totalRequests:   0,
      successRequests: 0,
      failedRequests:  0,
      totalRetries:    0,
      totalDurationMs: 0,
    };

    // ── HTTP keep-alive agents ──────────────────────────────────────────────
    // Reuse connections across requests — reduces TCP handshake overhead
    // significantly when polling MITRA frequently.
    this._httpAgent  = new http.Agent({
      keepAlive:       true,
      keepAliveMsecs:  KEEP_ALIVE_TIMEOUT_MS,
      maxSockets:      KEEP_ALIVE_MAX_SOCKETS,
      maxFreeSockets:  KEEP_ALIVE_MAX_SOCKETS / 2,
    });
    this._httpsAgent = new https.Agent({
      keepAlive:       true,
      keepAliveMsecs:  KEEP_ALIVE_TIMEOUT_MS,
      maxSockets:      KEEP_ALIVE_MAX_SOCKETS,
      maxFreeSockets:  KEEP_ALIVE_MAX_SOCKETS / 2,
    });

    // ── Axios instance ──────────────────────────────────────────────────────
    this._axios = this._buildAxiosInstance();

    logger.info(
      { baseUrl: this._config.baseUrl, timeout: this._config.timeout, maxRetries: this._config.maxRetries },
      'MitraClient initialised',
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Sends a POST request to a MITRA endpoint.
   * MITRA exclusively uses POST with form-encoded bodies.
   *
   * @param {string}           endpoint   Relative path (from ENDPOINT constants)
   * @param {URLSearchParams}  params     Form parameters
   * @param {object}           [options]  Per-request overrides
   * @param {number}           [options.timeout]     Override timeout (ms)
   * @param {number}           [options.maxRetries]  Override retry count
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  async post(endpoint, params, options = {}) {
    return this._executeWithRetry('POST', endpoint, params, options);
  }

  /**
   * Sends a GET request to a MITRA endpoint.
   * Most MITRA endpoints are POST — use this only for metadata fetches.
   *
   * @param {string} endpoint
   * @param {object} [params]   Query parameters as a plain object
   * @param {object} [options]
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  async get(endpoint, params = {}, options = {}) {
    return this._executeWithRetry('GET', endpoint, params, options);
  }

  /**
   * Low-level request method. Used by post() and get().
   * Can be called directly for non-standard request configurations.
   *
   * @param {import('axios').Method} method
   * @param {string}                 endpoint
   * @param {URLSearchParams|object} data
   * @param {object}                 [options]
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  async request(method, endpoint, data = {}, options = {}) {
    return this._executeWithRetry(method, endpoint, data, options);
  }

  /**
   * Returns a snapshot of client-level request metrics.
   * Useful for the /health endpoint and observability dashboards.
   *
   * @returns {{ totalRequests: number, successRequests: number, failedRequests: number, totalRetries: number, avgDurationMs: number }}
   */
  getMetrics() {
    const { totalRequests, successRequests, failedRequests, totalRetries, totalDurationMs } = this._metrics;
    return {
      totalRequests,
      successRequests,
      failedRequests,
      totalRetries,
      avgDurationMs: totalRequests > 0 ? Math.round(totalDurationMs / totalRequests) : 0,
    };
  }

  /**
   * Destroys the underlying keep-alive connection pools.
   * Call this during graceful server shutdown.
   */
  destroy() {
    this._httpAgent.destroy();
    this._httpsAgent.destroy();
    logger.info('MitraClient connection pools destroyed');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal: retry engine
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Executes an HTTP request with exponential back-off retry.
   *
   * @private
   */
  async _executeWithRetry(method, endpoint, data, options) {
    const maxRetries = options.maxRetries ?? this._config.maxRetries;
    const startTime  = Date.now();
    let   lastError;

    this._metrics.totalRequests++;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const response = await this._sendRequest(method, endpoint, data, options);

        // ── Success ────────────────────────────────────────────────────────
        const durationMs = Date.now() - startTime;
        this._metrics.successRequests++;
        this._metrics.totalDurationMs += durationMs;

        logger.info(
          {
            method,
            endpoint,
            status:     response.status,
            durationMs,
            attempt,
          },
          `MITRA ${method} ${endpoint} → ${response.status}`,
        );

        return response;

      } catch (err) {
        lastError = err;

        const isRetryable = this._isRetryable(err);
        const attemptsLeft = maxRetries + 1 - attempt;

        if (!isRetryable || attemptsLeft === 0) {
          // ── Give up ───────────────────────────────────────────────────────
          const durationMs = Date.now() - startTime;
          this._metrics.failedRequests++;
          this._metrics.totalDurationMs += durationMs;

          logger.error(
            {
              method,
              endpoint,
              attempt,
              durationMs,
              error: err.code ?? err.message,
              retryable: isRetryable,
            },
            `MITRA ${method} ${endpoint} failed after ${attempt} attempt(s)`,
          );

          throw err; // already a typed MitraError
        }

        // ── Schedule retry ─────────────────────────────────────────────────
        const delay = this._backoffDelay(attempt);
        this._metrics.totalRetries++;

        logger.warn(
          {
            method,
            endpoint,
            attempt,
            attemptsLeft,
            delayMs: delay,
            error:   err.code ?? err.message,
          },
          `MITRA request failed — retrying in ${delay}ms`,
        );

        await this._sleep(delay);
      }
    }

    // Should be unreachable, but TypeScript-style safety net:
    throw lastError;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal: single HTTP request
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Sends a single HTTP request and maps Axios errors to typed MitraErrors.
   * @private
   */
  async _sendRequest(method, endpoint, data, options) {
    if (process.env.MOCK_MITRA === "true") {
      return this._getMockResponse(endpoint, data);
    }

    const timeout = options.timeout ?? this._config.timeout;

    const axiosConfig = {
      method,
      url:     endpoint,
      timeout,
      httpAgent:  this._httpAgent,
      httpsAgent: this._httpsAgent,
    };

    if (method === 'GET' || method === 'get') {
      axiosConfig.params = data;
    } else {
      // POST / PUT — send as form-encoded body
      axiosConfig.data = data instanceof URLSearchParams ? data : new URLSearchParams(data);
    }

    try {
      return await this._axios.request(axiosConfig);
    } catch (err) {
      throw this._mapError(err, endpoint);
    }
  }

  /**
   * Returns simulated responses for local offline demonstration.
   * @private
   */
  _getMockResponse(endpoint, data) {
    const params = data instanceof URLSearchParams ? data : new URLSearchParams(data);
    const routeId = params.get('route_id') || params.get('routeId');

    if (endpoint === 'getAllRoutes') {
      return {
        status: 200,
        data: [
          { route_id: "201", route_no: "201", route_name: "Mysore CBS ⇄ Chamundi Hill", source: "Mysore CBS", destination: "Chamundi Hill", direction: "1", total_stops: "10", distance: "12.4" },
          { route_id: "119", route_no: "119", route_name: "Mysore CBS ⇄ City Hospital", source: "Mysore CBS", destination: "City Hospital", direction: "1", total_stops: "8", distance: "9.5" },
          { route_id: "80", route_no: "80", route_name: "Mysore CBS ⇄ JP Nagar", source: "Mysore CBS", destination: "JP Nagar", direction: "1", total_stops: "12", distance: "14.2" }
        ]
      };
    }

    if (endpoint === 'getRouteDetails') {
      return {
        status: 200,
        data: [
          { trip_id: `t${routeId}-1`, route_id: routeId, direction: "1" }
        ]
      };
    }

    if (endpoint === 'getStopDetails') {
      let stops = [];
      if (routeId === "201") {
        stops = [
          { stop_id: "s201-1", stop_name: "City Bus Stand (CBS)", sequence_no: 1, latitude: "12.3115", longitude: "76.6545" },
          { stop_id: "s201-2", stop_name: "Hardinge Circle", sequence_no: 2, latitude: "12.3085", longitude: "76.6565" },
          { stop_id: "s201-3", stop_name: "Zoo Garden", sequence_no: 3, latitude: "12.3015", longitude: "76.6635" },
          { stop_id: "s201-4", stop_name: "Chamundi Hill Terminus", sequence_no: 4, latitude: "12.2745", longitude: "76.6712" }
        ];
      } else if (routeId === "119") {
        stops = [
          { stop_id: "s119-1", stop_name: "City Bus Stand (CBS)", sequence_no: 1, latitude: "12.3115", longitude: "76.6545" },
          { stop_id: "s119-2", stop_name: "Subbarayanakere", sequence_no: 2, latitude: "12.3035", longitude: "76.6495" },
          { stop_id: "s119-3", stop_name: "City Hospital", sequence_no: 3, latitude: "12.2985", longitude: "76.6435" }
        ];
      } else {
        stops = [
          { stop_id: "s80-1", stop_name: "City Bus Stand (CBS)", sequence_no: 1, latitude: "12.3115", longitude: "76.6545" },
          { stop_id: "s80-2", stop_name: "JP Nagar Circle", sequence_no: 2, latitude: "12.2715", longitude: "76.6345" }
        ];
      }
      return {
        status: 200,
        data: stops
      };
    }

    if (endpoint === 'getLiveBusDetails') {
      const time = Date.now() / 15000;
      const offsetLat = Math.sin(time) * 0.003;
      const offsetLng = Math.cos(time) * 0.003;

      let buses = [];
      if (routeId === "201") {
        buses = [
          {
            bus_id: "b201-1",
            route_no: "201",
            bus_reg_no: "KA55F-1234",
            latitude: 12.3015 + offsetLat,
            longitude: 76.6635 + offsetLng,
            speed: "35",
            ignition_status: "ON",
            device_status: "ACTIVE",
            updated_time: new Date().toISOString(),
            direction: "1"
          }
        ];
      } else if (routeId === "119") {
        buses = [
          {
            bus_id: "b119-1",
            route_no: "119",
            bus_reg_no: "KA55F-5678",
            latitude: 12.3035 - offsetLat,
            longitude: 76.6495 + offsetLng,
            speed: "28",
            ignition_status: "ON",
            device_status: "ACTIVE",
            updated_time: new Date().toISOString(),
            direction: "1"
          }
        ];
      } else if (routeId === "80") {
        buses = [
          {
            bus_id: "b80-1",
            route_no: "80",
            bus_reg_no: "KA55F-9012",
            latitude: 12.2915 + offsetLat,
            longitude: 76.6445 - offsetLng,
            speed: "42",
            ignition_status: "ON",
            device_status: "ACTIVE",
            updated_time: new Date().toISOString(),
            direction: "1"
          }
        ];
      }
      return {
        status: 200,
        data: buses
      };
    }

    return {
      status: 404,
      data: { error: "Not Found" }
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal: Axios instance factory
  // ─────────────────────────────────────────────────────────────────────────

  /** @private */
  _buildAxiosInstance() {
    const instance = axios.create({
      baseURL: this._config.baseUrl,
      timeout: this._config.timeout,
      headers: {
        'Content-Type':   CONTENT_TYPE_FORM,
        Accept:           ACCEPT,
        'Accept-Encoding': ACCEPT_ENCODING,
        'User-Agent':     USER_AGENT,
        Connection:       'keep-alive',
      },
      // Do not throw on any HTTP status — let our mapper handle it
      validateStatus: () => true,
    });

    // ── Request interceptor — timing + debug log ───────────────────────────
    instance.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        logger.debug(
          { method: config.method?.toUpperCase(), url: config.url },
          'MITRA outbound request',
        );
        return config;
      },
      (error) => {
        logger.error({ err: error.message }, 'MITRA request setup error');
        return Promise.reject(error);
      },
    );

    // ── Response interceptor — log every response + handle bad HTTP status ─
    instance.interceptors.response.use(
      (response) => {
        const durationMs = Date.now() - (response.config.metadata?.startTime ?? 0);
        logger.debug(
          { status: response.status, url: response.config.url, durationMs },
          'MITRA response received',
        );

        // Raise errors for 4xx/5xx even though validateStatus returns true.
        // This keeps all error handling in one place (_mapError).
        if (response.status >= 400) {
          const fakeAxiosError        = new Error(`HTTP ${response.status}`);
          fakeAxiosError.response     = response;
          fakeAxiosError.config       = response.config;
          fakeAxiosError.isAxiosError = true;
          return Promise.reject(fakeAxiosError);
        }

        return response;
      },
      (error) => Promise.reject(error), // pass through — _sendRequest handles it
    );

    return instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal: error mapping
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Maps a raw Axios error to a typed MitraError.
   * Raw Axios errors must NEVER escape this method.
   *
   * @param {Error}  err
   * @param {string} endpoint
   * @returns {MitraBaseError}
   * @private
   */
  _mapError(err, endpoint) {
    // Already mapped (e.g. second pass through the retry loop)
    if (err.isMitraError) return err;

    const status  = err.response?.status;
    const body    = typeof err.response?.data === 'string'
      ? err.response.data
      : JSON.stringify(err.response?.data ?? '');

    // Timeout
    if (err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED' || err.message?.includes('timeout')) {
      return new MitraTimeoutError(endpoint, this._config.timeout, { axiosCode: err.code });
    }

    // Network failure (no response at all)
    if (!err.response) {
      return new MitraNetworkError(endpoint, err.message, { axiosCode: err.code });
    }

    // HTTP 5xx — server-side fault
    if (status >= 500) {
      return new MitraServerError(endpoint, status, body);
    }

    // HTTP 4xx — client-side fault
    if (status >= 400) {
      return new MitraResponseError(endpoint, status, body);
    }

    // Catch-all
    return new MitraNetworkError(endpoint, err.message, { status });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal: retry decision
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns true if the error is safe to retry.
   * Timeouts, network failures, and 5xx are retryable.
   * 4xx errors are never retried.
   *
   * @param {Error} err
   * @returns {boolean}
   * @private
   */
  _isRetryable(err) {
    // Typed MITRA errors
    if (err.isMitraError) {
      if (err.code === 'MITRA_TIMEOUT')       return true;
      if (err.code === 'MITRA_NETWORK_ERROR') return true;
      if (err.code === 'MITRA_SERVER_ERROR')  return true;
      if (err.code === 'MITRA_RESPONSE_ERROR') return false;
      return false;
    }

    // Fallback for raw errors (should not happen, but guard anyway)
    const status = err.response?.status;
    if (!status) return true;  // No response → network error → retryable
    if (NON_RETRYABLE_STATUS_CODES.has(status)) return false;
    if (RETRYABLE_STATUS_CODES.has(status))     return true;
    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal: back-off calculation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calculates delay for attempt N with exponential back-off and ±25% jitter.
   * Attempt 1 → baseDelay, attempt 2 → 2×, attempt 3 → 4×, capped at 30s.
   *
   * @param {number} attempt  Current attempt number (1-indexed)
   * @returns {number}        Delay in milliseconds
   * @private
   */
  _backoffDelay(attempt) {
    const base    = this._config.retryDelay;
    const cap     = 30_000;
    const exp     = Math.min(base * 2 ** (attempt - 1), cap);
    const jitter  = exp * (0.75 + Math.random() * 0.5); // ±25%
    return Math.round(jitter);
  }

  /** @private */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
