/**
 * @file useMapLayers.js
 * @description Hook for managing map layer visibility state.
 * Acts as a placeholder for the layer-switcher system.
 * Currently exposes a "vector" baseline and a "traffic" toggle stub.
 *
 * No actual layer data is loaded in this phase.
 */

"use client";

import { useState, useCallback } from "react";

const INITIAL_LAYERS = {
  baseLayer: "osm", // "osm" | "satellite" — placeholder
  traffic: false,   // traffic overlay toggle — placeholder
};

/**
 * useMapLayers
 *
 * @returns {{
 *   layers:          object,
 *   setBaseLayer:    (id: string) => void,
 *   toggleTraffic:   () => void,
 * }}
 */
export function useMapLayers() {
  const [layers, setLayers] = useState(INITIAL_LAYERS);

  const setBaseLayer = useCallback((id) => {
    setLayers((prev) => ({ ...prev, baseLayer: id }));
  }, []);

  const toggleTraffic = useCallback(() => {
    setLayers((prev) => ({ ...prev, traffic: !prev.traffic }));
  }, []);

  return { layers, setBaseLayer, toggleTraffic };
}
