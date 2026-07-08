/**
 * src/services/mitra/MitraEndpoints.js
 *
 * MITRA API endpoint registry.
 *
 * Every known MITRA endpoint is defined here as a path constant and a
 * builder function that constructs the correct URLSearchParams payload.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Design rules:
 *  1. Paths are RELATIVE to MITRA_BASE_URL (no leading slash).
 *  2. Builder functions return URLSearchParams — never plain objects.
 *  3. No response parsing happens here — that's the service layer's job.
 *  4. Each builder validates its required arguments and throws on bad input.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PARAM, CITY, DEFAULT_LANGUAGE } from './MitraConstants.js';
import { MitraConfigurationError } from './MitraErrors.js';

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint path constants
// ─────────────────────────────────────────────────────────────────────────────

export const ENDPOINT = Object.freeze({
  // Live vehicle GPS positions for an entire route
  LIVE_BUS_POSITIONS: 'getLiveBusDetails',

  // All scheduled trips for a route
  ROUTE_TRIPS:        'getRouteDetails',

  // All stops served by a specific route
  ROUTE_STOPS:        'getStopDetails',

  // List of all available routes in the city
  ALL_ROUTES:         'getAllRoutes',

  // Stops matching a search query
  STOP_SEARCH:        'getStopSearch',

  // Single stop details (upcoming buses, coordinates)
  STOP_DETAILS:       'getStopInfo',

  // Estimated time of arrival for a bus at a stop
  ETA:                'getETA',

  // All trips passing through a given stop
  TRIPS_BY_STOP:      'getTripsByStop',

  // Search routes between two stops
  ROUTE_SEARCH:       'getRouteSearch',
});

// ─────────────────────────────────────────────────────────────────────────────
// Parameter builder functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Asserts that a value is a non-empty string.
 * @param {*}      value
 * @param {string} paramName
 */
function requireString(value, paramName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new MitraConfigurationError(
      `MITRA parameter "${paramName}" must be a non-empty string, got: ${JSON.stringify(value)}`,
      { param: paramName, value },
    );
  }
}

/**
 * Builds params for ENDPOINT.LIVE_BUS_POSITIONS.
 * Fetches real-time GPS coordinates for all buses on a given route.
 *
 * @param {object} opts
 * @param {string} opts.routeId   MITRA route identifier
 * @param {string} [opts.cityId]  Defaults to Mysore
 * @returns {URLSearchParams}
 */
export function buildLiveBusParams({ routeId, cityId = CITY.MYSORE }) {
  requireString(routeId, 'routeId');
  const p = new URLSearchParams();
  p.set(PARAM.ROUTE_ID, routeId);
  p.set(PARAM.CITY_ID,  cityId);
  return p;
}

/**
 * Builds params for ENDPOINT.ROUTE_TRIPS.
 * Returns all scheduled trips (variants) for a route.
 *
 * @param {object} opts
 * @param {string} opts.routeId
 * @param {string} [opts.cityId]
 * @returns {URLSearchParams}
 */
export function buildRouteTripsParams({ routeId, cityId = CITY.MYSORE }) {
  requireString(routeId, 'routeId');
  const p = new URLSearchParams();
  p.set(PARAM.ROUTE_ID, routeId);
  p.set(PARAM.CITY_ID,  cityId);
  return p;
}

/**
 * Builds params for ENDPOINT.ROUTE_STOPS.
 * Returns all stops on a specific route + trip combination.
 *
 * @param {object} opts
 * @param {string} opts.routeId
 * @param {string} opts.tripId
 * @param {string} [opts.cityId]
 * @returns {URLSearchParams}
 */
export function buildRouteStopsParams({ routeId, tripId, cityId = CITY.MYSORE }) {
  requireString(routeId, 'routeId');
  requireString(tripId,  'tripId');
  const p = new URLSearchParams();
  p.set(PARAM.ROUTE_ID, routeId);
  p.set(PARAM.TRIP_ID,  tripId);
  p.set(PARAM.CITY_ID,  cityId);
  return p;
}

