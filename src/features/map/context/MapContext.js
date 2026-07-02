/**
 * @file MapContext.js
 * @description React context that exposes the live MapLibre GL JS map instance
 * and related state to the entire map feature tree.
 *
 * Consumers use useMapContext() — never access context directly.
 */

"use client";

import { createContext, useContext } from "react";

/**
 * Shape of the context value:
 *
 * map          {maplibregl.Map | null}  — The live MapLibre map instance
 * isLoaded     {boolean}               — True once the map's 'load' event fires
 * isReady      {boolean}               — True once map + tiles are interactive
 * error        {Error | null}          — Non-null when initialization fails
 * mapContainer {React.RefObject}       — Ref to the DOM div holding the map
 */
export const MapContext = createContext({
  map: null,
  isLoaded: false,
  isReady: false,
  error: null,
  mapContainer: null,
});

/**
 * useMapContext
 * Hook to consume the MapContext. Throws a meaningful error if used outside
 * of MapProvider, making misuse immediately obvious during development.
 *
 * @returns {{ map, isLoaded, isReady, error, mapContainer }}
 */
export function useMapContext() {
  const ctx = useContext(MapContext);
  if (ctx === undefined) {
    throw new Error(
      "[useMapContext] Must be used inside a <MapProvider>. " +
        "Wrap your map tree with <MapProvider>."
    );
  }
  return ctx;
}
