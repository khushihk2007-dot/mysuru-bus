/**
 * src/utils/timeHelpers.js
 *
 * Time-specific utilities (separate from dateHelpers.js which handles
 * full Date objects; this module focuses on duration and ETA maths).
 */

/**
 * Converts seconds to a "Xm Ys" string for display.
 * @param {number} totalSeconds
 * @returns {string} e.g. "12m 30s" or "1h 3m"
 */
export function secondsToHuman(totalSeconds) {
  const sec  = Math.abs(Math.round(totalSeconds));
  const h    = Math.floor(sec / 3600);
  const m    = Math.floor((sec % 3600) / 60);
  const s    = sec % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Parses a "HH:MM" string to total seconds since midnight.
 * @param {string} timeStr e.g. "14:35"
 * @returns {number} Seconds since midnight
 */
export function parseTimeToSeconds(timeStr) {
  const [hh, mm] = timeStr.split(':').map(Number);
  if (isNaN(hh) || isNaN(mm)) throw new Error(`Invalid time string: "${timeStr}"`);
  return hh * 3600 + mm * 60;
}

/**
 * Adds seconds to a "HH:MM" string, returning the new "HH:MM".
 * Wraps around midnight (i.e. 23:50 + 20min → "00:10").
 * @param {string} timeStr
 * @param {number} addSeconds
 * @returns {string}
 */
export function addSecondsToTime(timeStr, addSeconds) {
  const total   = (parseTimeToSeconds(timeStr) + addSeconds + 86400) % 86400;
  const hh      = String(Math.floor(total / 3600)).padStart(2, '0');
  const mm      = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Estimates travel time in seconds given distance and average speed.
 * @param {number} distanceMetres
 * @param {number} speedKmh       - Average speed in km/h
 * @returns {number} Estimated seconds
 */
export function estimateTravelTime(distanceMetres, speedKmh = 20) {
  if (speedKmh <= 0) throw new Error('Speed must be positive');
  return (distanceMetres / 1000 / speedKmh) * 3600;
}
