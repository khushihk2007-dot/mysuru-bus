/**
 * src/services/mitra/normalizers/BusNormalizer.js
 *
 * MITRA Bus Normalizer — Anti-Corruption Layer
 *
 * Converts raw MITRA bus objects (live GPS feed) into clean, immutable
 * internal Bus domain models. This is the primary consumer of MITRA's
 * getLiveBusDetails API.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Field mapping:
 *
 *   MITRA field            → Internal field
 *   ─────────────────────────────────────────────────────
 *   bus_id                 → id                         (string)
 *   route_no               → routeId                    (string)
 *   bus_reg_no             → registrationNumber         (string | null)
 *   (absent in MITRA v1)   → depot                      (null)
 *   (absent in MITRA v1)   → schedule                   (null)
 *   latitude               → position.latitude          (number, WGS-84)
 *   longitude              → position.longitude         (number, WGS-84)
 *   velocity               → speed                      (number | null)
 *   status                 → status.text                (string | null)
 *   time_diff_min          → status.delayMinutes        (integer)
 *   (derived from status)  → status.state               (ON_TIME|EARLY|LATE|UNKNOWN)
 *   last_stop              → lastStop.name              (string | null)
 *   last_stop_at           → lastStop.timestamp         (ISO-8601 | null)
 *   (absent)               → locationDescription        (null)
 *   latest_gps_timestamp   → gpsTimestamp               (ISO-8601 | null)
 *   (derived from state)   → icon                       (string)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Example input:
 *   {
 *     "bus_id": "247",
 *     "route_no": "201",
 *     "bus_reg_no": "KA57F-0565",
 *     "latitude": "12.276443",
 *     "longitude": "76.626389",
 *     "velocity": 0,
 *     "status": "7.0 min early",
 *     "time_diff_min": -7,
 *     "last_stop": "City Bus Stand",
 *     "last_stop_at": "2026-06-30 11:22:54",
 *     "latest_gps_timestamp": "2026-06-30 20:17:56.0"
 *   }
 *
 * Example output:
 *   {
 *     id: "247",
 *     routeId: "201",
 *     registrationNumber: "KA57F-0565",
 *     depot: null,
 *     schedule: null,
 *     position: { latitude: 12.276443, longitude: 76.626389 },
 *     speed: 0,
 *     status: { text: "7.0 min early", delayMinutes: -7, state: "EARLY" },
 *     lastStop: { name: "City Bus Stand", timestamp: "2026-06-30T05:52:54.000Z" },
 *     locationDescription: null,
 *     gpsTimestamp: "2026-06-30T14:47:56.000Z",
 *     icon: "bus-early"
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  safeString,
  safeNumber,
  safeDate,
  safeCoordinateOrNull,
  deriveIcon,
} from './utils/normalizationHelpers.js';

import { normalizeStatus } from './StatusNormalizer.js';
import { NormalizationError, MissingFieldError } from './errors/NormalizationErrors.js';
import { BusSchema } from './schemas/index.js';

const SOURCE = 'BusNormalizer';

/**
 * @typedef {Object} RawMitraBus
 * @property {string}  bus_id
 * @property {string}  route_no
 * @property {string}  [bus_reg_no]
 * @property {string}  latitude
 * @property {string}  longitude
 * @property {number}  [velocity]
 * @property {string}  [status]
 * @property {number}  [time_diff_min]
 * @property {string}  [last_stop]
 * @property {string}  [last_stop_at]
 * @property {string}  [latest_gps_timestamp]
 */

/**
 * @typedef {Object} NormalizedBus
 * @property {string}           id
 * @property {string}           routeId
 * @property {string|null}      registrationNumber
 * @property {string|null}      depot
 * @property {string|null}      schedule
 * @property {{ latitude: number, longitude: number }|null} position
 * @property {number|null}      speed
 * @property {{ text: string|null, delayMinutes: number, state: string }} status
 * @property {{ name: string|null, timestamp: string|null }|null} lastStop
 * @property {string|null}      locationDescription
 * @property {string|null}      gpsTimestamp
 * @property {string}           icon
 */

