/**
 * @file TransitContext.jsx
 * @description React Context and Provider for managing global transit state.
 * Integrates with TanStack React Query to fetch routes and stops from backend API.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRoutes } from "@/hooks/api/useRoutes";
import { getRouteStops } from "@/services/api/routes";
import { MOCK_ROUTES } from "../data/mockTransitData";

export const TransitContext = createContext(undefined);

const COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];

const getRouteColor = (routeId) => {
  if (routeId === "119" || routeId === "r119") return "#EF4444";
  if (routeId === "201" || routeId === "r201") return "#3B82F6";
  if (routeId === "80" || routeId === "r80") return "#10B981";
  let hash = 0;
  for (let i = 0; i < routeId.length; i++) {
    hash = routeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

const mapBackendRoute = (r) => {
  // Find matching mock route for geometry fallback
  const mockRoute = MOCK_ROUTES.find(
    (mr) => mr.id === r.id || mr.shortName === r.number || mr.id === "r" + r.id
  );

  return {
    id: r.id,
    shortName: r.number || r.id,
    longName: r.name || `${r.source} ⇄ ${r.destination}`,
    description: `${r.source || "CBS"} ⇄ ${r.destination || "Destination"} (${r.distanceKm || 0} km)`,
    color: mockRoute?.color || getRouteColor(r.id),
    textColor: "#FFFFFF",
    type: "bus",
    geometry: mockRoute?.geometry || { type: "LineString", coordinates: [] }
  };
};

export function TransitProvider({ children }) {
  const { data: apiRoutes, isLoading: isRoutesLoading, error: routesError, refetch: refetchRoutes } = useRoutes();

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [hoveredStopId, setHoveredStopId] = useState(null);

  const [stopsList, setStopsList] = useState([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [stopsError, setStopsError] = useState(null);

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

  // Map backend routes to domain routes
  const routes = useMemo(() => {
    if (!apiRoutes) return [];
    return apiRoutes.map(mapBackendRoute);
  }, [apiRoutes]);

  const loadStops = useCallback(async () => {
    if (!apiRoutes || apiRoutes.length === 0) return;
    
    // Defer state updates to execute asynchronously, preventing cascading renders in effects
    Promise.resolve().then(() => {
      setLoadingStops(true);
      setStopsError(null);
    });

    try {
      const allStopsPromises = apiRoutes.map(async (route) => {
        try {
          const stops = await getRouteStops(route.id);
          return { routeId: route.id, stops };
        } catch (e) {
          console.error(`Failed to fetch stops for route ${route.id}:`, e);
          return { routeId: route.id, stops: [] };
        }
      });
      const results = await Promise.all(allStopsPromises);
      setStopsList(results);
    } catch (err) {
      console.error("[TransitProvider] Failed to load all stops:", err);
      setStopsError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoadingStops(false);
    }
  }, [apiRoutes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStops();
  }, [loadStops]);

  // Generate GeoJSON representation for all routes
  const routesGeoJSON = useMemo(() => {
    if (!routes || routes.length === 0) return null;
    return {
      type: "FeatureCollection",
      features: routes.map((route) => ({
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
      }))
    };
  }, [routes]);

  // Generate GeoJSON representation for stops
  const stopsGeoJSON = useMemo(() => {
    const features = [];
    const routesToProcess = selectedRouteId
      ? stopsList.filter((item) => item.routeId === selectedRouteId)
      : stopsList;

    routesToProcess.forEach(({ routeId, stops }) => {
      const route = routes.find((r) => r.id === routeId);
      stops.forEach((stop, index) => {
        const exists = features.some((f) => f.properties.stopId === stop.id);
        if (!exists) {
          const isOrigin = index === 0;
          const isDestination = index === stops.length - 1;
          features.push({
            type: "Feature",
            id: stop.id,
            properties: {
              stopId: stop.id,
              stopName: stop.name,
              stopType: isOrigin ? "origin" : isDestination ? "destination" : "intermediate",
              routeId: routeId,
              routeColor: route?.color || "#3B82F6",
              routeShortName: route?.shortName || ""
            },
            geometry: {
              type: "Point",
              coordinates: [stop.position.longitude, stop.position.latitude]
            }
          });
        }
      });
    });

    return {
      type: "FeatureCollection",
      features
    };
  }, [stopsList, selectedRouteId, routes]);

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

  const handleRetry = useCallback(() => {
    refetchRoutes();
    loadStops();
  }, [refetchRoutes, loadStops]);

  const contextValue = {
    routes,
    routesGeoJSON,
    stopsGeoJSON,
    stopsList,
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
    loading: isRoutesLoading || loadingStops,
    error: routesError || stopsError,
    handleRetry
  };

  return (
    <TransitContext.Provider value={contextValue}>
      {children}
    </TransitContext.Provider>
  );
}

export function useTransit() {
  const context = useContext(TransitContext);
  if (context === undefined) {
    throw new Error("useTransit must be used within a TransitProvider");
  }
  return context;
}

export default TransitContext;
