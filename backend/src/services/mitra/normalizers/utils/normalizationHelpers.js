/**
 * src/services/mitra/normalizers/utils/normalizationHelpers.js
 *
 * Reusable primitive-level utilities for the MITRA normalization layer.
 *
 * These functions are the lowest level of the ACL — they handle the messiness
 * of MITRA's legacy data format: numeric strings, mixed-format timestamps,
 * inconsistent null representations, and status string parsing.
 *
 * ALL normalizers import from here. No magic numbers or patterns should
 * be duplicated across normalizer files.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Exported helpers:
 *
 *   safeString(value, fallback)  → clean string or fallback
 *   safeNumber(value, fallback)  → numeric value or fallback
 *   safeDate(value, field)       → ISO-8601 string or null
 *   safeCoordinate(value, axis)  → validated float or throws
 *   parseStatus(statusText)      → { state, delayMinutes }
 *   parseDelay(statusText)       → delay minutes as signed integer
 *   deriveIcon(state)            → bus icon identifier string
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  InvalidCoordinateError,
  InvalidStatusError,
  InvalidTimestampError,
} from '../errors/NormalizationErrors.js';

// ─────────────────────────────────────────────────────────────────────────────
// Status state constants
// ─────────────────────────────────────────────────────────────────────────────

export const BUS_STATE = Object.freeze({
  ON_TIME: 'ON_TIME',
  EARLY:   'EARLY',
  LATE:    'LATE',
  UNKNOWN: 'UNKNOWN',
});

// ─────────────────────────────────────────────────────────────────────────────
// String helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely converts any value to a trimmed non-empty string.
 * Returns `fallback` (default: null) if the value is absent, null, or empty.
 *
 * @param {*}      value
 * @param {string|null} [fallback=null]
 * @returns {string|null}
 *
 * @example
 * safeString('  KA57F-0565 ')  // → 'KA57F-0565'
 * safeString(null)              // → null
 * safeString('')                // → null
 * safeString(undefined, 'N/A') // → 'N/A'
 */
export function safeString(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  const str = String(value).trim();
  return str === '' ? fallback : str;
}

// ─────────────────────────────────────────────────────────────────────────────
// Number helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely converts any value to a finite number.
 * MITRA frequently sends numbers as strings (e.g. "12.5", "-7").
 * Returns `fallback` (default: null) when the value cannot be parsed.
 *
 * @param {*}           value
 * @param {number|null} [fallback=null]
 * @returns {number|null}
 *
 * @example
 * safeNumber('12.276443') // → 12.276443
 * safeNumber(0)           // → 0
 * safeNumber('n/a')       // → null
 * safeNumber(null, 0)     // → 0
 */
export function safeNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Safely converts any value to a non-negative integer.
 * Useful for sequences, counts, and IDs.
 *
 * @param {*}           value
 * @param {number|null} [fallback=null]
 * @returns {number|null}
 */
export function safeInt(value, fallback = null) {
  const n = safeNumber(value, null);
  if (n === null) return fallback;
  return Math.round(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Date / timestamp helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MITRA timestamp formats observed in the wild:
 *  - "2026-06-30 11:22:54"       (space-separated, no timezone)
 *  - "2026-06-30 20:17:56.0"     (with trailing ".0" fractional seconds)
 *  - "2026-06-30T20:17:56.000Z"  (rare ISO format)
 *  - null / undefined / ""
 *
 * All are treated as IST (UTC+5:30) unless a timezone is explicitly present,
 * because MITRA is a Mysore-region service.
 */
const MITRA_TIMESTAMP_PATTERN = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})(\.\d+)?$/;

/**
 * Safely converts a MITRA timestamp string to an ISO-8601 UTC string.
 * Returns null if the value is absent or unparseable.
 *
 * @param {*}      value   Raw MITRA timestamp value
 * @param {string} [field] Field name for error context
 * @param {boolean} [strict=false] If true, throws InvalidTimestampError on bad value
 * @returns {string|null} ISO-8601 UTC string, or null
 *
 * @example
 * safeDate('2026-06-30 20:17:56.0') // → '2026-06-30T14:47:56.000Z'
 * safeDate(null)                    // → null
 * safeDate('not-a-date')            // → null
 */