/**
 * Normalizes a single raw MITRA bus object into a clean internal Bus model.
 *
 * @param {RawMitraBus} raw  Raw object from MITRA getLiveBusDetails response
 * @returns {Readonly<NormalizedBus>}
 * @throws {MissingFieldError}   If required fields (bus_id, route_no) are absent
 * @throws {NormalizationError}  If the raw object is not a plain object
 */
export function normalizeBus(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new NormalizationError(
      `Expected a bus object, got: ${JSON.stringify(raw)}`,
      'INVALID_BUS_INPUT',
      { source: SOURCE },
    );
  }

  // ── Required fields ────────────────────────────────────────────────────────
  const id      = safeString(raw.bus_id);
  const routeId = safeString(raw.route_no);

  if (!id)      throw new MissingFieldError('bus_id',  SOURCE, raw.bus_id);
  if (!routeId) throw new MissingFieldError('route_no', SOURCE, raw.route_no);

  // ── Position ───────────────────────────────────────────────────────────────
  const lat = safeCoordinateOrNull(raw.latitude,  'latitude');
  const lon = safeCoordinateOrNull(raw.longitude, 'longitude');

  const position = (lat !== null && lon !== null)
    ? Object.freeze({ latitude: lat, longitude: lon })
    : null;

  // ── Status ─────────────────────────────────────────────────────────────────
  const status = normalizeStatus(raw.status, raw.time_diff_min);

  // ── Last stop ──────────────────────────────────────────────────────────────
  const lastStopName = safeString(raw.last_stop);
  const lastStop = lastStopName
    ? Object.freeze({
        name:      lastStopName,
        timestamp: safeDate(raw.last_stop_at, 'last_stop_at'),
      })
    : null;

  // ── Build normalized object ────────────────────────────────────────────────
  const normalized = Object.freeze({
    id,
    routeId,
    registrationNumber:  safeString(raw.bus_reg_no),
    depot:               null,   // Not exposed by MITRA v1
    schedule:            null,   // Not exposed by MITRA v1
    position,
    speed:               safeNumber(raw.velocity),
    status,
    lastStop,
    locationDescription: safeString(raw.location ?? raw.location_description),
    gpsTimestamp:        safeDate(raw.latest_gps_timestamp, 'latest_gps_timestamp'),
    icon:                deriveIcon(status.state),
  });

  return normalized;
}

/**
 * Normalizes an array of raw MITRA bus objects.
 * Invalid items are skipped with a logged warning rather than crashing
 * the entire list — a single bad GPS record should not affect all others.
 *
 * @param {RawMitraBus[]}         rawList    Raw array from MITRA response
 * @param {{ skipInvalid?: boolean }} [opts]
 * @returns {Readonly<NormalizedBus>[]}
 */
export function normalizeBusList(rawList, opts = {}) {
  const { skipInvalid = true } = opts;

  if (!Array.isArray(rawList)) {
    throw new NormalizationError(
      `Expected an array of buses, got: ${typeof rawList}`,
      'INVALID_BUS_LIST_INPUT',
      { source: SOURCE },
    );
  }

  const results = [];

  for (let i = 0; i < rawList.length; i++) {
    try {
      results.push(normalizeBus(rawList[i]));
    } catch (err) {
      if (!skipInvalid) throw err;
      // Silently skip invalid entries in production.
      // The calling repository layer should log the warning.
    }
  }

  return results;
}

/**
 * Validates a normalized bus object against the Zod BusSchema.
 * Useful in tests and during development to catch schema drift.
 *
 * @param {*} normalized
 * @returns {{ success: true, data: NormalizedBus } | { success: false, issues: Array }}
 */
export function validateBus(normalized) {
  const result = BusSchema.safeParse(normalized);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues:  result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
  };
}
