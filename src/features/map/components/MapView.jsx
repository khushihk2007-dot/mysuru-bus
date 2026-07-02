/**
 * @file MapView.jsx
 * @description The inner map rendering layer.
 *
 * Sits inside the overlay div (absolute inset-0) rendered by MapContainer.
 * Renders MapControls and MapHUD via MapOverlay.
 *
 * No business logic — purely structural composition.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapOverlay } from "./MapOverlay";
import { MapControls } from "./MapControls";
import { MapHUD } from "./MapHUD";

/**
 * MapView
 * Must be rendered inside an absolute-positioned container.
 */
export function MapView() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
    >
      {/* Overlay layer: pointer-events-none wrapper, children re-enable as needed */}
      <MapOverlay>
        {/* Right-side vertical control strip */}
        <MapControls />

        {/* Bottom-left HUD: coordinates + scale + attribution */}
        <MapHUD />
      </MapOverlay>
    </motion.div>
  );
}

export default MapView;