export function safeDate(value, field = 'timestamp', strict = false) {
  if (value === null || value === undefined || value === '') return null;

  const raw = String(value).trim();

  // Already an ISO string
  if (raw.includes('T') && (raw.endsWith('Z') || raw.includes('+'))) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // MITRA space-separated format — treat as IST (UTC+5:30)
  const match = MITRA_TIMESTAMP_PATTERN.exec(raw);
  if (match) {
    // Append IST offset to let Date parse it correctly
    const isoString = `${match[1]}T${match[2]}+05:30`;
    const d = new Date(isoString);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Final fallback — let Date() try
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString();

  if (strict) {
    throw new InvalidTimestampError(field, value, 'safeDate');
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Coordinate helpers
// ─────────────────────────────────────────────────────────────────────────────

const COORD_BOUNDS = {
  latitude:  { min: -90,  max: 90  },
  longitude: { min: -180, max: 180 },
};

/**
 * Validates and converts a raw coordinate string/number to a float.
 * MITRA sends coordinates as numeric strings (e.g. "12.276443").
 *
 * Throws InvalidCoordinateError if the value is non-numeric, infinite,
 * or outside WGS-84 bounds.
 *
 * @param {*}      value   Raw coordinate value
 * @param {string} axis    'latitude' or 'longitude'
 * @returns {number}       Validated float
 *
 * @example
 * safeCoordinate('12.276443', 'latitude')  // → 12.276443
 * safeCoordinate('200', 'latitude')        // throws InvalidCoordinateError
 */
export function safeCoordinate(value, axis) {
  const n = safeNumber(value, null);

  if (n === null) {
    throw new InvalidCoordinateError(axis, value, 'safeCoordinate');
  }

  const bounds = COORD_BOUNDS[axis];
  if (!bounds) throw new Error(`Unknown coordinate axis: "${axis}"`);

  if (n < bounds.min || n > bounds.max) {
    throw new InvalidCoordinateError(axis, value, 'safeCoordinate');
  }

  return n;
}

/**
 * Like safeCoordinate but returns null instead of throwing.
 * Use when an invalid coordinate should yield a null position object.
 *
 * @param {*}      value
 * @param {string} axis
 * @returns {number|null}
 */
export function safeCoordinateOrNull(value, axis) {
  try {
    return safeCoordinate(value, axis);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status string parsing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Regular expressions for the known MITRA status string formats.
 *
 * Observed patterns:
 *   "7.0 min early"     → EARLY,  delayMinutes: -7
 *   "216.0 min late"    → LATE,   delayMinutes: 216
 *   "On Time"           → ON_TIME, delayMinutes: 0
 *   "On time"           → ON_TIME  (case variants exist)
 *   "Running"           → UNKNOWN
 *   null / ""           → UNKNOWN
 */
const STATUS_EARLY_RE   = /^([\d.]+)\s*min\s+early$/i;
const STATUS_LATE_RE    = /^([\d.]+)\s*min\s+late$/i;
const STATUS_ON_TIME_RE = /^on\s*time$/i;

/**
 * Parses a raw MITRA status string into a structured status object.
 *
 * @param {string|null|undefined} statusText  Raw MITRA status string
 * @returns {{ state: string, delayMinutes: number }}
 *
 * @example
 * parseStatus('7.0 min early')   // → { state: 'EARLY',   delayMinutes: -7 }
 * parseStatus('216.0 min late')  // → { state: 'LATE',    delayMinutes: 216 }
 * parseStatus('On Time')         // → { state: 'ON_TIME', delayMinutes: 0 }
 * parseStatus(null)              // → { state: 'UNKNOWN', delayMinutes: 0 }
 */
export function parseStatus(statusText) {
  const text = safeString(statusText, '');

  if (!text) return { state: BUS_STATE.UNKNOWN, delayMinutes: 0 };

  const earlyMatch = STATUS_EARLY_RE.exec(text);
  if (earlyMatch) {
    const minutes = Math.round(parseFloat(earlyMatch[1]));
    return { state: BUS_STATE.EARLY, delayMinutes: -minutes };
  }

  const lateMatch = STATUS_LATE_RE.exec(text);
  if (lateMatch) {
    const minutes = Math.round(parseFloat(lateMatch[1]));
    return { state: BUS_STATE.LATE, delayMinutes: minutes };
  }

  if (STATUS_ON_TIME_RE.test(text)) {
    return { state: BUS_STATE.ON_TIME, delayMinutes: 0 };
  }

  // Unrecognised status — return UNKNOWN without throwing so a single
  // malformed bus does not crash an entire list normalisation.
  return { state: BUS_STATE.UNKNOWN, delayMinutes: 0 };
}

/**
 * Extracts only the delay minutes from a MITRA status string.
 * Returns 0 for ON_TIME or UNKNOWN.
 *
 * @param {string|null|undefined} statusText
 * @returns {number}
 *
 * @example
 * parseDelay('7.0 min early')  // → -7
 * parseDelay('30.0 min late')  // → 30
 * parseDelay('On Time')        // → 0
 */
export function parseDelay(statusText) {
  return parseStatus(statusText).delayMinutes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon derivation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps a bus status state to a frontend-consumable icon identifier.
 * The icon string is a semantic token — not a filename.
 * The UI layer resolves it to the actual asset path.
 *
 * @param {string} state  One of the BUS_STATE values
 * @returns {string}      Icon identifier
 *
 * @example
 * deriveIcon('EARLY')   // → 'bus-early'
 * deriveIcon('LATE')    // → 'bus-late'
 * deriveIcon('ON_TIME') // → 'bus-on-time'
 */
export function deriveIcon(state) {
  switch (state) {
    case BUS_STATE.EARLY:   return 'bus-early';
    case BUS_STATE.ON_TIME: return 'bus-on-time';
    case BUS_STATE.LATE:    return 'bus-late';
    default:                return 'bus-unknown';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod error formatter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats Zod v4 validation issues into a developer-friendly array.
 *
 * @param {import('zod').ZodError} zodError
 * @returns {Array<{ field: string, message: string }>}
 */
export function formatZodIssues(zodError) {
  return zodError.issues.map((issue) => ({
    field:   issue.path.join('.') || 'root',
    message: issue.message,
  }));
}
