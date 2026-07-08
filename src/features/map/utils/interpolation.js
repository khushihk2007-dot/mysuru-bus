/**
 * src/features/map/utils/interpolation.js
 *
 * Utilities for linear and angle interpolation.
 */

/**
 * Linearly interpolates between two numbers.
 *
 * @param {number} start - Starting value.
 * @param {number} end - Ending value.
 * @param {number} t - Time parameter [0, 1].
 * @returns {number} Interpolated value.
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Linearly interpolates between two angles in degrees, taking the shortest path.
 *
 * @param {number} a - Starting angle in degrees.
 * @param {number} b - Ending angle in degrees.
 * @param {number} t - Time parameter [0, 1].
 * @returns {number} Interpolated angle in degrees [0, 360).
 */
export function interpolateAngle(a, b, t) {
  const diff = ((b - a + 180) % 360) - 180;
  const shortestDiff = diff < -180 ? diff + 360 : diff;
  return (a + shortestDiff * t + 360) % 360;
}
