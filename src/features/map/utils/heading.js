/**
 * src/features/map/utils/heading.js
 *
 * Utility to calculate headings/bearings between two WGS-84 coordinates.
 */

/**
 * Calculates the bearing/heading in degrees (0 to 360, relative to North)
 * between point 1 and point 2.
 *
 * @param {number} lat1 - Starting latitude.
 * @param {number} lon1 - Starting longitude.
 * @param {number} lat2 - Target latitude.
 * @param {number} lon2 - Target longitude.
 * @returns {number} Angle in degrees (0 = North, 90 = East, etc.).
 */
export function getBearing(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  ) {
    return 0;
  }

  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  const bearing = ((theta * 180) / Math.PI + 360) % 360; // Normalize to [0, 360)
  return bearing;
}
