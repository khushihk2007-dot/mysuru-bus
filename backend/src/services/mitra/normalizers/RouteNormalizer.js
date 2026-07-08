/**
 * src/services/mitra/normalizers/RouteNormalizer.js
 *
 * MITRA Route Normalizer — Anti-Corruption Layer
 *
 * Converts raw MITRA route objects into clean, immutable internal Route models.
 * Routes are relatively stable data (change infrequently compared to live GPS).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Field mapping:
 *
 *   MITRA field      → Internal field
 *   ─────────────────────────────────────────────────────────
 *   route_id         → id                  (string)
 *   route_no         → number              (string)
 *   route_name       → name                (string | null)
 *   source           → origin              (string | null)
 *   destination      → destination         (string | null)
 *   direction        → direction           ('1' | '2' | null)
 *   total_stops      → totalStops          (integer | null)
 *   distance         → distanceKm          (number | null)
 *   (Phase 4)        → geometry            (null for now)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Example input:
 *   {
 *     "route_id": "201",
 *     "route_no": "201",
 *     "route_name": "Mysore to Chamundi Hill",
 *     "source": "Mysore Bus Stand",
 *     "destination": "Chamundi Hill",
 *     "direction": "1",
 *     "total_stops": "24",
 *     "distance": "14.5"
 *   }
 *
 * Example output:
 *   {
 *     id: "201",
 *     number: "201",
 *     name: "Mysore to Chamundi Hill",
 *     origin: "Mysore Bus Stand",
 *     destination: "Chamundi Hill",
 *     direction: "1",
 *     totalStops: 24,
 *     distanceKm: 14.5,
 *     geometry: null,
 *     normalizedAt: "2026-07-08T13:30:00.000Z"
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { safeString, safeNumber, safeInt } from './utils/normalizationHelpers.js';
import { NormalizationError, MissingFieldError } from './errors/NormalizationErrors.js';
import { normalizeGeometry } from './GeometryNormalizer.js';
import { RouteSchema } from './schemas/index.js';

const SOURCE = 'RouteNormalizer';

/**
 * @typedef {Object} RawMitraRoute
 * @property {string} [route_id]
 * @property {string} [route_no]
 * @property {string} [route_name]
 * @property {string} [source]
 * @property {string} [destination]
 * @property {string} [direction]
 * @property {string|number} [total_stops]
 * @property {string|number} [distance]
 */

/**
 * @typedef {Object} NormalizedRoute
 * @property {string}      id
 * @property {string}      number
 * @property {string|null} name
 * @property {string|null} origin
 * @property {string|null} destination
 * @property {'1'|'2'|null} direction
 * @property {number|null}  totalStops
 * @property {number|null}  distanceKm
 * @property {null}         geometry
 * @property {string}       normalizedAt
 */

/**
 * Normalizes a single raw MITRA route object.
 *
 * @param {RawMitraRoute} raw
 * @returns {Readonly<NormalizedRoute>}
 * @throws {MissingFieldError} If route_id or route_no is absent
 */
export function normalizeRoute(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new NormalizationError(
      `Expected a route object, got: ${JSON.stringify(raw)}`,
      'INVALID_ROUTE_INPUT',
      { source: SOURCE },
    );
  }

  const id     = safeString(raw.route_id ?? raw.routeId ?? raw.id);
  const number = safeString(raw.route_no ?? raw.routeNo ?? raw.number);

  if (!id)     throw new MissingFieldError('route_id', SOURCE, raw.route_id);
  if (!number) throw new MissingFieldError('route_no', SOURCE, raw.route_no);

  // Direction — MITRA uses "1" (outbound) and "2" (return/inbound)
  const rawDir   = safeString(raw.direction);
  const direction = (rawDir === '1' || rawDir === '2') ? rawDir : null;

  return Object.freeze({
    id,
    number,
    name:        safeString(raw.route_name ?? raw.routeName),
    origin:      safeString(raw.source ?? raw.origin),
    destination: safeString(raw.destination),
    direction,
    totalStops:  safeInt(raw.total_stops ?? raw.totalStops),
    distanceKm:  safeNumber(raw.distance ?? raw.distanceKm),
    geometry:    normalizeGeometry(raw.geometry ?? null),
    normalizedAt: new Date().toISOString(),
  });
}

/**
 * Normalizes an array of raw MITRA route objects.
 *
 * @param {RawMitraRoute[]} rawList
 * @param {{ skipInvalid?: boolean }} [opts]
 * @returns {Readonly<NormalizedRoute>[]}
 */
export function normalizeRouteList(rawList, opts = {}) {
  const { skipInvalid = true } = opts;

  if (!Array.isArray(rawList)) {
    throw new NormalizationError(
      `Expected an array of routes, got: ${typeof rawList}`,
      'INVALID_ROUTE_LIST_INPUT',
      { source: SOURCE },
    );
  }

  const results = [];
  for (let i = 0; i < rawList.length; i++) {
    try {
      results.push(normalizeRoute(rawList[i]));
    } catch (err) {
      if (!skipInvalid) throw err;
    }
  }
  return results;
}

/**
 * Validates a normalized route against the Zod RouteSchema.
 *
 * @param {*} normalized
 * @returns {{ success: boolean, data?: NormalizedRoute, issues?: Array }}
 */
export function validateRoute(normalized) {
  const result = RouteSchema.safeParse(normalized);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues:  result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
  };
}
