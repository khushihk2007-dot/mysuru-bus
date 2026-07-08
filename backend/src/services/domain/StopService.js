/**
 * src/services/domain/StopService.js
 *
 * Stop Domain Service.
 *
 * Handles stop searches, details, and counts.
 */

import { logger } from '../../config/logger.js';
import { mitraClient as defaultMitraClient } from '../mitra/index.js';
import { ENDPOINT, buildStopDetailsParams, buildStopSearchParams } from '../mitra/index.js';
import { normalizeStop, normalizeStopList } from '../mitra/normalizers/index.js';
import { RouteService } from './RouteService.js';
import {
  StopNotFoundError,
  ServiceUnavailableError,
} from './errors/DomainErrors.js';

export class StopService {
  /**
   * @param {object} [deps]
   * @param {import('../mitra/MitraClient').MitraClient} [deps.mitraClient]
   * @param {RouteService} [deps.routeService]
   */
  constructor({ mitraClient = defaultMitraClient, routeService } = {}) {
    this._mitraClient = mitraClient;
    this._routeService = routeService ?? new RouteService({ mitraClient });
  }

  /**
   * Fetches stops for a given route.
   *
   * @param {string} routeId
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getStops(routeId) {
    return this._routeService.getRouteStops(routeId);
  }

  /**
   * Fetches details for a single bus stop.
   *
   * @param {string} stopId
   * @returns {Promise<Readonly<object>>}
   * @throws {StopNotFoundError}
   */
  async getStop(stopId) {
    if (!stopId || typeof stopId !== 'string' || stopId.trim() === '') {
      throw new StopNotFoundError(stopId);
    }

    const startTime = Date.now();
    logger.debug({ stopId }, 'Fetching details for stop');

    try {
      const params = buildStopDetailsParams({ stopId: stopId.trim() });
      const response = await this._mitraClient.post(ENDPOINT.STOP_DETAILS, params);

      // Handle raw stop responses
      let rawStop = response.data;
      // In case MITRA wraps the stop details inside an array or key
      if (response.data && !Array.isArray(response.data) && response.data.stop) {
        rawStop = response.data.stop;
      } else if (Array.isArray(response.data)) {
        rawStop = response.data[0];
      }

      if (!rawStop) {
        throw new StopNotFoundError(stopId);
      }

      const stop = normalizeStop(rawStop);

      const durationMs = Date.now() - startTime;
      logger.info({ stopId, durationMs }, `Successfully retrieved stop details`);

      return stop;
    } catch (err) {
      if (err.code === 'MISSING_FIELD' || err instanceof StopNotFoundError) {
        throw new StopNotFoundError(stopId);
      }
      if (err.isMitraError) {
        throw new ServiceUnavailableError(`Failed to retrieve stop info for ${stopId}`, err);
      }
      throw err;
    }
  }

  /**
   * Searches stops by partial query string.
   *
   * @param {string} query
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async searchStops(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return Object.freeze([]);
    }

    const startTime = Date.now();
    logger.debug({ query }, 'Searching for stops');

    try {
      const params = buildStopSearchParams({ query: query.trim() });
      const response = await this._mitraClient.post(ENDPOINT.STOP_SEARCH, params);

      let rawStops = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          rawStops = response.data;
        } else if (Array.isArray(response.data.stops)) {
          rawStops = response.data.stops;
        }
      }

      const stops = normalizeStopList(rawStops, { skipInvalid: true, sort: false });

      const durationMs = Date.now() - startTime;
      logger.info(
        { query, rawCount: rawStops.length, normalizedCount: stops.length, durationMs },
        `Successfully completed stop search`,
      );

      return Object.freeze(stops);
    } catch (err) {
      if (err.isMitraError) {
        throw new ServiceUnavailableError(`Failed to search stops for query "${query}"`, err);
      }
      throw err;
    }
  }

  /**
   * Counts the number of stops on a given route.
   *
   * @param {string} routeId
   * @returns {Promise<number>}
   */
  async countStops(routeId) {
    const stops = await this.getStops(routeId);
    return stops.length;
  }

  /**
   * Placeholder to find nearest bus stop within radius of coordinates.
   *
   * @param {number} _latitude
   * @param {number} _longitude
   */
  nearestStop(_latitude, _longitude) {
    logger.info({ latitude: _latitude, longitude: _longitude }, 'nearestStop placeholder');
    return null;
  }
}
