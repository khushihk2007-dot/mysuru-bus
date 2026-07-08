/**
 * src/features/map/components/AnimatedBusMarker.jsx
 *
 * Renders a live bus on the MapLibre map as a custom DOM element.
 *
 * Architecture
 * ─────────────────────────────────────────────────────────────
 * MapLibre Marker
 *   └─ React Portal → outer motion.div (Framer Motion)
 *         ├─ Info popup  [upright, appears above the icon]
 *         └─ icon wrapper div [rotates via CSS transition — no React re-render]
 *               └─ BusIcon SVG
 *
 * Position / heading updates are applied IMPERATIVELY inside a requestAnimationFrame
 * loop so they NEVER trigger React renders (60 fps smooth movement).
 *
 * Framer Motion handles only:
 *   • entrance  → scale 0.7→1, opacity 0→1
 *   • exit       → scale 0.8→0, opacity 1→0
 *   • selection → scale 1→1.15 spring
 */

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMap } from "@/features/map";
import maplibregl from "maplibre-gl";
import { BusIcon } from "./BusIcon";
import { getHaversineDistance } from "../utils/distance";
import { getBearing } from "../utils/heading";
import { lerp, interpolateAngle } from "../utils/interpolation";

// ─── Route colour palette (mirrors TransitContext) ───────────────────────────
const ROUTE_COLORS = {
  "119": "#EF4444",
  r119: "#EF4444",
  "201": "#3B82F6",
  r201: "#3B82F6",
  "80": "#10B981",
  r80: "#10B981",
};
const DEFAULT_COLOR = "#6366F1";

function getRouteColor(routeId) {
  return ROUTE_COLORS[routeId] ?? DEFAULT_COLOR;
}

// ─── Framer Motion variant presets ───────────────────────────────────────────
const OUTER_VARIANTS = {
  enter: { scale: 0.7, opacity: 0 },
  active: { scale: 1, opacity: 1 },
  selected: { scale: 1.15, opacity: 1 },
  exiting: { scale: 0.8, opacity: 0 },
};

