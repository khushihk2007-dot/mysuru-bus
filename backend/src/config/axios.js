/**
 * src/config/axios.js
 *
 * Pre-configured Axios instance for outbound HTTP calls.
 * All service modules import this instance rather than raw axios,
 * keeping timeouts, base URLs, and interceptors in one place.
 *
 * Phase 2: MITRA API calls will be wired here.
 */

import axios from 'axios';
import { env } from './env.js';
import { logger } from './logger.js';

const httpClient = axios.create({
  baseURL: env.MITRA_BASE_URL,
  timeout: env.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'MysoreTransitBackend/1.0',
  },
});

// ── Request interceptor ─────────────────────────────────────────────────────
httpClient.interceptors.request.use(
  (config) => {
    logger.debug({ method: config.method?.toUpperCase(), url: config.url }, 'Outbound HTTP request');
    return config;
  },
  (error) => {
    logger.error({ err: error }, 'HTTP request setup error');
    return Promise.reject(error);
  },
);

// ── Response interceptor ────────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response) => {
    logger.debug(
      { status: response.status, url: response.config.url },
      'Outbound HTTP response received',
    );
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url;
    logger.warn({ status, url, message: error.message }, 'Outbound HTTP request failed');
    return Promise.reject(error);
  },
);

export { httpClient };
