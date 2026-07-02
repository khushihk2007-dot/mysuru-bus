/**
 * @file MapProvider.jsx
 * @description Top-level provider that owns the MapLibre GL JS instance lifecycle.
 * Handles dynamic style switching between Light and Dark CartoDB basemaps.
 *
 * Responsibilities:
 *  - Dynamically import maplibre-gl (client-side only)
 *  - Initialise the map on a ref'd DOM container
 *  - Expose map instance + status via MapContext
 *  - Tear down the map cleanly on unmount
 *  - Switch CartoDB map style dynamically when theme changes
 */

"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { MapContext } from "../context/MapContext";
import { MAP_CONFIG, CARTO_LIGHT_STYLE, CARTO_DARK_STYLE } from "../config/mapConfig";

/**
 * MapProvider
 *
 * @param {object}      props
 * @param {React.node}  props.children     — Component tree that consumes the map
 * @param {string}      [props.theme]      — Current app theme ("light" | "dark")
 * @param {object}      [props.mapOptions] — Override any MAP_CONFIG defaults
 */
export function MapProvider({ children, theme = "light", mapOptions = {} }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // ── Initialise map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // already initialised

    let isMounted = true;

    const initMap = async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;

        if (!isMounted || !containerRef.current) return;

        // Choose initial style matching the initial theme
        const initialStyle = theme === "dark" ? CARTO_DARK_STYLE : CARTO_LIGHT_STYLE;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: initialStyle,
          center: MAP_CONFIG.center,
          zoom: MAP_CONFIG.zoom,
          minZoom: MAP_CONFIG.minZoom,
          maxZoom: MAP_CONFIG.maxZoom,
          bearing: MAP_CONFIG.bearing,
          pitch: MAP_CONFIG.pitch,
          fadeDuration: MAP_CONFIG.fadeDuration,
          attributionControl: false, // we render our own attribution
          ...mapOptions,
        });

        mapRef.current = map;
        setMapInstance(map);

        // ── Map ready states ────────────────────────────────────────────
        map.once("load", () => {
          if (!isMounted) return;
          setIsLoaded(true);
        });

        map.once("idle", () => {
          if (!isMounted) return;
          setIsReady(true);
        });

        // ── Tile error handling ────────────────────────────────────────
        map.on("error", (e) => {
          if (!isMounted) return;
          // Tile errors are non-fatal — only propagate map-init errors
          if (e.error?.status === undefined) {
            console.error("[MapProvider] Map error:", e.error);
            setError(e.error ?? new Error("Unknown map error"));
          }
        });

        // ── Keyboard: allow Tab focus through map ──────────────────────
        map.getCanvas().setAttribute("tabindex", "0");
        map.getCanvas().setAttribute("aria-label", "Interactive transit map");

      } catch (err) {
        if (!isMounted) return;
        console.error("[MapProvider] Initialisation failed:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initMap();

    // ── Cleanup: destroy map on unmount ───────────────────────────────
    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapInstance(null);
      setIsLoaded(false);
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once per mount

  // ── Dynamic Theme/Style switching ───────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;
    const targetStyle = theme === "dark" ? CARTO_DARK_STYLE : CARTO_LIGHT_STYLE;
    mapInstance.setStyle(targetStyle);
  }, [theme, isLoaded, mapInstance]);

  // ── Window resize support ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance) return;
    const handleResize = () => {
      mapInstance.resize();
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [mapInstance]);

  // ── Stable context value (prevent consumer re-renders) ────────────────────
  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded,
      isReady,
      error,
      mapContainer: containerRef,
    }),
    [mapInstance, isLoaded, isReady, error]
  );

  return (
    <MapContext.Provider value={contextValue}>
      {/* The map DOM container — full size, zero children */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
        data-testid="maplibre-container"
      />
      {children}
    </MapContext.Provider>
  );
}

export default MapProvider;
