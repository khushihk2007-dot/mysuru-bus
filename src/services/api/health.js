import apiClient from "./client";

/**
 * Fetches current application health status.
 * @returns {Promise<object>} Health status details.
 */
export async function getHealth() {
  return apiClient.get("/health");
}
