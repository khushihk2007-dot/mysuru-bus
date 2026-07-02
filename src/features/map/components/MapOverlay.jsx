/**
 * @file MapOverlay.jsx
 * @description Container for floating UI elements rendered on top of the map.
 * Establishes the correct stacking context for all overlaid controls.
 * No business logic — purely structural / layout.
 */

"use client";

import React from "react";

/**
 * MapOverlay
 * Renders children in an absolutely-positioned layer on top of the map canvas.
 * Uses pointer-events:none on the wrapper so the map canvas remains interactive
 * except where child elements restore pointer events.
 *
 * @param {object}     props
 * @param {React.node} props.children
 * @param {string}     [props.className]
 */
export function MapOverlay({ children, className = "" }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-30 ${className}`}
      aria-hidden="false"
      data-testid="map-overlay"
    >
      {children}
    </div>
  );
}

export default MapOverlay;
