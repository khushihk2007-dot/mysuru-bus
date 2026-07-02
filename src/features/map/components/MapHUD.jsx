/**
 * @file MapHUD.jsx
 * @description Heads-Up Display: coordinate readout + zoom level + attribution.
 * Rendered in the bottom-left corner of the map overlay.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMapEvents } from "../hooks/useMapEvents";
import { MapScale } from "./MapScale";

/**
 * MapHUD
 * Shows live lat/lng/zoom coordinates and a graphical scale bar.
 */
export function MapHUD({ className = "" }) {
  const { center, zoom } = useMapEvents();

  return (
    <motion.div
      className={`
        absolute bottom-6 left-4 flex flex-col gap-2 pointer-events-auto
        ${className}
      `}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
    >
      {/* Scale bar */}
      <MapScale />

      {/* Coordinate + zoom readout */}
      <div
        className="
          flex items-center gap-2
          bg-card/85 backdrop-blur-sm border border-border/60
          px-2.5 py-1 rounded-lg shadow-sm
          font-mono text-[10px] text-text-secondary
          select-none pointer-events-none
        "
        aria-label={`Map position: Latitude ${center.lat.toFixed(4)}, Longitude ${center.lng.toFixed(4)}, Zoom ${zoom.toFixed(1)}`}
      >
        <span>{center.lat.toFixed(4)}°N</span>
        <span className="text-border-strong">·</span>
        <span>{center.lng.toFixed(4)}°E</span>
        <span className="text-border-strong">·</span>
        <span>Z{zoom.toFixed(1)}</span>
      </div>

      {/* OSM Attribution */}
      <div
        className="
          text-[9px] text-text-muted
          bg-card/70 backdrop-blur-sm px-2 py-0.5 rounded
          select-none pointer-events-auto
        "
      >
        ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text-secondary transition-colors"
        >
          OpenStreetMap
        </a>{" "}
        contributors
      </div>
    </motion.div>
  );
}

export default MapHUD;
