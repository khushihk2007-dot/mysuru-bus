import apiClient from "./client";

/**
 * Fetches all available transit routes.
 * @returns {Promise<Array>} List of route objects.
 */
export async function getRoutes() {
  return apiClient.get("/routes");
}

/**
 * Fetches details for a single route.
 * @param {string} routeId
 * @returns {Promise<object>} Route details object.
 */
export async function getRoute(routeId) {
  if (!routeId) throw new Error("routeId is required");
  return apiClient.get(`/routes/${routeId}`);
}

/**
 * Fetches stops sequence for a specific route.
 * @param {string} routeId
 * @returns {Promise<Array>} List of stop objects.
 */
export async function getRouteStops(routeId) {
  if (!routeId) throw new Error("routeId is required");
  return apiClient.get(`/routes/${routeId}/stops`);
}

/**
 * Fetches live buses active on a specific route.
 * @param {string} routeId
 * @returns {Promise<Array>} List of live bus objects.
 */
export async function getRouteBuses(routeId) {
  if (!routeId) throw new Error("routeId is required");
  return apiClient.get(`/routes/${routeId}/buses`);
}
