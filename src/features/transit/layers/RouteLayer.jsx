/**
 * @file RouteLayer.jsx
 * @description MapLibre GL layer component for rendering transit routes.
 * Uses data-driven styling and GPU-accelerated expressions for hover and selection states.
 */

"use client";

import { useEffect } from "react";
import { useMap } from "@/features/map";
import { useTransit } from "../context/TransitContext";

export function RouteLayer() {
  const { map } = useMap();
  const {
    routesGeoJSON,
    selectedRouteId,
    setSelectedRouteId,
    setHoveredRouteId,
    layerVisibility,
    layerOpacity
  } = useTransit();

  const sourceId = "transit-routes";
  const layerId = "transit-routes-line";
  const casingLayerId = "transit-routes-casing";

  useEffect(() => {
    if (!map || !routesGeoJSON) return;

    // ── Add Source ──────────────────────────────────────────────────────────
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: routesGeoJSON,
        promoteId: "routeId" // promotes routeId property to feature.id for state tracking
      });
    } else {
      map.getSource(sourceId).setData(routesGeoJSON);
    }

    // ── Add Route Casing Layer (transparent wider line for easier clicking/hovering) ──
    if (!map.getLayer(casingLayerId)) {
      map.addLayer({
        id: casingLayerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "transparent",
          "line-width": 18
        }
      });
    }

    // ── Add Base Line Layer ──────────────────────────────────────────────────
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          // Use color property from GeoJSON feature properties
          "line-color": ["coalesce", ["get", "color"], "#6B7280"],
          
          // Data-driven line width: active route is thicker
          "line-width": [
            "case",
            ["==", ["get", "routeId"], selectedRouteId || ""],
            6,
            4
          ],
          
          // Data-driven opacity: fade other routes when one is selected
          "line-opacity": [
            "case",
            ["literal", selectedRouteId !== null],
            [
              "case",
              ["==", ["get", "routeId"], selectedRouteId || ""],
              layerOpacity.routes,
              0.15
            ],
            layerOpacity.routes
          ]
        }
      });
    }

    // ── Interactivity Events ────────────────────────────────────────────────
    const onMouseEnter = (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const routeId = e.features[0].properties.routeId;
        setHoveredRouteId(routeId);
      }
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredRouteId(null);
    };

    const onClick = (e) => {
      if (e.features && e.features[0]) {
        e.preventDefault(); // Stop click propagating to map click
        const routeId = e.features[0].properties.routeId;
        setSelectedRouteId((prev) => (prev === routeId ? null : routeId));
      }
    };

    // Attach events to both the visible line and the invisible wide casing (easier touch/clicks)
    map.on("mouseenter", layerId, onMouseEnter);
    map.on("mouseleave", layerId, onMouseLeave);
    map.on("click", casingLayerId, onClick);

    return () => {
      map.off("mouseenter", layerId, onMouseEnter);
      map.off("mouseleave", layerId, onMouseLeave);
      map.off("click", casingLayerId, onClick);
    };
  }, [map, routesGeoJSON, selectedRouteId, layerOpacity.routes, setHoveredRouteId, setSelectedRouteId]);

  // ── Sync Visibility ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!map) return;

    const visibility = layerVisibility.routes ? "visible" : "none";
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
    if (map.getLayer(casingLayerId)) {
      map.setLayoutProperty(casingLayerId, "visibility", visibility);
    }
  }, [map, layerVisibility.routes]);

  // ── Sync Dynamic Styles ──────────────────────────────────────────────────
  useEffect(() => {
    if (!map || !map.getLayer(layerId)) return;

    // Update opacity paint property based on selection and global settings
    map.setPaintProperty(layerId, "line-opacity", [
      "case",
      ["literal", selectedRouteId !== null],
      [
        "case",
        ["==", ["get", "routeId"], selectedRouteId || ""],
        layerOpacity.routes,
        0.15
      ],
      layerOpacity.routes
    ]);

    map.setPaintProperty(layerId, "line-width", [
      "case",
      ["==", ["get", "routeId"], selectedRouteId || ""],
      6,
      4
    ]);
  }, [map, selectedRouteId, layerOpacity.routes]);

  return null;
}

export default RouteLayer;
