/**
 * src/services/mitra/normalizers/StatusNormalizer.js
 *
 * MITRA Status Normalizer
 *
 * Converts raw MITRA status strings into structured, typed status objects.
 * This normalizer is used internally by BusNormalizer and is also exported
 * for standalone use when only status data is needed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Input (raw MITRA status string):
 *   "7.0 min early"
 *   "216.0 min late"
 *   "On Time"
 *   null
 *
 * Output (normalized status object):
 *   {
 *     text:         "7.0 min early",  // original string preserved
 *     delayMinutes: -7,               // negative = early, positive = late
 *     state:        "EARLY"           // ON_TIME | EARLY | LATE | UNKNOWN
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Design notes:
 *  - `time_diff_min` from MITRA is cross-validated against the parsed status
 *    string but the text string is used as the source of truth.
 *  - The normalizer never throws for unknown status strings — it returns
 *    UNKNOWN state so a single bad value doesn't crash a list response.
 */

import { parseStatus, safeString, safeInt } from './utils/normalizationHelpers.js';

/**
 * @typedef {Object} NormalizedStatus
 * @property {string|null} text          Original MITRA status string
 * @property {number}      delayMinutes  Signed delay: negative = early, positive = late
 * @property {string}      state         'ON_TIME' | 'EARLY' | 'LATE' | 'UNKNOWN'
 */

/**
 * Normalizes a MITRA status string into a typed status object.
 *
 * @param {string|null|undefined} rawStatus       MITRA `status` field
 * @param {number|null|undefined} rawTimeDiffMin  MITRA `time_diff_min` field (cross-validation)
 * @returns {NormalizedStatus}
 *
 * @example
 * normalizeStatus('7.0 min early', -7)
 * // → { text: '7.0 min early', delayMinutes: -7, state: 'EARLY' }
 *
 * normalizeStatus('On Time', 0)
 * // → { text: 'On Time', delayMinutes: 0, state: 'ON_TIME' }
 *
 * normalizeStatus(null, null)
 * // → { text: null, delayMinutes: 0, state: 'UNKNOWN' }
 */
export function normalizeStatus(rawStatus, rawTimeDiffMin = null) {
  const text     = safeString(rawStatus);
  const parsed   = parseStatus(text);

  // Cross-validate: if MITRA provides time_diff_min, prefer it over our
  // own regex parse for the numeric value (text parsing may lose precision).
  const timeDiff = safeInt(rawTimeDiffMin, null);
  const delayMinutes = timeDiff !== null ? timeDiff : parsed.delayMinutes;

  return Object.freeze({
    text,
    delayMinutes,
    state: parsed.state,
  });
}

/**
 * Normalizes an array of raw status strings (e.g. from a batch response).
 *
 * @param {Array<{ status?: string, time_diff_min?: number }>} items
 * @returns {NormalizedStatus[]}
 */
export function normalizeStatusList(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeStatus(item?.status, item?.time_diff_min));
}
