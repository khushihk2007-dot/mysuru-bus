/**
 * @file HighlightLayer.jsx
 * @description MapLibre GL layer component that handles real-time hover highlighting
 * for routes and stops, overlaying a high-contrast visual cue on hovered features.
 */

"use client";

import { useEffect } from "react";
import { useMap } from "@/features/map";
import { useTransit } from "../context/TransitContext";

export function HighlightLayer() {
  const { map } = useMap();
  const {
    routesGeoJSON,
    stopsGeoJSON,
    hoveredRouteId,
    hoveredStopId,
    layerVisibility
  } = useTransit();

  const routeSourceId = "transit-routes";
  const stopSourceId = "transit-stops";
  
  const routeHighlightId = "hovered-route-highlight";
  const stopHighlightId = "hovered-stop-highlight";

  useEffect(() => {
    if (!map || !routesGeoJSON || !stopsGeoJSON) return;

    // ── Hovered Route Highlight Layer (Rendered on top of base route line) ──
    if (!map.getLayer(routeHighlightId)) {
      map.addLayer({
        id: routeHighlightId,
        type: "line",
        source: routeSourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#FFFFFF", // white high-contrast overlay
          "line-width": 4,
          "line-opacity": 0.4
        },
        filter: ["==", ["get", "routeId"], ""]
      });
    }

    // ── Hovered Stop Highlight Layer (Rendered on top of stops) ─────────────
    if (!map.getLayer(stopHighlightId)) {
      map.addLayer({
        id: stopHighlightId,
        type: "circle",
        source: stopSourceId,
        paint: {
          "circle-color": "transparent",
          "circle-radius": 10,
          "circle-stroke-color": "#FFFFFF", // white outer ring
          "circle-stroke-width": 1.5,
          "circle-stroke-opacity": 0.9
        },
        filter: ["==", ["get", "stopId"], ""]
      });
    }
  }, [map, routesGeoJSON, stopsGeoJSON]);

  // ── Sync Hover State to Filters ──────────────────────────────────────────
  useEffect(() => {
    if (!map) return;

    if (map.getLayer(routeHighlightId)) {
      if (hoveredRouteId && layerVisibility.routes) {
        map.setFilter(routeHighlightId, ["==", ["get", "routeId"], hoveredRouteId]);
        map.setLayoutProperty(routeHighlightId, "visibility", "visible");
      } else {
        map.setLayoutProperty(routeHighlightId, "visibility", "none");
      }
    }
  }, [map, hoveredRouteId, layerVisibility.routes]);

  useEffect(() => {
    if (!map) return;

    if (map.getLayer(stopHighlightId)) {
      if (hoveredStopId && layerVisibility.stops) {
        map.setFilter(stopHighlightId, ["==", ["get", "stopId"], hoveredStopId]);
        map.setLayoutProperty(stopHighlightId, "visibility", "visible");
      } else {
        map.setLayoutProperty(stopHighlightId, "visibility", "none");
      }
    }
  }, [map, hoveredStopId, layerVisibility.stops]);

  return null;
}

export default HighlightLayer;
