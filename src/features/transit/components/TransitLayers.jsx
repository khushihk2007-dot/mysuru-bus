/**
 * @file TransitLayers.jsx
 * @description Coordinate component that mounts all transit-related GIS layers,
 * initializes the GeoJSON sources, and handles zoom-to-route viewport transitions.
 * Employs a state gate to ensure sources exist before child layers mount.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useMap } from "@/features/map";
import { useTransit } from "../context/TransitContext";
import { RouteLayer } from "../layers/RouteLayer";
import { StopLayer } from "../layers/StopLayer";
import { SelectionLayer } from "../layers/SelectionLayer";
import { HighlightLayer } from "../layers/HighlightLayer";
import { getRouteBounds, fitMapToBounds } from "../utils/geoUtils";
import { MOCK_ROUTES } from "../data/mockTransitData";

/**
 * TransitLayers
 * Rendered inside the map context to draw polylines, stops, highlights, and coordinate fitBounds.
 *
 * @param {object}   props
 * @param {string}   [props.theme]        — Theme name ("light" | "dark")
 * @param {function} [props.onSelectStop] — Callback when a stop is clicked
 */
export function TransitLayers({ theme = "light", onSelectStop }) {
  const { map } = useMap();
  const { selectedRouteId, routesGeoJSON, stopsGeoJSON, loading } = useTransit();
  const [sourcesReady, setSourcesReady] = useState(false);

  const routeSourceId = "transit-routes";
  const stopSourceId = "transit-stops";

  // ── Initialize Sources first to prevent child layer race conditions ────
  useEffect(() => {
    if (!map || !routesGeoJSON || !stopsGeoJSON) {
      if (sourcesReady) {
        Promise.resolve().then(() => setSourcesReady(false));
      }
      return;
    }

    // Initialize Routes Source
    if (!map.getSource(routeSourceId)) {
      map.addSource(routeSourceId, {
        type: "geojson",
        data: routesGeoJSON,
        promoteId: "routeId"
      });
    } else {
      map.getSource(routeSourceId).setData(routesGeoJSON);
    }

    // Initialize Stops Source
    if (!map.getSource(stopSourceId)) {
      map.addSource(stopSourceId, {
        type: "geojson",
        data: stopsGeoJSON,
        promoteId: "stopId"
      });
    } else {
      map.getSource(stopSourceId).setData(stopsGeoJSON);
    }

    if (!sourcesReady) {
      Promise.resolve().then(() => setSourcesReady(true));
    }
  }, [map, routesGeoJSON, stopsGeoJSON, sourcesReady]);

  // ── Zoom/Fit viewport to selected route ─────────────────────────────────
  useEffect(() => {
    if (!map || !selectedRouteId || loading || !sourcesReady) return;

    // Find the selected route coordinates
    const selectedRoute = MOCK_ROUTES.find((r) => r.id === selectedRouteId);
    if (!selectedRoute) return;

    const bounds = getRouteBounds(selectedRoute);
    if (bounds) {
      fitMapToBounds(map, bounds, {
        padding: { top: 120, bottom: 120, left: 120, right: 380 }, // extra right padding to prevent details panel overlap!
        maxZoom: 15,
        duration: 1000
      });
    }
  }, [map, selectedRouteId, loading, sourcesReady]);

  if (loading || !sourcesReady) return null;

  return (
    <>
      {/* Route lines */}
      <RouteLayer />

      {/* Selected route glow & stop rings */}
      <SelectionLayer />

      {/* Hover highlight overlays */}
      <HighlightLayer />

      {/* Stop marker dots and label text */}
      <StopLayer theme={theme} onSelectStop={onSelectStop} />
    </>
  );
}

export default TransitLayers;