const POPUP_VARIANTS = {
  hidden: { opacity: 0, y: 5, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

// ─── Status helper ────────────────────────────────────────────────────────────
function getStatusLabel(bus) {
  const s = bus.status;
  if (!s || !s.state) return { label: "ONLINE", color: "#94a3b8" };
  if (s.state === "LATE")
    return { label: `LATE  ${s.delayMinutes}m`, color: "#f87171" };
  if (s.state === "EARLY")
    return { label: `EARLY  ${Math.abs(s.delayMinutes)}m`, color: "#34d399" };
  if (s.state === "ON_TIME") return { label: "ON TIME", color: "#34d399" };
  if (s.state === "UNKNOWN") return { label: "UNKNOWN", color: "#94a3b8" };
  return { label: s.state, color: "#94a3b8" };
}

// ─── Component ────────────────────────────────────────────────────────────────
export const AnimatedBusMarker = React.memo(
  function AnimatedBusMarker({
    bus,
    prevBus,
    status,          // "entering" | "active" | "exiting"
    onExitComplete,
    isSelected,
    onSelect,
  }) {
    const { map } = useMap();

    // MapLibre requires a real DOM node — created once, never re-created
    const [element] = useState(() => {
      const el = document.createElement("div");
      el.style.cssText = "position:absolute;pointer-events:none;";
      return el;
    });

    const markerRef   = useRef(null);   // MapLibre Marker instance
    const iconWrapRef = useRef(null);   // The div that rotates (direct DOM writes)
    const rafIdRef    = useRef(null);   // rAF handle for the position loop
    const animRef     = useRef(null);   // Current in-flight animation state

    // Mutable refs — shared with the rAF loop; never trigger React renders
    const coordsRef   = useRef({ lat: null, lng: null });  // current interpolated position
    const headingRef  = useRef(0);                          // current interpolated heading (deg)
    const targetRef   = useRef({ lat: null, lng: null });   // destination from latest API update

    // ── Extract target coordinates safely ─────────────────────────────────
    const targetLat =
      typeof bus.latitude === "number" ? bus.latitude : bus.position?.latitude;
    const targetLng =
      typeof bus.longitude === "number" ? bus.longitude : bus.position?.longitude;

    const hasCoords =
      typeof targetLat === "number" && typeof targetLng === "number";

    const routeColor = getRouteColor(bus.routeId);

    // ── 1. Mount MapLibre Marker (once) ───────────────────────────────────
    useEffect(() => {
      if (!map || !hasCoords) return;

      const initLat = targetLat;
      const initLng = targetLng;

      coordsRef.current = { lat: initLat, lng: initLng };
      targetRef.current = { lat: initLat, lng: initLng };

      const marker = new maplibregl.Marker({
        element,
        anchor: "center",         // we center the marker on the bus body
      })
        .setLngLat([initLng, initLat])
        .addTo(map);

      markerRef.current = marker;

      // Seed initial heading from prevBus if available
      if (prevBus) {
        const pLat =
          typeof prevBus.latitude === "number"
            ? prevBus.latitude
            : prevBus.position?.latitude;
        const pLng =
          typeof prevBus.longitude === "number"
            ? prevBus.longitude
            : prevBus.position?.longitude;
        if (typeof pLat === "number" && typeof pLng === "number") {
          const d = getHaversineDistance(pLat, pLng, initLat, initLng);
          if (d > 3) {
            const b = getBearing(pLat, pLng, initLat, initLng);
            headingRef.current = b;
            applyIconRotation(b, false); // snap, no transition
          }
        }
      }

      return () => {
        marker.remove();
        markerRef.current = null;
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, element]);

    // ── 2. Z-index sync ──────────────────────────────────────────────────
    useEffect(() => {
      if (element) {
        element.style.zIndex = isSelected ? "50" : "10";
      }
    }, [isSelected, element]);

    // ── 3. Smooth position + heading interpolation ────────────────────────
    useEffect(() => {
      if (!hasCoords || !markerRef.current) return;

      const prevLat = targetRef.current.lat;
      const prevLng = targetRef.current.lng;

      // First arrival after mount — teleport straight to position
      if (prevLat === null || prevLng === null) {
        targetRef.current  = { lat: targetLat, lng: targetLng };
        coordsRef.current  = { lat: targetLat, lng: targetLng };
        markerRef.current.setLngLat([targetLng, targetLat]);
        return;
      }

      // Nothing changed — skip
      if (prevLat === targetLat && prevLng === targetLng) return;

      // Compute new bearing only when movement is meaningful (> 5 m)
      const dist = getHaversineDistance(prevLat, prevLng, targetLat, targetLng);
      const newBearing = dist > 5
        ? getBearing(prevLat, prevLng, targetLat, targetLng)
        : headingRef.current;

      // Store destination
      targetRef.current = { lat: targetLat, lng: targetLng };

      // Kick off a new rAF animation (or replace the in-flight one)
      animRef.current = {
        startLat:     coordsRef.current.lat,
        startLng:     coordsRef.current.lng,
        endLat:       targetLat,
        endLng:       targetLng,
        startBearing: headingRef.current,
        endBearing:   newBearing,
        startTime:    performance.now(),
        duration:     4800, // spread across full 5-second polling window
      };

      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetLat, targetLng]);

    // ── rAF tick (closure over refs — zero React involvement) ─────────────
    const tick = useCallback(() => {
      const anim = animRef.current;
      if (!anim || !markerRef.current) {
        rafIdRef.current = null;
        return;
      }

      const elapsed = performance.now() - anim.startTime;
      const t = Math.min(elapsed / anim.duration, 1);

      // Ease-out cubic for a natural deceleration feel
      const ease = 1 - Math.pow(1 - t, 3);

      const lat = lerp(anim.startLat, anim.endLat, ease);
      const lng = lerp(anim.startLng, anim.endLng, ease);
      const bearing = interpolateAngle(anim.startBearing, anim.endBearing, ease);

      coordsRef.current   = { lat, lng };
      headingRef.current  = bearing;

      // Imperatively move the MapLibre marker
      markerRef.current.setLngLat([lng, lat]);

      // Imperatively rotate the icon wrapper — GPU composited, ~0 cost
      applyIconRotation(bearing, true);

      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
        animRef.current  = null;
      }
    }, []); // stable — reads only refs

    // ── Helper: write CSS transform directly to the icon wrapper DOM node ──
    function applyIconRotation(deg, smooth) {
      if (!iconWrapRef.current) return;
      iconWrapRef.current.style.transition = smooth
        ? "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        : "none";
      // translate3d forces GPU layer; rotate around icon centre
      iconWrapRef.current.style.transform =
        `translate3d(0,0,0) rotate(${deg}deg)`;
    }

    if (!hasCoords) return null;

    const routeNum = bus.routeId || "BUS";
    const regNum   = bus.registrationNumber || "KA-XX-XXXX";
    const { label: statusLabel, color: statusColor } = getStatusLabel(bus);

    // Map status string → Framer variant
    const animVariant =
      status === "exiting"
        ? "exiting"
        : isSelected
        ? "selected"
        : "active";

    // Icon size: base 36 px
    const iconSize = isSelected ? 42 : 36;

    return createPortal(
      <motion.div
        /* ── outer wrapper — Framer owns scale + opacity only ── */
        variants={OUTER_VARIANTS}
        initial="enter"
        animate={animVariant}
        exit="exiting"
        transition={{
          opacity:  { duration: 0.28, ease: "easeOut" },
          scale:    { type: "spring", stiffness: 300, damping: 22 },
        }}
        onAnimationComplete={(def) => {
          if (def === "exiting" && onExitComplete) onExitComplete(bus.id);
        }}
        onClick={onSelect}
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          pointerEvents:  "auto",
          cursor:         "pointer",
          userSelect:     "none",
          transformOrigin:"center bottom",
          // GPU hint for the outer layer
          willChange:     "transform, opacity",
        }}
      >
        {/* ── Info popup (always upright — NOT inside the rotating wrapper) ── */}
        <AnimatePresence>
          <motion.div
            key="popup"
            variants={POPUP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              marginBottom: 4,
              padding:      "5px 8px",
              borderRadius: 8,
              background:   "rgba(2, 6, 23, 0.92)",
              border:       `1px solid ${isSelected ? routeColor : "rgba(51,65,85,0.8)"}`,
              backdropFilter: "blur(6px)",
              boxShadow:    isSelected
                ? `0 0 0 1px ${routeColor}44, 0 4px 20px ${routeColor}33`
                : "0 2px 12px rgba(0,0,0,0.4)",
              display:      "flex",
              flexDirection:"column",
              alignItems:   "center",
              gap:          2,
              minWidth:     64,
              whiteSpace:   "nowrap",
              pointerEvents:"none",
            }}
          >
            {/* Route badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 7, height: 7,
                  borderRadius: "50%",
                  background: routeColor,
                  boxShadow: `0 0 5px ${routeColor}`,
                  flexShrink: 0,
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span style={{
                fontFamily:  "ui-monospace, monospace",
                fontSize:    12,
                fontWeight:  700,
                color:       routeColor,
                letterSpacing: "0.04em",
              }}>
                {routeNum}
              </span>
            </div>

            {/* Registration plate */}
            <span style={{
              fontFamily:  "ui-monospace, monospace",
              fontSize:    9.5,
              fontWeight:  500,
              color:       "#cbd5e1",
              letterSpacing: "0.06em",
            }}>
              {regNum}
            </span>

            {/* Status pill */}
            <span style={{
              fontFamily:    "ui-monospace, monospace",
              fontSize:      7.5,
              fontWeight:    700,
              color:         statusColor,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              opacity:       0.9,
            }}>
              {statusLabel}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* ── Connector stem ── */}
        <div style={{
          width:      1.5,
          height:     6,
          background: `linear-gradient(to bottom, ${routeColor}88, transparent)`,
          borderRadius: 1,
        }} />

        {/* ── Rotating icon wrapper ── */}
        {/* translate3d + rotate are GPU-composited; the ref is written imperatively */}
        <div
          ref={iconWrapRef}
          className="bus-icon-wrap"
          style={{
            transform:     `translate3d(0,0,0) rotate(${headingRef.current}deg)`,
            willChange:    "transform",
            position:      "relative",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"center",
          }}
        >
          {/* Outer selection / hover ring */}
          {isSelected && (
            <motion.div
              animate={{
                scale:   [1, 1.4, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position:     "absolute",
                inset:        -6,
                borderRadius: "50%",
                border:       `1.5px solid ${routeColor}`,
                pointerEvents:"none",
              }}
            />
          )}

          <BusIcon
            color={routeColor}
            size={iconSize}
            isSelected={isSelected}
          />
        </div>
      </motion.div>,
      element
    );
  },

  // ── Custom memo comparator — bail out of render when nothing visual changed ──
  (prev, next) =>
    prev.status       === next.status       &&
    prev.isSelected   === next.isSelected   &&
    prev.bus.id       === next.bus.id       &&
    prev.bus.routeId  === next.bus.routeId  &&
    // Coordinates: trigger re-render so the useEffect fires and starts a new rAF
    prev.bus.latitude              === next.bus.latitude              &&
    prev.bus.longitude             === next.bus.longitude             &&
    prev.bus.position?.latitude    === next.bus.position?.latitude    &&
    prev.bus.position?.longitude   === next.bus.position?.longitude   &&
    prev.bus.status?.state         === next.bus.status?.state         &&
    prev.bus.status?.delayMinutes  === next.bus.status?.delayMinutes
);

export default AnimatedBusMarker;
