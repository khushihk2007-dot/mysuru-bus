import apiClient from "./client";

/**
 * Fetches all active fleet live buses.
 * @returns {Promise<Array>} List of live bus objects.
 */
export async function getAllBuses() {
  return apiClient.get("/buses");
}

/**
 * Fetches live details for a single bus.
 * @param {string} busId
 * @returns {Promise<object>} Live bus object.
 */
export async function getBus(busId) {
  if (!busId) throw new Error("busId is required");
  return apiClient.get(`/buses/${busId}`);
}
