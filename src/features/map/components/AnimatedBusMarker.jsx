/**
 * src/features/map/components/AnimatedBusMarker.jsx
 *
 * High-performance animated bus marker on MapLibre.
 * - Interpolates position in WGS-84 coordinates on requestAnimationFrame.
 * - Computes and animates travel direction (heading) smoothly.
 * - Utilizes Framer Motion for entrance, exit, hover, and selection pulse/glow effects.
 * - Employs React.memo to prevent unnecessary React renders.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useMap } from "@/features/map";
import maplibregl from "maplibre-gl";
import { getHaversineDistance } from "../utils/distance";
import { getBearing } from "../utils/heading";
import { lerp, interpolateAngle } from "../utils/interpolation";

export const AnimatedBusMarker = React.memo(
  function AnimatedBusMarker({
    bus,
    prevBus,
    status,
    onExitComplete,
    isSelected,
    onSelect,
  }) {
    const { map } = useMap();
    const [element] = useState(() => {
      const div = document.createElement("div");
      div.style.position = "absolute";
      return div;
    });

    const markerRef = useRef(null);
    const iconRef = useRef(null);
    const rafIdRef = useRef(null);
    const animationRef = useRef(null);

    // Extract coordinates safely
    const targetLat = typeof bus.latitude === "number" ? bus.latitude : bus.position?.latitude;
    const targetLng = typeof bus.longitude === "number" ? bus.longitude : bus.position?.longitude;

    // Track last coords and heading
    const currentCoordsRef = useRef({ lat: targetLat, lng: targetLng });
    const lastTargetRef = useRef({ lat: null, lng: null });

    // Initial heading: fallback to 0 (North) if we don't have movement direction yet
    const currentHeadingRef = useRef(0);

    // 1. Sync MapLibre marker lifecycle
    useEffect(() => {
      if (!map || typeof targetLat !== "number" || typeof targetLng !== "number") return;

      const marker = new maplibregl.Marker({ element })
        .setLngLat([targetLng, targetLat])
        .addTo(map);

      markerRef.current = marker;
      element.style.zIndex = isSelected ? "50" : "10";

      return () => {
        marker.remove();
        markerRef.current = null;
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, element]);

    // 2. Sync zIndex layering
    useEffect(() => {
      if (markerRef.current) {
        element.style.zIndex = isSelected ? "50" : "10";
      }
    }, [isSelected, element]);

    // 3. Coordinate updates and smooth interpolation
    useEffect(() => {
      if (typeof targetLat !== "number" || typeof targetLng !== "number") return;

      const prevLat = lastTargetRef.current.lat;
      const prevLng = lastTargetRef.current.lng;

      // Handle initial load
      if (prevLat === null || prevLng === null) {
        lastTargetRef.current = { lat: targetLat, lng: targetLng };
        currentCoordsRef.current = { lat: targetLat, lng: targetLng };

        // Try to derive initial heading from previous telemetry if provided
        if (prevBus) {
          const pLat = typeof prevBus.latitude === "number" ? prevBus.latitude : prevBus.position?.latitude;
          const pLng = typeof prevBus.longitude === "number" ? prevBus.longitude : prevBus.position?.longitude;
          if (typeof pLat === "number" && typeof pLng === "number") {
            const dist = getHaversineDistance(pLat, pLng, targetLat, targetLng);
            if (dist > 3) {
              const b = getBearing(pLat, pLng, targetLat, targetLng);
              currentHeadingRef.current = b;
              if (iconRef.current) {
                iconRef.current.style.transform = `rotate(${b}deg)`;
              }
            }
          }
        }

        if (markerRef.current) {
          markerRef.current.setLngLat([targetLng, targetLat]);
        }
        return;
      }

      // Skip interpolation if position is identical
      if (prevLat === targetLat && prevLng === targetLng) return;

      // Compute heading if movement is significant (e.g. > 3 meters)
      const dist = getHaversineDistance(prevLat, prevLng, targetLat, targetLng);
      let newBearing = currentHeadingRef.current;
      if (dist > 3) {
        newBearing = getBearing(prevLat, prevLng, targetLat, targetLng);
      }

      // Configure transition state: interpolate over 4.8 seconds (giving 200ms buffer for 5s polling cycle)
      animationRef.current = {
        startLat: currentCoordsRef.current.lat,
        startLng: currentCoordsRef.current.lng,
        endLat: targetLat,
        endLng: targetLng,
        startBearing: currentHeadingRef.current,
        endBearing: newBearing,
        startTime: performance.now(),
        duration: 4800,
      };

      lastTargetRef.current = { lat: targetLat, lng: targetLng };

      // Interpolation animation frame loop
      if (!rafIdRef.current) {
        const tick = () => {
          const anim = animationRef.current;
          if (!anim) {
            rafIdRef.current = null;
            return;
          }

          const now = performance.now();
          const elapsed = now - anim.startTime;
          const t = Math.min(elapsed / anim.duration, 1);

          // Linear interpolation for coordinate positions
          const currentLng = lerp(anim.startLng, anim.endLng, t);
          const currentLat = lerp(anim.startLat, anim.endLat, t);

          // Shortest-path angle interpolation for heading rotation
          const currentBearing = interpolateAngle(anim.startBearing, anim.endBearing, t);

          currentCoordsRef.current = { lat: currentLat, lng: currentLng };
          currentHeadingRef.current = currentBearing;

          if (markerRef.current) {
            markerRef.current.setLngLat([currentLng, currentLat]);
          }

          if (iconRef.current) {
            iconRef.current.style.transform = `rotate(${currentBearing}deg)`;
          }

          if (t < 1) {
            rafIdRef.current = requestAnimationFrame(tick);
          } else {
            rafIdRef.current = null;
          }
        };
        rafIdRef.current = requestAnimationFrame(tick);
      }
    }, [targetLat, targetLng, prevBus]);

    if (typeof targetLat !== "number" || typeof targetLng !== "number") {
      return null;
    }

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
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          status === "exiting"
            ? { scale: 0.7, opacity: 0 }
            : {
                scale: isSelected ? 1.12 : 1,
                opacity: 1,
              }
        }
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onAnimationComplete={() => {
          if (status === "exiting" && onExitComplete) {
            onExitComplete(bus.id);
          }
        }}
        onClick={onSelect}
        className={`flex flex-col items-center pointer-events-auto select-none cursor-pointer origin-bottom ${
          isSelected ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" : ""
        }`}
      >
        {/* Label Display Card */}
        <div className="flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-slate-950/95 border border-slate-800 text-white font-mono text-[9px] leading-tight shadow-xl hover:border-emerald-500/40 transition-colors duration-150">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[11px] text-emerald-400">{routeNum}</span>
          </div>
          <div className="text-slate-300 font-medium mt-0.5">{regNum}</div>
          <div className="text-[7.5px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
            {statusText}
          </div>
        </div>

        {/* Small connector vertical line */}
        <div className="w-0.5 h-1.5 bg-slate-800" />

        {/* Directional rotating indicator */}
        <div className="relative flex items-center justify-center">
          {/* Animated pulse ring */}
          <motion.div
            animate={{
              scale: [1, 1.45, 1],
              opacity: [0.45, 0, 0.45],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-6 h-6 rounded-full bg-emerald-500/35 pointer-events-none"
          />

          <div
            ref={iconRef}
            className="w-6 h-6 rounded-full bg-emerald-500 border border-slate-950 flex items-center justify-center shadow-lg"
            style={{ transform: `rotate(${currentHeadingRef.current}deg)` }}
          >
            {/* Navigational direction arrow pointing UP (0 deg) */}
            <svg
              className="w-3 h-3 text-slate-950 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
        </div>
      </motion.div>,
      element
    );
  },
  (prevProps, nextProps) => {
    // Optimize performance: prevent rerendering unless core properties change
    return (
      prevProps.status === nextProps.status &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.bus.id === nextProps.bus.id &&
      prevProps.bus.latitude === nextProps.bus.latitude &&
      prevProps.bus.longitude === nextProps.bus.longitude &&
      prevProps.bus.position?.latitude === nextProps.bus.position?.latitude &&
      prevProps.bus.position?.longitude === nextProps.bus.position?.longitude &&
      prevProps.bus.status?.state === nextProps.bus.status?.state &&
      prevProps.bus.status?.delayMinutes === nextProps.bus.status?.delayMinutes
    );
  }
);

export default AnimatedBusMarker;
