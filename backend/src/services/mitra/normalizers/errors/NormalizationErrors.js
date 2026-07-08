/**
 * src/services/mitra/normalizers/errors/NormalizationErrors.js
 *
 * Error hierarchy for the MITRA normalization layer.
 *
 * These errors are thrown by normalizers when incoming MITRA data cannot
 * be transformed into a valid internal domain model.
 *
 * Consumers (repositories, services) should catch these typed errors and
 * map them to application-level errors — never let raw normalization errors
 * propagate to the HTTP layer.
 *
 * Hierarchy:
 *
 *   NormalizationError          ← base for all normalization failures
 *   ├── MissingFieldError       ← required field absent or null
 *   ├── InvalidCoordinateError  ← lat/lon out of bounds or non-numeric
 *   ├── InvalidStatusError      ← unrecognisable MITRA status string
 *   └── InvalidTimestampError   ← unparseable date/time string
 */

// ── Base ─────────────────────────────────────────────────────────────────────

export class NormalizationError extends Error {
  /**
   * @param {string} message
   * @param {string} code          Machine-readable error code
   * @param {object} [context={}]  Diagnostic context (field, value, source)
   */
  constructor(message, code, context = {}) {
    super(message);
    this.name    = this.constructor.name;
    this.code    = code;
    this.context = context;
    this.isNormalizationError = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return { name: this.name, code: this.code, message: this.message, context: this.context };
  }
}

// ── Specific errors ──────────────────────────────────────────────────────────

/**
 * Thrown when a required field is absent, null, or empty in the MITRA response.
 */
export class MissingFieldError extends NormalizationError {
  /**
   * @param {string} field       The required field name in the raw MITRA object
   * @param {string} [source]    Which normalizer detected the problem
   * @param {*}      [received]  What was actually received
   */
  constructor(field, source = 'unknown', received = undefined) {
    super(
      `Required field "${field}" is missing or empty in MITRA response`,
      'MISSING_FIELD',
      { field, source, received },
    );
    this.field = field;
  }
}

/**
 * Thrown when a latitude/longitude value is not a valid WGS-84 coordinate.
 */
export class InvalidCoordinateError extends NormalizationError {
  /**
   * @param {string} axis     'latitude' or 'longitude'
   * @param {*}      value    The invalid value received
   * @param {string} [source]
   */
  constructor(axis, value, source = 'unknown') {
    super(
      `Invalid ${axis} coordinate: "${value}". Must be a finite number within WGS-84 bounds.`,
      'INVALID_COORDINATE',
      { axis, value, source },
    );
    this.axis  = axis;
    this.value = value;
  }
}

/**
 * Thrown when a MITRA status string cannot be parsed into a known state.
 */
export class InvalidStatusError extends NormalizationError {
  /**
   * @param {string} raw     The unparseable status string
   * @param {string} [source]
   */
  constructor(raw, source = 'unknown') {
    super(
      `Cannot parse MITRA status string: "${raw}"`,
      'INVALID_STATUS',
      { raw, source },
    );
    this.raw = raw;
  }
}

/**
 * Thrown when a timestamp string cannot be converted to a valid Date.
 */
export class InvalidTimestampError extends NormalizationError {
  /**
   * @param {string} field   Field name (e.g. 'latest_gps_timestamp')
   * @param {*}      value   The value that failed to parse
   * @param {string} [source]
   */
  constructor(field, value, source = 'unknown') {
    super(
      `Cannot parse timestamp for field "${field}": "${value}"`,
      'INVALID_TIMESTAMP',
      { field, value, source },
    );
    this.field = field;
    this.value = value;
  }
}
