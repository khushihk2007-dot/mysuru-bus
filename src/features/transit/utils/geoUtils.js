/**
 * @file geoUtils.js
 * @description Geographic utility functions for calculating bounds and handling GeoJSON coordinate logic.
 */

/**
 * Calculates the bounding box (bbox) for a GeoJSON LineString coordinate array.
 * @param {Array<Array<number>>} coordinates — Array of [lng, lat] coordinate pairs.
 * @returns {Array<Array<number>>} Bounding box in MapLibre format: [[minLng, minLat], [maxLng, maxLat]]
 */
export function getCoordinatesBounds(coordinates) {
  if (!coordinates || coordinates.length === 0) return null;

  let minLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLng = coordinates[0][0];
  let maxLat = coordinates[0][1];

  for (let i = 1; i < coordinates.length; i++) {
    const [lng, lat] = coordinates[i];
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ];
}

/**
 * Calculates the bounding box of a route object.
 * @param {object} route — Route object containing geometry.
 * @returns {Array<Array<number>>|null}
 */
export function getRouteBounds(route) {
  if (!route || !route.geometry || !route.geometry.coordinates) return null;
  return getCoordinatesBounds(route.geometry.coordinates);
}

/**
 * Fits the map viewport to include all coordinates in a bounding box.
 * @param {object} map — MapLibre GL map instance.
 * @param {Array<Array<number>>} bounds — [[minLng, minLat], [maxLng, maxLat]]
 * @param {object} [options] — Custom fitBounds options
 */
export function fitMapToBounds(map, bounds, options = {}) {
  if (!map || !bounds) return;

  const defaultOptions = {
    padding: { top: 80, bottom: 80, left: 80, right: 80 },
    maxZoom: 16,
    duration: 1000,
    essential: true
  };

  map.fitBounds(bounds, {
    ...defaultOptions,
    ...options
  });
}
