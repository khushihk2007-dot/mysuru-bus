/**
 * src/utils/dateHelpers.js
 *
 * Date/time utilities for the transit platform.
 * All times are handled in ISO-8601. The platform targets IST (UTC+5:30)
 * but stores and communicates in UTC, converting at the edge.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30

/**
 * Returns the current UTC timestamp as an ISO-8601 string.
 * @returns {string}
 */
export const nowISO = () => new Date().toISOString();

/**
 * Converts a UTC Date to IST Date.
 * @param {Date} [date=new Date()]
 * @returns {Date}
 */
export const toIST = (date = new Date()) =>
  new Date(date.getTime() + IST_OFFSET_MS);

/**
 * Formats a Date as "HH:MM" in IST (24-hour clock).
 * Useful for displaying departure/arrival times.
 * @param {Date} [date=new Date()]
 * @returns {string} e.g. "14:35"
 */
export const formatTimeIST = (date = new Date()) => {
  const ist = toIST(date);
  const hh  = String(ist.getUTCHours()).padStart(2, '0');
  const mm  = String(ist.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * Returns the difference in seconds between two dates.
 * @param {Date} from
 * @param {Date} [to=new Date()]
 * @returns {number}
 */
export const diffSeconds = (from, to = new Date()) =>
  Math.round((to.getTime() - from.getTime()) / 1000);

/**
 * Parses a string or timestamp to a Date, returning null on failure.
 * @param {string | number} value
 * @returns {Date | null}
 */
export function parseDate(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns human-friendly relative time ("2 min ago", "in 5 min").
 * @param {Date} date
 * @param {Date} [relative=new Date()]
 * @returns {string}
 */
export function relativeTime(date, relative = new Date()) {
  const diffSec = Math.round((date.getTime() - relative.getTime()) / 1000);
  const absSec  = Math.abs(diffSec);

  if (absSec < 60)   return diffSec >= 0 ? `in ${absSec}s`       : `${absSec}s ago`;
  if (absSec < 3600) {
    const m = Math.round(absSec / 60);
    return diffSec >= 0 ? `in ${m} min` : `${m} min ago`;
  }
  const h = Math.round(absSec / 3600);
  return diffSec >= 0 ? `in ${h}h` : `${h}h ago`;
}
