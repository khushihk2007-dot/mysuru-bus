/**
 * @file StopLayer.jsx
 * @description MapLibre GL layer component for rendering bus stops with labels.
 * Handles origin/destination/intermediate styles, zoom-dependent label visibility, and selection states.
 */

"use client";

import { useEffect } from "react";
import { useMap } from "@/features/map";
import { useTransit } from "../context/TransitContext";

export function StopLayer({ theme = "light", onSelectStop }) {
  const { map } = useMap();
  const {
    stopsGeoJSON,
    selectedRouteId,
    selectedStopId,
    setSelectedStopId,
    setHoveredStopId,
    layerVisibility,
    layerOpacity
  } = useTransit();

  const sourceId = "transit-stops";
  const circleLayerId = "transit-stops-circle";
  const labelLayerId = "transit-stops-label";

  useEffect(() => {
    if (!map || !stopsGeoJSON) return;

    // ── Add Source ──────────────────────────────────────────────────────────
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: stopsGeoJSON,
        promoteId: "stopId"
      });
    } else {
      map.getSource(sourceId).setData(stopsGeoJSON);
    }

    // ── Add Circle Layer ─────────────────────────────────────────────────────
    if (!map.getLayer(circleLayerId)) {
      map.addLayer({
        id: circleLayerId,
        type: "circle",
        source: sourceId,
        paint: {
          // Color based on stop type (Origin, Destination, Intermediate)
          "circle-color": [
            "match",
            ["get", "stopType"],
            "origin",
            "#10B981", // Green
            "destination",
            "#EF4444", // Red
            "#FFFFFF"  // White for intermediate
          ],
          
          // Border color linked to route color
          "circle-stroke-color": ["coalesce", ["get", "routeColor"], "#4B5563"],
          
          // Border width: thicker for selected stop
          "circle-stroke-width": [
            "case",
            ["==", ["get", "stopId"], selectedStopId || ""],
            4,
            2
          ],
          
          // Radius based on type and selection/hover states
          "circle-radius": [
            "case",
            ["==", ["get", "stopId"], selectedStopId || ""],
            8,
            [
              "match",
              ["get", "stopType"],
              "origin",
              6,
              "destination",
              6,
              4 // intermediate
            ]
          ],
          
          // Fade stops that do not belong to the selected route
          "circle-opacity": [
            "case",
            ["literal", selectedRouteId !== null],
            [
              "case",
              ["==", ["get", "routeId"], selectedRouteId || ""],
              layerOpacity.stops,
              0.15
            ],
            layerOpacity.stops
          ],
          
          "circle-stroke-opacity": [
            "case",
            ["literal", selectedRouteId !== null],
            [
              "case",
              ["==", ["get", "routeId"], selectedRouteId || ""],
              1.0,
              0.15
            ],
            1.0
          ]
        }
      });
    }

    // ── Add Label Layer (Symbol layer for stop names) ────────────────────────
    if (!map.getLayer(labelLayerId)) {
      map.addLayer({
        id: labelLayerId,
        type: "symbol",
        source: sourceId,
        minzoom: 13, // Only show labels at higher zoom levels to prevent clutter
        layout: {
          "text-field": ["get", "stopName"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
          "text-allow-overlap": false, // Prevent overlapping labels
          "text-ignore-placement": false
        },
        paint: {
          "text-color": theme === "dark" ? "#E5E7EB" : "#1F2937",
          "text-halo-color": theme === "dark" ? "#111827" : "#FFFFFF",
          "text-halo-width": 1.5,
          
          // Fade labels matching the circle opacity behavior
          "text-opacity": [
            "case",
            ["literal", selectedRouteId !== null],
            [
              "case",
              ["==", ["get", "routeId"], selectedRouteId || ""],
              1.0,
              0.1
            ],
            0.9
          ]
        }
      });
    }

    // ── Interactivity Events ────────────────────────────────────────────────
    const onMouseEnter = (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const stopId = e.features[0].properties.stopId;
        setHoveredStopId(stopId);

        // MapLibre doesn't support direct hover state transitions via paint property
        // unless we use featureState, so we manually scale up the hovered stop
        map.setPaintProperty(circleLayerId, "circle-radius", [
          "case",
          ["==", ["get", "stopId"], selectedStopId || ""],
          8,
          ["==", ["get", "stopId"], stopId],
          8, // scale up hovered stop
          [
            "match",
            ["get", "stopType"],
            "origin",
            6,
            "destination",
            6,
            4
          ]
        ]);
      }
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredStopId(null);
      
      // Reset radius to default
      map.setPaintProperty(circleLayerId, "circle-radius", [
        "case",
        ["==", ["get", "stopId"], selectedStopId || ""],
        8,
        [
          "match",
          ["get", "stopType"],
          "origin",
          6,
          "destination",
          6,
          4
        ]
      ]);
    };

    const onClick = (e) => {
      if (e.features && e.features[0]) {
        e.preventDefault(); // Stop click propagating
        const stopId = e.features[0].properties.stopId;
        const stopName = e.features[0].properties.stopName;
        
        setSelectedStopId((prev) => (prev === stopId ? null : stopId));

        if (onSelectStop) {
          onSelectStop(stopId === selectedStopId ? null : stopId);
        }
      }
    };

    map.on("mouseenter", circleLayerId, onMouseEnter);
    map.on("mouseleave", circleLayerId, onMouseLeave);
    map.on("click", circleLayerId, onClick);

    return () => {
      map.off("mouseenter", circleLayerId, onMouseEnter);
      map.off("mouseleave", circleLayerId, onMouseLeave);
      map.off("click", circleLayerId, onClick);
    };
  }, [map, stopsGeoJSON, selectedRouteId, selectedStopId, theme, layerOpacity.stops, setHoveredStopId, setSelectedStopId, onSelectStop]);

  // ── Sync Visibility ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!map) return;

    const visibility = layerVisibility.stops ? "visible" : "none";
    if (map.getLayer(circleLayerId)) {
      map.setLayoutProperty(circleLayerId, "visibility", visibility);
    }
    
    // Labels are controlled by both stop layer visibility and labels setting
    const labelVisibility = (layerVisibility.stops && layerVisibility.labels) ? "visible" : "none";
    if (map.getLayer(labelLayerId)) {
      map.setLayoutProperty(labelLayerId, "visibility", labelVisibility);
    }
  }, [map, layerVisibility.stops, layerVisibility.labels]);

  // ── Sync Dynamic Styles ──────────────────────────────────────────────────
  useEffect(() => {
    if (!map || !map.getLayer(circleLayerId)) return;

    // Circle Styles
    map.setPaintProperty(circleLayerId, "circle-stroke-width", [
      "case",
      ["==", ["get", "stopId"], selectedStopId || ""],
      4,
      2
    ]);

    map.setPaintProperty(circleLayerId, "circle-radius", [
      "case",
      ["==", ["get", "stopId"], selectedStopId || ""],
      8,
      [
        "match",
        ["get", "stopType"],
        "origin",
        6,
        "destination",
        6,
        4
      ]
    ]);

    map.setPaintProperty(circleLayerId, "circle-opacity", [
      "case",
      ["literal", selectedRouteId !== null],
      [
        "case",
        ["==", ["get", "routeId"], selectedRouteId || ""],
        layerOpacity.stops,
        0.15
      ],
      layerOpacity.stops
    ]);

    map.setPaintProperty(circleLayerId, "circle-stroke-opacity", [
      "case",
      ["literal", selectedRouteId !== null],
      [
        "case",
        ["==", ["get", "routeId"], selectedRouteId || ""],
        1.0,
        0.15
      ],
      1.0
    ]);

    // Label Styles
    if (map.getLayer(labelLayerId)) {
      map.setPaintProperty(labelLayerId, "text-color", theme === "dark" ? "#E5E7EB" : "#1F2937");
      map.setPaintProperty(labelLayerId, "text-halo-color", theme === "dark" ? "#111827" : "#FFFFFF");
      map.setPaintProperty(labelLayerId, "text-opacity", [
        "case",
        ["literal", selectedRouteId !== null],
        [
          "case",
          ["==", ["get", "routeId"], selectedRouteId || ""],
          1.0,
          0.1
        ],
        0.9
      ]);
    }
  }, [map, selectedRouteId, selectedStopId, theme, layerOpacity.stops]);

  return null;
}

export default StopLayer;
