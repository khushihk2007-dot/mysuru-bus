/**
 * @file TransitContext.jsx
 * @description React Context and Provider for managing global transit state.
 * Handles loading routes, managing selected/hovered assets, and controlling layer visibility/opacity.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { transitService } from "../services/transitService";

export const TransitContext = createContext(undefined);

export function TransitProvider({ children }) {
  const [routes, setRoutes] = useState([]);
  const [routesGeoJSON, setRoutesGeoJSON] = useState(null);
  const [stopsGeoJSON, setStopsGeoJSON] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [hoveredStopId, setHoveredStopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Layer visibility & opacity states (Layer Manager)
  const [layerVisibility, setLayerVisibility] = useState({
    routes: true,
    stops: true,
    labels: true
  });

  const [layerOpacity, setLayerOpacity] = useState({
    routes: 0.8,
    stops: 1.0
  });

  // Load initial transit data (Routes and Stops GeoJSON)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [routesList, routesData, stopsData] = await Promise.all([
          transitService.getRoutes(),
          transitService.getAllRoutesGeoJSON(),
          transitService.getStopsGeoJSON()
        ]);

        if (isMounted) {
          setRoutes(routesList);
          setRoutesGeoJSON(routesData);
          setStopsGeoJSON(stopsData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("[TransitProvider] Failed to load transit data:", err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleLayerVisibility = useCallback((layerKey) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  }, []);

  const changeLayerOpacity = useCallback((layerKey, value) => {
    setLayerOpacity((prev) => ({
      ...prev,
      [layerKey]: Math.max(0, Math.min(1, value))
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRouteId(null);
    setSelectedStopId(null);
  }, []);

  const contextValue = {
    routes,
    routesGeoJSON,
    stopsGeoJSON,
    selectedRouteId,
    setSelectedRouteId,
    hoveredRouteId,
    setHoveredRouteId,
    selectedStopId,
    setSelectedStopId,
    hoveredStopId,
    setHoveredStopId,
    layerVisibility,
    toggleLayerVisibility,
    layerOpacity,
    setLayerOpacity: changeLayerOpacity,
    clearSelection,
    loading,
    error
  };

  return (
    <TransitContext.Provider value={contextValue}>
      {children}
    </TransitContext.Provider>
  );
}

/**
 * Custom hook to consume Transit Context
 */
export function useTransit() {
  const context = useContext(TransitContext);
  if (context === undefined) {
    throw new Error("useTransit must be used within a TransitProvider");
  }
  return context;
}

export default TransitContext;
