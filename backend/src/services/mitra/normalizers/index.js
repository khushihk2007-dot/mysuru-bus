/**
 * src/services/mitra/normalizers/index.js
 *
 * Public surface of the MITRA normalization layer.
 *
 * Import exclusively from here — never from individual normalizer files.
 * This allows the ACL internals to be refactored without changing import
 * paths in repositories or services.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage:
 *
 *   import {
 *     normalizeBus,
 *     normalizeBusList,
 *     normalizeRoute,
 *     normalizeRouteList,
 *     normalizeStop,
 *     normalizeStopList,
 *     normalizeStatus,
 *     NormalizationError,
 *     MissingFieldError,
 *   } from '../normalizers/index.js';
 *
 *   // In a repository:
 *   const rawResponse = await mitraClient.post(ENDPOINT.LIVE_BUS_POSITIONS, params);
 *   const buses = normalizeBusList(rawResponse.data.buses);
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Bus ───────────────────────────────────────────────────────────────────────
export {
  normalizeBus,
  normalizeBusList,
  validateBus,
} from './BusNormalizer.js';

// ── Route ─────────────────────────────────────────────────────────────────────
export {
  normalizeRoute,
  normalizeRouteList,
  validateRoute,
} from './RouteNormalizer.js';

// ── Stop ──────────────────────────────────────────────────────────────────────
export {
  normalizeStop,
  normalizeStopList,
  validateStop,
} from './StopNormalizer.js';

// ── Status ────────────────────────────────────────────────────────────────────
export {
  normalizeStatus,
  normalizeStatusList,
} from './StatusNormalizer.js';

// ── Geometry ──────────────────────────────────────────────────────────────────
export {
  normalizeGeometry,
  normalizeBbox,
  computeCentroid,
} from './GeometryNormalizer.js';

// ── Errors ────────────────────────────────────────────────────────────────────
export {
  NormalizationError,
  MissingFieldError,
  InvalidCoordinateError,
  InvalidStatusError,
  InvalidTimestampError,
} from './errors/NormalizationErrors.js';

// ── Utilities (re-exported for repository-level use) ─────────────────────────
export {
  safeString,
  safeNumber,
  safeInt,
  safeDate,
  safeCoordinate,
  safeCoordinateOrNull,
  parseStatus,
  parseDelay,
  deriveIcon,
  BUS_STATE,
} from './utils/normalizationHelpers.js';

// ── Schemas ───────────────────────────────────────────────────────────────────
export {
  BusSchema,
  RouteSchema,
  StopSchema,
  StatusSchema,
  PositionSchema,
  BusListSchema,
  RouteListSchema,
  StopListSchema,
} from './schemas/index.js';
