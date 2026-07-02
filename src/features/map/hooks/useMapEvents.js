/**
 * @file useMapEvents.js
 * @description Hook for subscribing to MapLibre GL JS map events.
 *
 * Handles event registration and cleanup automatically.
 * Provides live map position state (center, zoom, bearing, pitch).
 *
 * Usage:
 *   const { center, zoom, bearing, pitch } = useMapEvents();
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useMap } from "./useMap";
import { MYSURU_CENTER } from "../config/mapConfig";

/**
 * useMapEvents
 *
 * @returns {{
 *   center:  { lat: number, lng: number },
 *   zoom:    number,
 *   bearing: number,
 *   pitch:   number,
 *   on:      (event: string, handler: function) => () => void,
 * }}
 */
export function useMapEvents() {
  const { map, isReady } = useMap();

  const [center, setCenter] = useState({ lat: MYSURU_CENTER[1], lng: MYSURU_CENTER[0] });
  const [zoom, setZoom] = useState(13);
  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);

  // ── Sync live position state ─────────────────────────────────────────
  useEffect(() => {
    if (!map || !isReady) return;

    const syncState = () => {
      const c = map.getCenter();
      setCenter({ lat: c.lat, lng: c.lng });
      setZoom(map.getZoom());
      setBearing(map.getBearing());
      setPitch(map.getPitch());
    };

    map.on("move", syncState);
    map.on("zoom", syncState);
    map.on("rotate", syncState);
    map.on("pitch", syncState);

    // seed initial values
    syncState();

    return () => {
      map.off("move", syncState);
      map.off("zoom", syncState);
      map.off("rotate", syncState);
      map.off("pitch", syncState);
    };
  }, [map, isReady]);

  /**
   * on — Subscribe to a raw MapLibre event.
   * Returns an unsubscribe function for cleanup in useEffect.
   *
   * @param {string}   eventName
   * @param {function} handler
   * @returns {function} unsubscribe
   */
  const on = useCallback(
    (eventName, handler) => {
      if (!map) return () => {};
      map.on(eventName, handler);
      return () => map.off(eventName, handler);
    },
    [map]
  );

  return { center, zoom, bearing, pitch, on };
}
