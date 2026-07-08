/**
 * src/services/mitra/normalizers/schemas/index.js
 *
 * Zod validation schemas for all MITRA domain models.
 *
 * These schemas validate the NORMALIZED output (not the raw MITRA input).
 * They serve as executable documentation of the internal domain model contracts.
 *
 * Usage:
 *   import { BusSchema, RouteSchema, StopSchema } from './schemas/index.js';
 *   const result = BusSchema.safeParse(normalizedBus);
 */

import { z } from 'zod';
import { BUS_STATE } from '../utils/normalizationHelpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable fragments
// ─────────────────────────────────────────────────────────────────────────────

/** WGS-84 latitude: -90 to 90 */
export const LatitudeSchema = z.number().min(-90).max(90);

/** WGS-84 longitude: -180 to 180 */
export const LongitudeSchema = z.number().min(-180).max(180);

/** ISO-8601 UTC timestamp string */
export const ISOTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, 'Must be an ISO-8601 UTC timestamp')
  .nullable();

/** Normalised position object */
export const PositionSchema = z.object({
  latitude:  LatitudeSchema,
  longitude: LongitudeSchema,
}).nullable();

// ─────────────────────────────────────────────────────────────────────────────
// Status schema
// ─────────────────────────────────────────────────────────────────────────────

export const BusStateSchema = z.enum([
  BUS_STATE.ON_TIME,
  BUS_STATE.EARLY,
  BUS_STATE.LATE,
  BUS_STATE.UNKNOWN,
]);

export const StatusSchema = z.object({
  text:         z.string().nullable(),
  delayMinutes: z.number().int(),
  state:        BusStateSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// Bus schema
// ─────────────────────────────────────────────────────────────────────────────

export const BusSchema = z.object({
  /** Internal bus identifier (from bus_id) */
  id:                 z.string(),

  /** Route number (from route_no) */
  routeId:            z.string(),

  /** Bus registration plate (from bus_reg_no) */
  registrationNumber: z.string().nullable(),

  /** Depot the bus belongs to (not in MITRA v1 — always null) */
  depot:              z.string().nullable(),

  /** Scheduled service name (not in MITRA v1 — always null) */
  schedule:           z.string().nullable(),

  /** Current GPS position */
  position:           PositionSchema,

  /** Speed in km/h (from velocity) */
  speed:              z.number().nullable(),

  /** Structured status object */
  status:             StatusSchema,

  /** Last stop the bus served */
  lastStop: z.object({
    name:      z.string().nullable(),
    timestamp: ISOTimestampSchema,
  }).nullable(),

  /** Human-readable location description (from location field if present) */
  locationDescription: z.string().nullable(),

  /** ISO UTC timestamp of the last GPS fix */
  gpsTimestamp:        ISOTimestampSchema,

  /** Semantic icon identifier for frontend rendering */
  icon:                z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Route schema
// ─────────────────────────────────────────────────────────────────────────────

export const RouteSchema = z.object({
  /** Internal route identifier */
  id:          z.string(),

  /** Human-readable route number (e.g. "201", "10A") */
  number:      z.string(),

  /** Full route name (e.g. "Mysore to Chamundi Hill") */
  name:        z.string().nullable(),

  /** Origin stop name */
  origin:      z.string().nullable(),

  /** Destination stop name */
  destination: z.string().nullable(),

  /**
   * Direction: '1' = forward (origin→destination),
   *            '2' = return (destination→origin)
   */
  direction:   z.enum(['1', '2']).nullable(),

  /** Total number of stops on this route */
  totalStops:  z.number().int().nullable(),

  /** Total route distance in km */
  distanceKm:  z.number().nullable(),

  /** GeoJSON geometry placeholder (Phase 4) */
  geometry:    z.null(),

  /** ISO UTC timestamp when this record was normalised */
  normalizedAt: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Stop schema
// ─────────────────────────────────────────────────────────────────────────────

export const StopSchema = z.object({
  /** Internal stop identifier */
  id:       z.string(),

  /** Stop display name */
  name:     z.string(),

  /** GPS position of the stop */
  position: PositionSchema,

  /** Route this stop belongs to (may be null for shared stops) */
  routeId:  z.string().nullable(),

  /** Sequence number of this stop within the route */
  sequence: z.number().int().nullable(),

  /** ISO UTC timestamp when this record was normalised */
  normalizedAt: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Collection schemas
// ─────────────────────────────────────────────────────────────────────────────

export const BusListSchema   = z.array(BusSchema);
export const RouteListSchema = z.array(RouteSchema);
export const StopListSchema  = z.array(StopSchema);
