/**
 * @file MapScale.jsx
 * @description Displays a dynamic graphical scale bar that updates as the
 * map is zoomed. Reads live zoom from useMapEvents.
 *
 * Scale calculation uses the latitude of the map center for accuracy.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useMap } from "../hooks/useMap";

/** Returns a human-readable scale label and bar width (px) for a given zoom + lat */
function computeScale(map) {
  if (!map) return { label: "—", widthPx: 56 };

  const center = map.getCenter();
  const zoom = map.getZoom();

  // Metres per pixel at current zoom & latitude
  const metersPerPixel =
    (156543.03392 * Math.cos((center.lat * Math.PI) / 180)) /
    Math.pow(2, zoom);

  // Target bar width ~80px, round to a nice number
  const targetMeters = metersPerPixel * 80;

  // Nice round numbers (m and km)
  const niceValues = [
    1, 2, 5, 10, 20, 50, 100, 200, 500,
    1000, 2000, 5000, 10000, 20000, 50000, 100000,
  ];

  const nice = niceValues.find((v) => v >= targetMeters) ?? niceValues.at(-1);
  const widthPx = Math.round(nice / metersPerPixel);

  const label =
    nice >= 1000 ? `${nice / 1000} km` : `${nice} m`;

  return { label, widthPx: Math.max(32, Math.min(widthPx, 120)) };
}

/**
 * MapScale
 * Renders a live graphical scale bar in the bottom-left corner of the map.
 */
export function MapScale({ className = "" }) {
  const { map, isReady } = useMap();
  const [scale, setScale] = useState({ label: "—", widthPx: 56 });

  useEffect(() => {
    if (!map || !isReady) return;

    const update = () => setScale(computeScale(map));
    update(); // seed

    map.on("zoom", update);
    map.on("move", update);
    return () => {
      map.off("zoom", update);
      map.off("move", update);
    };
  }, [map, isReady]);

  return (
    <div
      className={`flex flex-col items-start select-none ${className}`}
      aria-label={`Map scale: ${scale.label}`}
      title={`Map scale: ${scale.label}`}
    >
      <span className="font-mono text-[10px] text-text-secondary font-medium leading-none mb-1">
        {scale.label}
      </span>
      <div
        className="h-[5px] border-l-2 border-r-2 border-b-2 border-text-secondary/70 transition-all duration-300"
        style={{ width: scale.widthPx }}
      />
    </div>
  );
}

export default MapScale;
