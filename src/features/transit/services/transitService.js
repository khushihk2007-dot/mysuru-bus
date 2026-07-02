/**
 * @file transitService.js
 * @description Decoupled data service for loading transit routes and stops.
 * Designed to easily transition from mock local data to API endpoints, GeoServer WMS, or vector tiles.
 */

import { MOCK_ROUTES } from "../data/mockTransitData";

export const transitService = {
  /**
   * Get list of all routes in the system.
   * @returns {Promise<Array>} List of route objects.
   */
  async getRoutes() {
    // Mimic async API latency
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_ROUTES.map(({ id, shortName, longName, description, color, textColor, type }) => ({
          id,
          shortName,
          longName,
          description,
          color,
          textColor,
          type
        })));
      }, 100);
    });
  },

  /**
   * Get a single route by its ID.
   * @param {string} routeId
   * @returns {Promise<object|null>}
   */
  async getRouteById(routeId) {
    return new Promise((resolve) => {
      const route = MOCK_ROUTES.find((r) => r.id === routeId);
      resolve(route ? { ...route } : null);
    });
  },

  /**
   * Get all route geometries represented as a GeoJSON FeatureCollection.
   * @returns {Promise<object>} GeoJSON FeatureCollection
   */
  async getAllRoutesGeoJSON() {
    return new Promise((resolve) => {
      const features = MOCK_ROUTES.map((route) => ({
        type: "Feature",
        id: route.id,
        properties: {
          routeId: route.id,
          shortName: route.shortName,
          longName: route.longName,
          color: route.color,
          type: route.type,
          description: route.description
        },
        geometry: route.geometry
      }));

      resolve({
        type: "FeatureCollection",
        features
      });
    });
  },

  /**
   * Get all stops represented as a GeoJSON FeatureCollection.
   * @param {string} [routeId] — Optionally filter stops by route
   * @returns {Promise<object>} GeoJSON FeatureCollection of Point features
   */
  async getStopsGeoJSON(routeId = null) {
    return new Promise((resolve) => {
      const features = [];
      const routesToProcess = routeId 
        ? MOCK_ROUTES.filter((r) => r.id === routeId)
        : MOCK_ROUTES;

      routesToProcess.forEach((route) => {
        route.stops.forEach((stop) => {
          // Check if this stop was already added to prevent duplicates when loading all stops
          const exists = features.some((f) => f.properties.stopId === stop.id);
          if (!exists) {
            features.push({
              type: "Feature",
              id: stop.id,
              properties: {
                stopId: stop.id,
                stopName: stop.name,
                stopType: stop.type, // 'origin', 'destination', 'intermediate'
                routeId: route.id,
                routeColor: route.color,
                routeShortName: route.shortName
              },
              geometry: {
                type: "Point",
                coordinates: stop.coordinates
              }
            });
          }
        });
      });

      resolve({
        type: "FeatureCollection",
        features
      });
    });
  }
};

export default transitService;
