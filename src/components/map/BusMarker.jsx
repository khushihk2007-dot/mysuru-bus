"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "@/features/map";
import maplibregl from "maplibre-gl";

/**
 * BusMarker
 * Renders a live bus marker on the MapLibre map using a React Portal.
 *
 * @param {object} props
 * @param {object} props.bus - Mapped live bus object from the API.
 */
export function BusMarker({ bus }) {
  const { map } = useMap();
  const [element] = useState(() => {
    const div = document.createElement("div");
    // Ensure element doesn't capture map pointer events unless desired
    div.style.position = "absolute";
    return div;
  });
  const markerRef = useRef(null);

  const lat = typeof bus.latitude === "number" ? bus.latitude : bus.position?.latitude;
  const lng = typeof bus.longitude === "number" ? bus.longitude : bus.position?.longitude;

  // Sync MapLibre marker lifecycle
  useEffect(() => {
    if (!map || typeof lat !== "number" || typeof lng !== "number") return;

    const marker = new maplibregl.Marker({ element })
      .setLngLat([lng, lat])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, element, lat, lng]);

  // Sync position updates
  useEffect(() => {
    if (markerRef.current && typeof lat === "number" && typeof lng === "number") {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [lat, lng]);

  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  // Display fields required: Route Number, Vehicle Registration, Status
  const routeNum = bus.routeId || "BUS";
  const regNum = bus.registrationNumber || "KA-XX-XXXX";
  
  let statusText = "ON TIME";
  if (bus.status) {
    const delay = bus.status.delayMinutes;
    if (bus.status.state === "LATE") {
      statusText = `LATE (${delay}m)`;
    } else if (bus.status.state === "EARLY") {
      statusText = `EARLY (${Math.abs(delay)}m)`;
    } else if (bus.status.state) {
      statusText = bus.status.state;
    }
  }

  return createPortal(
    <div className="flex flex-col items-center pointer-events-auto">
      {/* Sleek, premium dark card layout */}
      <div className="flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-slate-950/95 border border-slate-800 text-white font-mono text-[9px] leading-tight shadow-xl hover:scale-105 hover:border-emerald-500/50 transition-all duration-150">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[11px] text-emerald-400">{routeNum}</span>
        </div>
        <div className="text-slate-300 font-medium mt-0.5">{regNum}</div>
        <div className="text-[7.5px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
          {statusText}
        </div>
      </div>
      {/* Anchor arrow pointing down */}
      <div className="w-2 h-2 bg-slate-950/95 border-r border-b border-slate-800 transform rotate-45 -mt-1 shadow-md" />
    </div>,
    element
  );
}

export default BusMarker;
