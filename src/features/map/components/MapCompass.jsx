/**
 * @file MapCompass.jsx
 * @description An animated compass rose that rotates with the map bearing.
 * Clicking it resets the bearing to north (0°).
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMapControls } from "../hooks/useMapControls";

/**
 * MapCompass
 *
 * @param {object} props
 * @param {string} [props.className]
 */
export function MapCompass({ className = "" }) {
  const { bearing, resetBearing } = useMapControls();

  return (
    <button
      onClick={resetBearing}
      className={`
        group relative w-9 h-9 flex items-center justify-center
        bg-card border border-border rounded-lg shadow-md
        text-text-secondary hover:text-text-primary hover:bg-secondary
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
        ${className}
      `}
      aria-label={`Reset map rotation. Current bearing: ${Math.round(bearing)}°`}
      title="Reset North"
    >
      {/* SVG Compass Rose */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        animate={{ rotate: -bearing }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        aria-hidden="true"
      >
        {/* North needle (red) */}
        <polygon
          points="12,3 14,12 12,10 10,12"
          className="fill-danger"
        />
        {/* South needle (muted) */}
        <polygon
          points="12,21 14,12 12,14 10,12"
          className="fill-text-muted/60"
        />
        {/* Center dot */}
        <circle cx="12" cy="12" r="1.5" className="fill-foreground" />
      </motion.svg>

      {/* "N" label fades in on hover */}
      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-danger opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        N
      </span>
    </button>
  );
}

export default MapCompass;
