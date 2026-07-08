/**
 * @file MapContainer.jsx
 * @description Root map component consumed by AppShell.
 * Wire up the GIS Transit layers to render polylines and stops dynamically.
 */

"use client";

import React from "react";
import { MapProvider } from "../providers/MapProvider";
import { MapView } from "./MapView";
import { MapLoading } from "./MapLoading";
import { MapError } from "./MapError";
import { FloatingSearch } from "@/shared/components/layout/FloatingSearch";
import { BottomActivityBar } from "@/shared/components/layout/BottomActivityBar";
import { TransitLayers } from "@/features/transit/components/TransitLayers";
import { BusLayer } from "./BusLayer";
import { useMapContext } from "../context/MapContext";
import { zIndex } from "@/design/zIndex";

/**
 * MapInner — consumes MapContext (must be inside MapProvider).
 * Renders in an absolute-positioned div so overlay children can position
 * themselves relative to the full map canvas area.
 */
function MapInner({ setActiveItem, theme = "light" }) {
  const { isReady, error } = useMapContext();

  return (
    /* Overlay root: sits on top of the MapLibre canvas, full coverage */
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Floating search bar — pointer events re-enabled on the component itself */}
      <div className="pointer-events-auto">
        <FloatingSearch />
      </div>

      {/* MapView: overlay controls + HUD (handles its own pointer-events) */}
      <MapView />

      {/* Transit Map Layers (Polylines, stops, and selection rings) */}
      {isReady && !error && (
        <>
          <TransitLayers theme={theme} onSelectStop={setActiveItem} />
          <BusLayer />
        </>
      )}

      {/* Bottom activity bar */}
      <div className="pointer-events-auto">
        <BottomActivityBar />
      </div>

      {/* Loading screen — pointer events needed to block interaction while loading */}
      <MapLoading visible={!isReady && !error} />

      {/* Error screen */}
      {error && (
        <div className="pointer-events-auto">
          <MapError
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}
    </div>
  );
}

/**
 * MapContainer
 * Public API — used directly in AppShell.
 *
 * @param {object}   props
 * @param {function} [props.setActiveItem] — Callback to activate the right panel
 * @param {string}   [props.theme]         — Current application theme ("light" | "dark")
 */
export function MapContainer({ setActiveItem, theme = "light" }) {
  return (
    <div
      className={`relative flex-1 h-full overflow-hidden select-none ${zIndex.cards}`}
      aria-label="Interactive transit map"
      role="region"
    >
      {/* MapProvider owns the map DOM mount point and the MapLibre lifecycle */}
      <MapProvider theme={theme}>
        <MapInner setActiveItem={setActiveItem} theme={theme} />
      </MapProvider>
    </div>
  );
}

export default MapContainer;
