/**
 * src/services/mitra/normalizers/StopNormalizer.js
 *
 * MITRA Stop Normalizer — Anti-Corruption Layer
 *
 * Converts raw MITRA stop objects into clean, immutable internal Stop models.
 * Stops are semi-static data (change rarely, cached aggressively in Phase 4).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Field mapping:
 *
 *   MITRA field        → Internal field
 *   ─────────────────────────────────────────────────────────
 *   stop_id            → id               (string)
 *   stop_name          → name             (string)
 *   stop_latitude      → position.latitude  (number, WGS-84)
 *   stop_longitude     → position.longitude (number, WGS-84)
 *   route_id           → routeId          (string | null)
 *   stop_sequence      → sequence         (integer | null)
 *
 * Alternative field names observed in different MITRA endpoints:
 *   lat / lon          → position.latitude / position.longitude
 *   latitude / longitude
 *   sequence / seq_no
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Example input:
 *   {
 *     "stop_id": "1042",
 *     "stop_name": "City Bus Stand",
 *     "stop_latitude": "12.3052",
 *     "stop_longitude": "76.6552",
 *     "route_id": "201",
 *     "stop_sequence": "3"
 *   }
 *
 * Example output:
 *   {
 *     id: "1042",
 *     name: "City Bus Stand",
 *     position: { latitude: 12.3052, longitude: 76.6552 },
 *     routeId: "201",
 *     sequence: 3,
 *     normalizedAt: "2026-07-08T13:30:00.000Z"
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { safeString, safeInt, safeCoordinateOrNull } from './utils/normalizationHelpers.js';
import { NormalizationError, MissingFieldError } from './errors/NormalizationErrors.js';
import { StopSchema } from './schemas/index.js';

const SOURCE = 'StopNormalizer';

/**
 * @typedef {Object} RawMitraStop
 * @property {string} [stop_id]
 * @property {string} [stop_name]
 * @property {string} [stop_latitude]
 * @property {string} [stop_longitude]
 * @property {string} [route_id]
 * @property {string|number} [stop_sequence]
 */

/**
 * @typedef {Object} NormalizedStop
 * @property {string} id
 * @property {string} name
 * @property {{ latitude: number, longitude: number }|null} position
 * @property {string|null} routeId
 * @property {number|null} sequence
 * @property {string} normalizedAt
 */

/**
 * Resolves a coordinate value from multiple MITRA field name variants.
 * MITRA is inconsistent — different endpoints use different field names.
 *
 * @param {object} raw  Raw MITRA object
 * @param {'lat'|'lon'} axis
 * @returns {*}
 */
function resolveCoordField(raw, axis) {
  if (axis === 'lat') {
    return raw.stop_latitude  ??
           raw.stopLatitude   ??
           raw.latitude       ??
           raw.lat            ??
           null;
  }
  return raw.stop_longitude ??
         raw.stopLongitude  ??
         raw.longitude      ??
         raw.lon            ??
         null;
}

/**
 * Normalizes a single raw MITRA stop object.
 *
 * @param {RawMitraStop} raw
 * @returns {Readonly<NormalizedStop>}
 * @throws {MissingFieldError} If stop_id or stop_name is absent
 */
export function normalizeStop(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new NormalizationError(
      `Expected a stop object, got: ${JSON.stringify(raw)}`,
      'INVALID_STOP_INPUT',
      { source: SOURCE },
    );
  }

  const id   = safeString(raw.stop_id   ?? raw.stopId  ?? raw.id);
  const name = safeString(raw.stop_name ?? raw.stopName ?? raw.name);

  if (!id)   throw new MissingFieldError('stop_id',   SOURCE, raw.stop_id);
  if (!name) throw new MissingFieldError('stop_name', SOURCE, raw.stop_name);

  // ── Position — try all known field name variants ───────────────────────────
  const lat = safeCoordinateOrNull(resolveCoordField(raw, 'lat'), 'latitude');
  const lon = safeCoordinateOrNull(resolveCoordField(raw, 'lon'), 'longitude');

  const position = (lat !== null && lon !== null)
    ? Object.freeze({ latitude: lat, longitude: lon })
    : null;

  // ── Sequence — also has field name variants ────────────────────────────────
  const sequenceRaw = raw.stop_sequence ?? raw.stopSequence ?? raw.sequence ?? raw.seq_no;

  return Object.freeze({
    id,
    name,
    position,
    routeId:      safeString(raw.route_id ?? raw.routeId),
    sequence:     safeInt(sequenceRaw),
    normalizedAt: new Date().toISOString(),
  });
}

/**
 * Normalizes an array of raw MITRA stop objects.
 * Sorts by sequence if all entries have a valid sequence number.
 *
 * @param {RawMitraStop[]} rawList
 * @param {{ skipInvalid?: boolean, sort?: boolean }} [opts]
 * @returns {Readonly<NormalizedStop>[]}
 */
export function normalizeStopList(rawList, opts = {}) {
  const { skipInvalid = true, sort = true } = opts;

  if (!Array.isArray(rawList)) {
    throw new NormalizationError(
      `Expected an array of stops, got: ${typeof rawList}`,
      'INVALID_STOP_LIST_INPUT',
      { source: SOURCE },
    );
  }

  const results = [];
  for (let i = 0; i < rawList.length; i++) {
    try {
      results.push(normalizeStop(rawList[i]));
    } catch (err) {
      if (!skipInvalid) throw err;
    }
  }

  // Sort by sequence when available — makes polyline rendering trivial
  if (sort && results.length > 1 && results.every((s) => s.sequence !== null)) {
    return results.slice().sort((a, b) => a.sequence - b.sequence);
  }

  return results;
}

/**
 * Validates a normalized stop against the Zod StopSchema.
 *
 * @param {*} normalized
 * @returns {{ success: boolean, data?: NormalizedStop, issues?: Array }}
 */
export function validateStop(normalized) {
  const result = StopSchema.safeParse(normalized);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues:  result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
  };
}
