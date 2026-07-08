/**
 * src/utils/distanceHelpers.js
 *
 * Geospatial utility functions for the transit platform.
 * Uses the Haversine formula — accurate for distances up to ~1000 km.
 *
 * All coordinates are in decimal degrees (WGS-84).
 * Distances are returned in metres unless otherwise specified.
 */

const EARTH_RADIUS_M = 6_371_000; // metres

/**
 * Converts degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Haversine distance between two lat/lon points.
 * @param {{ lat: number; lon: number }} a
 * @param {{ lat: number; lon: number }} b
 * @returns {number} Distance in metres
 */
export function haversineDistance(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLon * sinDLon;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Converts metres to kilometres, rounded to 2 decimal places.
 * @param {number} metres
 * @returns {number}
 */
export const metresToKm = (metres) => Math.round(metres / 10) / 100;

/**
 * Formats a distance in metres to a human-friendly string.
 * < 1000 m → "350 m"
 * ≥ 1000 m → "2.5 km"
 * @param {number} metres
 * @returns {string}
 */
export function formatDistance(metres) {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${metresToKm(metres)} km`;
}

/**
 * Returns the bearing (degrees) from point A to point B.
 * 0° = North, 90° = East, 180° = South, 270° = West.
 * @param {{ lat: number; lon: number }} a
 * @param {{ lat: number; lon: number }} b
 * @returns {number} Bearing in degrees [0, 360)
 */
export function bearing(a, b) {
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x = Math.sin(dLon) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}

/**
 * Validates that a coordinate pair is within valid WGS-84 bounds.
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
export const isValidCoordinate = (lat, lon) =>
  lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