/**
 * Builds params for ENDPOINT.ALL_ROUTES.
 * Returns the full list of routes operating in a city.
 *
 * @param {object} [opts]
 * @param {string} [opts.cityId]
 * @param {string} [opts.language]
 * @returns {URLSearchParams}
 */
export function buildAllRoutesParams({ cityId = CITY.MYSORE, language = DEFAULT_LANGUAGE } = {}) {
  const p = new URLSearchParams();
  p.set(PARAM.CITY_ID,  cityId);
  p.set(PARAM.LANGUAGE, language);
  return p;
}

/**
 * Builds params for ENDPOINT.STOP_SEARCH.
 * Searches for stops by name or partial name.
 *
 * @param {object} opts
 * @param {string} opts.query       Search query string
 * @param {string} [opts.cityId]
 * @returns {URLSearchParams}
 */
export function buildStopSearchParams({ query, cityId = CITY.MYSORE }) {
  requireString(query, 'query');
  const p = new URLSearchParams();
  p.set('stopName',     query.trim());
  p.set(PARAM.CITY_ID,  cityId);
  return p;
}

/**
 * Builds params for ENDPOINT.STOP_DETAILS.
 * Returns details and upcoming arrivals for a specific stop.
 *
 * @param {object} opts
 * @param {string} opts.stopId
 * @param {string} [opts.cityId]
 * @returns {URLSearchParams}
 */
export function buildStopDetailsParams({ stopId, cityId = CITY.MYSORE }) {
  requireString(stopId, 'stopId');
  const p = new URLSearchParams();
  p.set(PARAM.STOP_ID, stopId);
  p.set(PARAM.CITY_ID, cityId);
  return p;
}

/**
 * Builds params for ENDPOINT.ETA.
 * Returns the estimated time of arrival of a specific bus at a stop.
 *
 * @param {object} opts
 * @param {string} opts.vehicleId
 * @param {string} opts.stopId
 * @param {string} [opts.cityId]
 * @returns {URLSearchParams}
 */
export function buildEtaParams({ vehicleId, stopId, cityId = CITY.MYSORE }) {
  requireString(vehicleId, 'vehicleId');
  requireString(stopId,    'stopId');
  const p = new URLSearchParams();
  p.set(PARAM.VEHICLE_ID, vehicleId);
  p.set(PARAM.STOP_ID,    stopId);
  p.set(PARAM.CITY_ID,    cityId);
  return p;
}

/**
 * Builds params for ENDPOINT.TRIPS_BY_STOP.
 * Returns all scheduled trips that serve a given stop.
 *
 * @param {object} opts
 * @param {string} opts.stopId
 * @param {string} [opts.cityId]
 * @returns {URLSearchParams}
 */
export function buildTripsByStopParams({ stopId, cityId = CITY.MYSORE }) {
  requireString(stopId, 'stopId');
  const p = new URLSearchParams();
  p.set(PARAM.STOP_ID, stopId);
  p.set(PARAM.CITY_ID, cityId);
  return p;
}

/**
 * Builds params for ENDPOINT.ROUTE_SEARCH.
 * Searches for routes connecting a source stop to a destination stop.
 *
 * @param {object} opts
 * @param {string} opts.sourceStopId
 * @param {string} opts.destinationStopId
 * @param {string} [opts.cityId]
 * @returns {URLSearchParams}
 */
export function buildRouteSearchParams({ sourceStopId, destinationStopId, cityId = CITY.MYSORE }) {
  requireString(sourceStopId,      'sourceStopId');
  requireString(destinationStopId, 'destinationStopId');
  const p = new URLSearchParams();
  p.set(PARAM.SOURCE_STOP,      sourceStopId);
  p.set(PARAM.DESTINATION_STOP, destinationStopId);
  p.set(PARAM.CITY_ID,          cityId);
  return p;
}
