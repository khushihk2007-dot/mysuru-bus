/**
 * src/services/mitra/index.js
 *
 * Public surface of the MITRA client layer.
 *
 * Import from here — never from individual MITRA files directly.
 * This allows internal refactoring without changing import paths elsewhere.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage:
 *
 *   import { mitraClient, ENDPOINT, buildLiveBusParams } from '../services/mitra/index.js';
 *
 *   const response = await mitraClient.post(
 *     ENDPOINT.LIVE_BUS_POSITIONS,
 *     buildLiveBusParams({ routeId: '10A' }),
 *   );
 *
 *   // Raw MITRA response — no parsing happens here
 *   console.log(response.data);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { MitraClient }    from './MitraClient.js';

// ── Singleton client instance ─────────────────────────────────────────────────
// One shared instance per process — keeps the connection pool alive and
// allows metrics to accumulate across all requests.
export const mitraClient = new MitraClient();

// ── Error classes ─────────────────────────────────────────────────────────────
export {
  MitraBaseError,
  MitraConfigurationError,
  MitraTimeoutError,
  MitraNetworkError,
  MitraResponseError,
  MitraServerError,
} from './MitraErrors.js';

// ── Endpoint path constants ───────────────────────────────────────────────────
export { ENDPOINT } from './MitraEndpoints.js';

// ── Parameter builder functions ───────────────────────────────────────────────
export {
  buildLiveBusParams,
  buildRouteTripsParams,
  buildRouteStopsParams,
  buildAllRoutesParams,
  buildStopSearchParams,
  buildStopDetailsParams,
  buildEtaParams,
  buildTripsByStopParams,
  buildRouteSearchParams,
} from './MitraEndpoints.js';

// ── Domain constants ──────────────────────────────────────────────────────────
export { CITY, PARAM, DEFAULT_LANGUAGE } from './MitraConstants.js';

// ── Client class (for testing / DI overrides) ─────────────────────────────────
export { MitraClient } from './MitraClient.js';
