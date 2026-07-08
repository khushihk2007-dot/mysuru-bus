/**
 * src/services/domain/BusService.js
 *
 * Domain Service for Live Bus Operations.
 *
 * Coordinates fetching raw bus GPS feeds from MITRA, normalizing/validating them,
 * applying filtering/sorting business rules, and returning clean domain models.
 */

import { logger } from '../../config/logger.js';
import { mitraClient as defaultMitraClient } from '../mitra/index.js';
import { ENDPOINT, buildLiveBusParams } from '../mitra/index.js';
import { normalizeBus, normalizeBusList } from '../mitra/normalizers/index.js';
import {
  BusNotFoundError,
  InvalidRouteError,
  ServiceUnavailableError,
} from './errors/DomainErrors.js';
import { BUS_STATE } from '../mitra/normalizers/utils/normalizationHelpers.js';

export class BusService {
  /**
   * @param {object} [deps]
   * @param {import('../mitra/MitraClient').MitraClient} [deps.mitraClient]
   */
  constructor({ mitraClient = defaultMitraClient } = {}) {
    this._mitraClient = mitraClient;
  }

  /**
   * Fetches and normalizes all live buses operating on a given route.
   *
   * @param {string} routeId
   * @param {object} [filters]
   * @param {string} [sortBy]
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getLiveBuses(routeId, filters = {}, sortBy = null) {
    if (!routeId || typeof routeId !== 'string' || routeId.trim() === '') {
      throw new InvalidRouteError(routeId, 'Route ID must be a non-empty string');
    }

    const startTime = Date.now();
    logger.debug({ routeId }, 'Fetching live buses for route');

    try {
      const params = buildLiveBusParams({ routeId: routeId.trim() });
      const response = await this._mitraClient.post(ENDPOINT.LIVE_BUS_POSITIONS, params);

      // Handle variable response formats safely
      let rawBuses = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          rawBuses = response.data;
        } else if (Array.isArray(response.data.buses)) {
          rawBuses = response.data.buses;
        } else if (Array.isArray(response.data.liveBusDetails)) {
          rawBuses = response.data.liveBusDetails;
        }
      }

      // Normalize list
      const buses = normalizeBusList(rawBuses, { skipInvalid: true });

      // Apply filtering & sorting
      let processed = this._applyFilters(buses, { ...filters, routeId });
      processed = this._applySorting(processed, sortBy);

      const durationMs = Date.now() - startTime;
      logger.info(
        { routeId, rawCount: rawBuses.length, normalizedCount: processed.length, durationMs },
        `Successfully retrieved ${processed.length} live buses`,
      );

      return Object.freeze(processed);
    } catch (err) {
      if (err.isMitraError) {
        throw new ServiceUnavailableError(`Failed to retrieve live buses for route ${routeId}`, err);
      }
      throw err;
    }
  }

  /**
   * Fetches all live buses across all routes in the system.
   *
   * @param {object} [filters]
   * @param {string} [sortBy]
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getAllLiveBuses(filters = {}, sortBy = null) {
    const startTime = Date.now();
    logger.debug('Fetching all live buses across all routes');

    try {
      // First, get all available routes to know what to poll
      const routesResponse = await this._mitraClient.post(
        ENDPOINT.ALL_ROUTES,
        new URLSearchParams()
      );

      let rawRoutes = [];
      if (routesResponse.data) {
        if (Array.isArray(routesResponse.data)) {
          rawRoutes = routesResponse.data;
        } else if (Array.isArray(routesResponse.data.routes)) {
          rawRoutes = routesResponse.data.routes;
        }
      }

      const routeIds = rawRoutes
        .map((r) => r.route_id ?? r.routeId ?? r.id)
        .filter((id) => typeof id === 'string' && id.trim() !== '');

      if (routeIds.length === 0) {
        logger.warn('No active routes found to fetch live buses');
        return Object.freeze([]);
      }

      // Fetch live buses for all routes in parallel.
      // Individual route failures are logged but do not crash the entire request.
      const routeRequests = routeIds.map(async (routeId) => {
        try {
          const params = buildLiveBusParams({ routeId });
          const res = await this._mitraClient.post(ENDPOINT.LIVE_BUS_POSITIONS, params);
          let list = [];
          if (res.data) {
            if (Array.isArray(res.data)) {
              list = res.data;
            } else if (Array.isArray(res.data.buses)) {
              list = res.data.buses;
            } else if (Array.isArray(res.data.liveBusDetails)) {
              list = res.data.liveBusDetails;
            }
          }
          return normalizeBusList(list, { skipInvalid: true });
        } catch (err) {
          logger.warn({ routeId, err: err.message }, 'Failed to fetch live buses for specific route');
          return [];
        }
      });

      const results = await Promise.all(routeRequests);
      const allBuses = results.flat();

      // De-duplicate by bus ID to prevent duplicate reporting if a vehicle appears under multiple routes
      const uniqueBusesMap = new Map();
      for (const bus of allBuses) {
        uniqueBusesMap.set(bus.id, bus);
      }
      const uniqueBuses = Array.from(uniqueBusesMap.values());

      // Filter and Sort
      let processed = this._applyFilters(uniqueBuses, filters);
      processed = this._applySorting(processed, sortBy);

      const durationMs = Date.now() - startTime;
      logger.info(
        { totalFetched: allBuses.length, uniqueBuses: processed.length, durationMs },
        `Successfully retrieved all active live buses (${processed.length} unique)`,
      );

      return Object.freeze(processed);
    } catch (err) {
      if (err.isMitraError) {
        throw new ServiceUnavailableError('Failed to retrieve all live buses', err);
      }
      throw err;
    }
  }

  /**
   * Fetches a single active bus by ID.
   *
   * @param {string} busId
   * @returns {Promise<Readonly<object>>}
   */
  async getBus(busId) {
    if (!busId || typeof busId !== 'string' || busId.trim() === '') {
      throw new BusNotFoundError(busId);
    }

    const buses = await this.getAllLiveBuses();
    const bus = buses.find((b) => b.id === busId.trim());

    if (!bus) {
      throw new BusNotFoundError(busId);
    }

    return bus;
  }

