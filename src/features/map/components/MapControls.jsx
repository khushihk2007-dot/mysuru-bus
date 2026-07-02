/**
 * @file MapControls.jsx  (rewritten — replaces the placeholder version)
 * @description Production-ready floating control panel for the map.
 *
 * Controls included:
 *  - Zoom In / Zoom Out
 *  - Reset View
 *  - Locate Me (placeholder — no GPS logic in this phase)
 *  - Compass (animated, resets bearing)
 *  - Fullscreen toggle
 *  - Layer switcher (placeholder)
 *
 * All controls use pointer-events:auto inside the MapOverlay.
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  RotateCcw,
  Navigation,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useMapControls } from "../hooks/useMapControls";
import { useFullscreen } from "../hooks/useFullscreen";
import { MapCompass } from "./MapCompass";
import { MapLayers } from "./MapLayers";

/** Small pill-shaped tooltip shown on hover */
function Tooltip({ label }) {
  return (
    <span
      className="
        absolute right-11 whitespace-nowrap
        bg-foreground/90 text-background text-[10px] font-medium
        px-2 py-0.5 rounded-md shadow pointer-events-none
        opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50
      "
    >
      {label}
    </span>
  );
}

/** Single icon control button */
function ControlButton({ icon: Icon, label, onClick, active = false, danger = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`
        group relative flex items-center justify-center w-9 h-9
        border-b border-border/50 last:border-b-0
        transition-colors duration-100
        focus:outline-none focus:ring-1 focus:ring-ring
        ${active
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : danger
            ? "text-danger hover:bg-danger/10"
            : "text-text-secondary hover:bg-secondary hover:text-text-primary"
        }
      `}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <Tooltip label={label} />
    </button>
  );
}

/**
 * MapControls
 *
 * @param {object} props
 * @param {React.RefObject} props.fullscreenTargetRef — ref on the element to fullscreen
 */
export function MapControls({ fullscreenTargetRef }) {
  const { zoomIn, zoomOut, resetView } = useMapControls();
  const { isFullscreen, toggleFullscreen, ref: fsRef } = useFullscreen();
  const [isLocating, setIsLocating] = useState(false);

  // Wire fullscreen ref to the provided target ref
  // We pass fsRef to the MapView which owns the wrapper div via MapContainer
  // For this component we just call toggleFullscreen — the ref is attached in MapView.

  const handleLocate = () => {
    // Placeholder — GPS integration added in a future phase
    setIsLocating((p) => !p);
  };

  return (
    <motion.div
      className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      aria-label="Map controls"
    >
      {/* Group 1: Zoom */}
      <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden flex flex-col">
        <ControlButton icon={Plus}    label="Zoom in"  onClick={zoomIn} />
        <ControlButton icon={Minus}   label="Zoom out" onClick={zoomOut} />
        <ControlButton icon={RotateCcw} label="Reset view" onClick={resetView} />
      </div>

      {/* Compass — standalone */}
      <MapCompass />

      {/* Group 2: Navigation utilities */}
      <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden flex flex-col">
        <ControlButton
          icon={Navigation}
          label={isLocating ? "Locating…" : "Locate me (coming soon)"}
          onClick={handleLocate}
          active={isLocating}
        />
        <ControlButton
          icon={isFullscreen ? Minimize2 : Maximize2}
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
        />
      </div>

      {/* Layer switcher */}
      <MapLayers />
    </motion.div>
  );
}

export default MapControls;
