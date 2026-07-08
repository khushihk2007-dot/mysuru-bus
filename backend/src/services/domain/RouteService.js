/**
 * src/services/domain/RouteService.js
 *
 * Route Domain Service.
 *
 * Coordinates route details, route structures, and stop sequences.
 */

import { logger } from '../../config/logger.js';
import { mitraClient as defaultMitraClient } from '../mitra/index.js';
import { ENDPOINT, buildAllRoutesParams, buildRouteTripsParams, buildRouteStopsParams } from '../mitra/index.js';
import { normalizeRoute, normalizeRouteList, normalizeStopList } from '../mitra/normalizers/index.js';
import {
  RouteNotFoundError,
  InvalidRouteError,
  ServiceUnavailableError,
  DataIntegrityError,
} from './errors/DomainErrors.js';

export class RouteService {
  /**
   * @param {object} [deps]
   * @param {import('../mitra/MitraClient').MitraClient} [deps.mitraClient]
   */
  constructor({ mitraClient = defaultMitraClient } = {}) {
    this._mitraClient = mitraClient;
  }

  /**
   * Retrieves all available routes.
   *
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getRoutes() {
    const startTime = Date.now();
    logger.debug('Fetching all routes');

    try {
      const params = buildAllRoutesParams();
      const response = await this._mitraClient.post(ENDPOINT.ALL_ROUTES, params);

      let rawRoutes = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          rawRoutes = response.data;
        } else if (Array.isArray(response.data.routes)) {
          rawRoutes = response.data.routes;
        }
      }

      const routes = normalizeRouteList(rawRoutes, { skipInvalid: true });

      const durationMs = Date.now() - startTime;
      logger.info(
        { rawCount: rawRoutes.length, normalizedCount: routes.length, durationMs },
        `Successfully retrieved ${routes.length} routes`,
      );

      return Object.freeze(routes);
    } catch (err) {
      if (err.isMitraError) {
        throw new ServiceUnavailableError('Failed to retrieve routes from transit system', err);
      }
      throw err;
    }
  }

  /**
   * Retrieves a single route by ID.
   *
   * @param {string} routeId
   * @returns {Promise<Readonly<object>>}
   * @throws {RouteNotFoundError} If the route does not exist
   */
  async getRoute(routeId) {
    if (!routeId || typeof routeId !== 'string' || routeId.trim() === '') {
      throw new InvalidRouteError(routeId, 'Route ID must be a non-empty string');
    }

    const routes = await this.getRoutes();
    const route = routes.find((r) => r.id === routeId.trim());

    if (!route) {
      throw new RouteNotFoundError(routeId);
    }

    return route;
  }

  /**
   * Checks if a route exists.
   *
   * @param {string} routeId
   * @returns {Promise<boolean>}
   */
  async routeExists(routeId) {
    if (!routeId || typeof routeId !== 'string' || routeId.trim() === '') {
      return false;
    }

    try {
      const routes = await this.getRoutes();
      return routes.some((r) => r.id === routeId.trim());
    } catch {
      return false;
    }
  }

  /**
   * Retrieves GeoJSON geometry for a route (Phase 4 placeholder).
   *
   * @param {string} routeId
   * @returns {Promise<null>}
   */
  async getRouteGeometry(routeId) {
    // Ensure route exists
    await this.getRoute(routeId);
    return null;
  }

  /**
   * Retrieves all stops served by a specific route.
   * Resolves the route trips first to get a valid trip instance ID.
   *
   * @param {string} routeId
   * @returns {Promise<ReadonlyArray<object>>}
   */
  async getRouteStops(routeId) {
    if (!routeId || typeof routeId !== 'string' || routeId.trim() === '') {
      throw new InvalidRouteError(routeId, 'Route ID must be a non-empty string');
    }

    const startTime = Date.now();
    logger.debug({ routeId }, 'Fetching stops for route');

    try {
      // 1. Fetch trips for this route to extract a valid tripId
      const tripsParams = buildRouteTripsParams({ routeId: routeId.trim() });
      const tripsResponse = await this._mitraClient.post(ENDPOINT.ROUTE_TRIPS, tripsParams);

      let rawTrips = [];
      if (tripsResponse.data) {
        if (Array.isArray(tripsResponse.data)) {
          rawTrips = tripsResponse.data;
        } else if (Array.isArray(tripsResponse.data.trips)) {
          rawTrips = tripsResponse.data.trips;
        }
      }

      const firstTrip = rawTrips[0];
      if (!firstTrip) {
        throw new DataIntegrityError(`No scheduled trips found for route "${routeId}"`);
      }

      const tripId = firstTrip.trip_id ?? firstTrip.tripId ?? firstTrip.id;
      if (!tripId || typeof tripId !== 'string') {
        throw new DataIntegrityError(`Malformed trip data for route "${routeId}": trip ID is missing`);
      }

      // 2. Fetch stops details for route + trip combo
      const stopsParams = buildRouteStopsParams({ routeId: routeId.trim(), tripId });
      const stopsResponse = await this._mitraClient.post(ENDPOINT.ROUTE_STOPS, stopsParams);

      let rawStops = [];
      if (stopsResponse.data) {
        if (Array.isArray(stopsResponse.data)) {
          rawStops = stopsResponse.data;
        } else if (Array.isArray(stopsResponse.data.stops)) {
          rawStops = stopsResponse.data.stops;
        } else if (Array.isArray(stopsResponse.data.stopDetails)) {
          rawStops = stopsResponse.data.stopDetails;
        }
      }

      const stops = normalizeStopList(rawStops, { skipInvalid: true, sort: true });

      const durationMs = Date.now() - startTime;
      logger.info(
        { routeId, tripId, stopCount: stops.length, durationMs },
        `Successfully retrieved stops for route`,
      );

      return Object.freeze(stops);
    } catch (err) {
      if (err.isMitraError) {
        throw new ServiceUnavailableError(`Failed to fetch stops for route ${routeId}`, err);
      }
      throw err;
    }
  }

  /**
   * Future placeholder for finding alternative route recommendations.
   *
   * @param {string} _sourceStopId
   * @param {string} _destinationStopId
   */
  findAlternativeRoutes(_sourceStopId, _destinationStopId) {
    logger.info({ source: _sourceStopId, dest: _destinationStopId }, 'findAlternativeRoutes placeholder');
    return [];
  }
}