  /**
   * Filters live buses by depot.
   *
   * @param {string} depot
   * @param {string} [sortBy]
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getBusesByDepot(depot, sortBy = null) {
    return this.getAllLiveBuses({ depot }, sortBy);
  }

  /**
   * Filters live buses by status state (EARLY, LATE, ON_TIME, UNKNOWN).
   *
   * @param {string} status
   * @param {string} [sortBy]
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getBusesByStatus(status, sortBy = null) {
    return this.getAllLiveBuses({ status }, sortBy);
  }

  /**
   * Retrieves all moving buses (speed > 0).
   *
   * @param {string} [sortBy]
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getMovingBuses(sortBy = null) {
    return this.getAllLiveBuses({ moving: true }, sortBy);
  }

  /**
   * Retrieves all stopped buses (speed === 0 or null).
   *
   * @param {string} [sortBy]
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getStoppedBuses(sortBy = null) {
    return this.getAllLiveBuses({ moving: false }, sortBy);
  }

  /**
   * Counts all active buses currently reporting GPS updates.
   *
   * @returns {Promise<number>}
   */
  async countActiveBuses() {
    const buses = await this.getAllLiveBuses();
    return buses.length;
  }

  /**
   * Counts all delayed/late buses.
   *
   * @returns {Promise<number>}
   */
  async countDelayedBuses() {
    const buses = await this.getAllLiveBuses({ status: BUS_STATE.LATE });
    return buses.length;
  }

  /**
   * Returns a high-level statistics summary of the active fleet.
   *
   * @returns {Promise<object>}
   */
  async getFleetSummary() {
    const buses = await this.getAllLiveBuses();

    let moving = 0;
    let stopped = 0;
    let early = 0;
    let late = 0;
    let onTime = 0;
    let unknown = 0;
    let totalSpeed = 0;
    let speedCount = 0;
    let totalDelay = 0;

    for (const bus of buses) {
      // Speed
      if (bus.speed !== null) {
        if (bus.speed > 0) {
          moving++;
        } else {
          stopped++;
        }
        totalSpeed += bus.speed;
        speedCount++;
      } else {
        stopped++;
      }

      // Status
      if (bus.status.state === BUS_STATE.EARLY) early++;
      else if (bus.status.state === BUS_STATE.LATE) late++;
      else if (bus.status.state === BUS_STATE.ON_TIME) onTime++;
      else unknown++;

      totalDelay += bus.status.delayMinutes;
    }

    return Object.freeze({
      total: buses.length,
      moving,
      stopped,
      status: {
        early,
        late,
        onTime,
        unknown,
      },
      avgSpeedKmH: speedCount > 0 ? Math.round((totalSpeed / speedCount) * 10) / 10 : 0,
      avgDelayMins: buses.length > 0 ? Math.round((totalDelay / buses.length) * 10) / 10 : 0,
    });
  }

  /**
   * Future placeholder to stream/watch live updates for a route.
   *
   * @param {string} _routeId
   */
  watchRoute(_routeId) {
    logger.info({ routeId: _routeId }, 'watchRoute placeholder called');
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal Filtering & Sorting Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @private
   */
  _applyFilters(buses, filters) {
    let result = [...buses];

    if (filters.routeId) {
      result = result.filter((b) => b.routeId === filters.routeId);
    }
    if (filters.depot) {
      result = result.filter((b) => b.depot === filters.depot);
    }
    if (filters.status) {
      result = result.filter((b) => b.status.state === filters.status);
    }
    if (filters.vehicleNumber) {
      result = result.filter((b) => b.registrationNumber === filters.vehicleNumber);
    }
    if (filters.moving !== undefined) {
      result = result.filter((b) =>
        filters.moving ? (b.speed ?? 0) > 0 : (b.speed ?? 0) === 0
      );
    }
    if (filters.online !== undefined) {
      // Threshold for offline: no GPS ping in the last 5 minutes
      const threshold = Date.now() - 5 * 60 * 1000;
      result = result.filter((b) => {
        if (!b.gpsTimestamp) return !filters.online;
        const isOnline = new Date(b.gpsTimestamp).getTime() >= threshold;
        return filters.online ? isOnline : !isOnline;
      });
    }

    return result;
  }

  /**
   * @private
   */
  _applySorting(buses, sortBy) {
    if (!sortBy) return buses;

    const sorted = [...buses];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'route':
        case 'routeNumber':
          return (a.routeId || '').localeCompare(b.routeId || '');
        case 'registration':
        case 'vehicleRegistration':
          return (a.registrationNumber || '').localeCompare(b.registrationNumber || '');
        case 'delay':
          return (a.status.delayMinutes || 0) - (b.status.delayMinutes || 0);
        case 'speed':
          return (a.speed || 0) - (b.speed || 0);
        case 'depot':
          return (a.depot || '').localeCompare(b.depot || '');
        case 'lastGpsUpdate':
          const timeA = a.gpsTimestamp ? new Date(a.gpsTimestamp).getTime() : 0;
          const timeB = b.gpsTimestamp ? new Date(b.gpsTimestamp).getTime() : 0;
          return timeB - timeA; // Descending (latest first)
        default:
          return 0;
      }
    });

    return sorted;
  }
}
