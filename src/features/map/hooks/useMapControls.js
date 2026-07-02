/**
 * @file useMapControls.js
 * @description Hook exposing imperative map control actions.
 *
 * Provides stable callbacks for:
 *  - Zoom in / out
 *  - Reset view to default
 *  - Fly to a location
 *  - Reset bearing / pitch
 *  - Current bearing (for animated compass)
 *
 * All callbacks are no-ops when the map is not yet ready.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useMap } from "./useMap";
import { RESET_VIEW } from "../config/mapConfig";

/**
 * useMapControls
 *
 * @returns {{
 *   zoomIn:       () => void,
 *   zoomOut:      () => void,
 *   resetView:    () => void,
 *   resetBearing: () => void,
 *   flyTo:        (options: object) => void,
 *   bearing:      number,
 *   zoom:         number,
 * }}
 */
export function useMapControls() {
  const { map, isReady } = useMap();
  const [bearing, setBearing] = useState(0);
  const [zoom, setZoom] = useState(13);

  // ── Sync live map state ────────────────────────────────────────────────
  useEffect(() => {
    if (!map || !isReady) return;

    const onRotate = () => setBearing(map.getBearing());
    const onZoom = () => setZoom(map.getZoom());

    map.on("rotate", onRotate);
    map.on("zoom", onZoom);

    // seed with current values asynchronously to avoid synchronous cascading renders
    Promise.resolve().then(() => {
      if (map) {
        setBearing(map.getBearing());
        setZoom(map.getZoom());
      }
    });

    return () => {
      map.off("rotate", onRotate);
      map.off("zoom", onZoom);
    };
  }, [map, isReady]);

  // ── Imperative actions ─────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    map?.zoomIn({ duration: 250 });
  }, [map]);

  const zoomOut = useCallback(() => {
    map?.zoomOut({ duration: 250 });
  }, [map]);

  const resetView = useCallback(() => {
    map?.easeTo(RESET_VIEW);
  }, [map]);

  const resetBearing = useCallback(() => {
    map?.easeTo({ bearing: 0, pitch: 0, duration: 400 });
  }, [map]);

  const flyTo = useCallback(
    (options) => {
      map?.flyTo({ ...options });
    },
    [map]
  );

  return {
    zoomIn,
    zoomOut,
    resetView,
    resetBearing,
    flyTo,
    bearing,
    zoom,
  };
}
