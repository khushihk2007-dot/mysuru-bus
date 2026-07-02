/**
 * @file useMap.js
 * @description Primary hook — returns the MapLibre GL JS map instance
 * and its current lifecycle status.
 *
 * Usage:
 *   const { map, isLoaded, isReady, error } = useMap();
 */

"use client";

import { useMapContext } from "../context/MapContext";

/**
 * useMap
 * Returns the live MapLibre map instance and its status.
 *
 * @returns {{
 *   map: import('maplibre-gl').Map | null,
 *   isLoaded: boolean,
 *   isReady: boolean,
 *   error: Error | null,
 * }}
 */
export function useMap() {
  const { map, isLoaded, isReady, error } = useMapContext();
  return { map, isLoaded, isReady, error };
}
