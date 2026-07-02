/**
 * @file SelectionLayer.jsx
 * @description MapLibre GL layer component that adds a premium neon-glow outline
 * and pulsing ring effect under the selected route and stop to make them stand out.
 */

"use client";

import { useEffect } from "react";
import { useMap } from "@/features/map";
import { useTransit } from "../context/TransitContext";

export function SelectionLayer() {
  const { map } = useMap();
  const {
    routesGeoJSON,
    stopsGeoJSON,
    selectedRouteId,
    selectedStopId,
    layerVisibility
  } = useTransit();

  const routeSourceId = "transit-routes";
  const stopSourceId = "transit-stops";
  
  const routeSelectedGlowId = "selected-route-glow";
  const stopSelectedGlowId = "selected-stop-glow";

  useEffect(() => {
    if (!map || !routesGeoJSON || !stopsGeoJSON) return;

    // ── Selected Route Neon Glow Layer (Rendered underneath main line) ───────
    if (!map.getLayer(routeSelectedGlowId)) {
      // Find where to insert it so it sits under the main line layer
      const beforeId = map.getLayer("transit-routes-line") ? "transit-routes-line" : undefined;

      map.addLayer({
        id: routeSelectedGlowId,
        type: "line",
        source: routeSourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": ["coalesce", ["get", "color"], "#3B82F6"],
          "line-width": 14,
          "line-opacity": 0.35,
          "line-blur": 6
        },
        filter: ["==", ["get", "routeId"], ""] // start with empty filter
      }, beforeId);
    }

    // ── Selected Stop Accent Ring Layer ──────────────────────────────────────
    if (!map.getLayer(stopSelectedGlowId)) {
      const beforeId = map.getLayer("transit-stops-circle") ? "transit-stops-circle" : undefined;

      map.addLayer({
        id: stopSelectedGlowId,
        type: "circle",
        source: stopSourceId,
        paint: {
          "circle-color": "transparent",
          "circle-radius": 14,
          "circle-stroke-color": ["coalesce", ["get", "routeColor"], "#3B82F6"],
          "circle-stroke-width": 2,
          "circle-stroke-opacity": 0.8
        },
        filter: ["==", ["get", "stopId"], ""]
      }, beforeId);
    }
  }, [map, routesGeoJSON, stopsGeoJSON]);

  // ── Sync Selection State to Filters ──────────────────────────────────────
  useEffect(() => {
    if (!map) return;

    if (map.getLayer(routeSelectedGlowId)) {
      if (selectedRouteId && layerVisibility.routes) {
        map.setFilter(routeSelectedGlowId, ["==", ["get", "routeId"], selectedRouteId]);
        map.setLayoutProperty(routeSelectedGlowId, "visibility", "visible");
      } else {
        map.setLayoutProperty(routeSelectedGlowId, "visibility", "none");
      }
    }
  }, [map, selectedRouteId, layerVisibility.routes]);

  useEffect(() => {
    if (!map) return;

    if (map.getLayer(stopSelectedGlowId)) {
      if (selectedStopId && layerVisibility.stops) {
        map.setFilter(stopSelectedGlowId, ["==", ["get", "stopId"], selectedStopId]);
        map.setLayoutProperty(stopSelectedGlowId, "visibility", "visible");
      } else {
        map.setLayoutProperty(stopSelectedGlowId, "visibility", "none");
      }
    }
  }, [map, selectedStopId, layerVisibility.stops]);

  return null;
}

export default SelectionLayer;
