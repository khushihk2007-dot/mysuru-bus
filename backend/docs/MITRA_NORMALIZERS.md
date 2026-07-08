# MITRA Normalization Layer — Developer Guide

> `src/services/mitra/normalizers/`

The normalization layer acts as an **Anti-Corruption Layer (ACL)** between the external legacy KSRTC MITRA API and the internal Mysore Bus domain model. It ensures the rest of the application never depends on external field names, inconsistent structures, or raw formats (like numeric strings or unparsed status texts).

---

## Architecture Overview

```
External MITRA API
       │ (Raw legacy JSON)
       ▼
  MitraClient
       │ (Raw response data)
       ▼
normalizers/
  ├── BusNormalizer.js       ← Converts live bus GPS feeds
  ├── RouteNormalizer.js     ← Converts routes list and info
  ├── StopNormalizer.js      ← Converts stop arrays & coordinates
  ├── StatusNormalizer.js    ← Parses "early/late/on-time" text
  ├── GeometryNormalizer.js  ← GeoJSON placeholders for routes
  │
  ├── schemas/
  │   └── index.js           ← Zod schemas for internal domain models
  │
  ├── errors/
  │   └── NormalizationErrors.js ← Typed normalization error classes
  │
  ├── utils/
  │   └── normalizationHelpers.js ← Low-level parse/cast helpers
  │
  └── index.js               ← Public barrel exports
```

---

## Data Models & Field Mappings

### 1. Bus Normalization (`BusNormalizer.js`)

Converts raw live GPS transit feed records into structured `Bus` objects.

| External MITRA Field | Internal Normalized Field | Type | Transformation / Behavior |
| :--- | :--- | :--- | :--- |
| `bus_id` | `id` | `string` | **Required.** Cleaned & cast to string. |
| `route_no` | `routeId` | `string` | **Required.** Internal route identifier. |
| `bus_reg_no` | `registrationNumber` | `string \| null` | License plate string or null. |
| *N/A* | `depot` | `string \| null` | Always `null` in MITRA v1. |
| *N/A* | `schedule` | `string \| null` | Always `null` in MITRA v1. |
| `latitude` / `longitude` | `position` | `{ latitude, longitude } \| null` | Validated WGS-84 floats. `null` if invalid. |
| `velocity` | `speed` | `number \| null` | Parsed to finite number. |
| `status` / `time_diff_min`| `status` | `{ text, delayMinutes, state }` | Parsed state (`EARLY`, `LATE`, `ON_TIME`, `UNKNOWN`). |
| `last_stop` / `last_stop_at` | `lastStop` | `{ name, timestamp } \| null` | `timestamp` converted to ISO-8601 UTC string. |
| *N/A* (or `location`) | `locationDescription` | `string \| null` | Street/intersection description. |
| `latest_gps_timestamp`| `gpsTimestamp` | `string \| null` | Converted to ISO-8601 UTC (IST timezone assumed). |
| *Derived from state* | `icon` | `string` | E.g. `'bus-early'`, `'bus-late'`, `'bus-on-time'`. |

---

### 2. Status Parsing & Normalization (`StatusNormalizer.js`)

Converts descriptive status text strings into state and delay objects:

*   **Early:** `"7.0 min early"` → `state: "EARLY"`, `delayMinutes: -7`
*   **Late:** `"216.0 min late"` → `state: "LATE"`, `delayMinutes: 216`
*   **On Time:** `"On Time"` / `"on time"` → `state: "ON_TIME"`, `delayMinutes: 0`
*   **Fallback:** `"Running"` / `null` → `state: "UNKNOWN"`, `delayMinutes: 0`

---

### 3. Route Normalization (`RouteNormalizer.js`)

Converts static/semi-static route information.

| External MITRA Field | Internal Normalized Field | Type | Transformation / Behavior |
| :--- | :--- | :--- | :--- |
| `route_id` | `id` | `string` | **Required.** Internal route ID. |
| `route_no` | `number` | `string` | **Required.** Route display label (e.g. "201"). |
| `route_name` | `name` | `string \| null` | Route description (e.g. "Mysore to Chamundi Hill"). |
| `source` | `origin` | `string \| null` | Start terminus. |
| `destination` | `destination` | `string \| null` | End terminus. |
| `direction` | `direction` | `'1' \| '2' \| null` | `'1'` for outbound, `'2'` for inbound/return. |
| `total_stops` | `totalStops` | `number \| null` | Cast to integer. |
| `distance` | `distanceKm` | `number \| null` | Cast to float. |
| *N/A* | `geometry` | `null` | Placeholder for future GeoJSON shapes. |

---

### 4. Stop Normalization (`StopNormalizer.js`)

Converts stop listings, with support for varying keys across multiple MITRA endpoints (e.g., `stop_latitude` vs `latitude` vs `lat`).

*   **Sorting:** `normalizeStopList` automatically sorts results by `sequence` ascending if every stop has a valid sequence number.
*   **Flexible Coordinates:** Resolves coordinates from `stop_latitude`, `stopLatitude`, `latitude`, `lat` (and longitude equivalents).

---

## Validation Schemas (`schemas/index.js`)

All schemas are constructed using **Zod**. They represent the contract for internal normalized objects:
*   `BusSchema`
*   `RouteSchema`
*   `StopSchema`

These schemas validate coordinate boundaries (Latitude: `[-90, 90]`, Longitude: `[-180, 180]`), enum values, and datetime strings.

---

## Error Handling

When a normalizer encounters malformed inputs or missing required fields, it raises a typed error:

1.  **`MissingFieldError`**: Thrown when critical identifiers (like `bus_id` or `route_no`) are absent.
2.  **`InvalidCoordinateError`**: Thrown when numeric validation of WGS-84 coordinate fields fails.
3.  **`InvalidStatusError`**: Thrown when a status string is unparseable (used strictly when strict parsing is requested).
4.  **`InvalidTimestampError`**: Thrown when a date string fails to parse into a valid JS Date.

---

## Extension Guidelines

### Adding New Fields to a Model
1.  Update the target schema in `schemas/index.js` with the new field specification.
2.  In the normalizer file (e.g. `BusNormalizer.js`), locate the raw field, process it using one of the helper functions from `normalizationHelpers.js`, and attach it to the frozen return object.
3.  Add unit test coverage in `tests/unit.js` verifying that the field parses correctly under valid, missing, and malformed inputs.

### Wire up Route Geometry (Phase 4)
In `GeometryNormalizer.js`, replace the stub implementation:
1.  Parse the polyline/coordinate array from the live service.
2.  Return a GeoJSON LineString object: `{ type: "LineString", coordinates: [[lon, lat], ...] }`.
3.  Update the `RouteSchema` to validate the GeoJSON structure.
