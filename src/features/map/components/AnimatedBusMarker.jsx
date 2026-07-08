/**
 * src/features/map/components/AnimatedBusMarker.jsx
 *
 * Renders a single live bus on the MapLibre map.
 *
 * Layout (matches Phase 8.1 mockup)
 * ──────────────────────────────────────────────────────
 *  ┌──────────────────────┐   ← Info popup (always upright)
 *  │  ● 119               │
 *  │  KA55F-5678          │
 *  │  Moving    38 km/h   │
 *  └──────────────────────┘
 *          │               ← thin stem
 *     [BUS ICON]           ← rotates to GPS bearing via CSS transition
 *
 * Position interpolation runs in a requestAnimationFrame loop writing
 * directly to refs — zero React renders per frame, 60 fps.
 *
 * Framer Motion handles:
 *   • entrance  → scale 0.7→1, opacity 0→1
 *   • exit      → scale 0.8→0, opacity 1→0
 *   • selection → spring scale bump
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

// ─── Route colours (must match TransitContext + BusLayer) ────────────────────
const ROUTE_COLORS = {
  "119":  "#EF4444",   // red
  r119:   "#EF4444",
  "201":  "#3B82F6",   // blue
  r201:   "#3B82F6",
  "80":   "#10B981",   // green
  r80:    "#10B981",
  "202":  "#8B5CF6",   // purple
  r202:   "#8B5CF6",
};
const DEFAULT_COLOR = "#6366F1";

function getRouteColor(routeId) {
  return ROUTE_COLORS[routeId] ?? DEFAULT_COLOR;
}

// ─── Derive status info from bus data ────────────────────────────────────────
function getStatusInfo(bus) {
  const s = bus.status;
  if (!s || !s.state || s.state === "UNKNOWN") {
    return { label: "Unknown", color: "#94a3b8", dot: "#94a3b8" };
  }
  if (s.state === "LATE") {
    const mins = Math.abs(s.delayMinutes ?? 0);
    return { label: `Delayed by ${mins} min`, color: "#f87171", dot: "#ef4444" };
  }
  if (s.state === "EARLY") {
    return { label: "Moving", color: "#34d399", dot: "#10b981" };
  }
  if (s.state === "ON_TIME") {
    return { label: "Moving", color: "#34d399", dot: "#10b981" };
  }
  // Fallback
  return { label: s.state, color: "#94a3b8", dot: "#94a3b8" };
}

// Speed from bus.speed (km/h) — may be null / 0
function getSpeedLabel(bus) {
  const spd = bus.speed;
  if (typeof spd !== "number" || spd <= 0) return null;
  return `${Math.round(spd)} km/h`;
}

// ─── Framer Motion variants ───────────────────────────────────────────────────
const OUTER_VARIANTS = {
  enter:   { scale: 0.7, opacity: 0 },
  active:  { scale: 1,   opacity: 1 },
  selected:{ scale: 1.15,opacity: 1 },
  exiting: { scale: 0.75,opacity: 0 },
};

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

    // One DOM node per marker — created once, never re-created
    const [element] = useState(() => {
      const el = document.createElement("div");
      el.style.cssText = "position:absolute;pointer-events:none;";
      return el;
    });

    const markerRef   = useRef(null);   // MapLibre Marker
    const iconWrapRef = useRef(null);   // Rotating wrapper div (mutated imperatively)
    const rafIdRef    = useRef(null);
    const animRef     = useRef(null);
    const coordsRef   = useRef({ lat: null, lng: null });
    const headingRef  = useRef(0);
    const targetRef   = useRef({ lat: null, lng: null });

    // ── Extract coordinates ───────────────────────────────────────────────
    const tLat = typeof bus.latitude  === "number" ? bus.latitude  : bus.position?.latitude;
    const tLng = typeof bus.longitude === "number" ? bus.longitude : bus.position?.longitude;
    const hasCoords = typeof tLat === "number" && typeof tLng === "number";

    const routeColor = getRouteColor(bus.routeId);

    // ── 1. Mount MapLibre Marker once ─────────────────────────────────────
    useEffect(() => {
      if (!map || !hasCoords) return;

      coordsRef.current = { lat: tLat, lng: tLng };
      targetRef.current = { lat: tLat, lng: tLng };

      // Seed initial heading from previous telemetry if available
      if (prevBus) {
        const pLat = typeof prevBus.latitude  === "number" ? prevBus.latitude  : prevBus.position?.latitude;
        const pLng = typeof prevBus.longitude === "number" ? prevBus.longitude : prevBus.position?.longitude;
        if (typeof pLat === "number" && typeof pLng === "number") {
          const d = getHaversineDistance(pLat, pLng, tLat, tLng);
          if (d > 3) {
            headingRef.current = getBearing(pLat, pLng, tLat, tLng);
            writeRotation(headingRef.current, false);
          }
        }
      }

      const marker = new maplibregl.Marker({ element, anchor: "center" })
        .setLngLat([tLng, tLat])
        .addTo(map);

      markerRef.current = marker;

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
      if (element) element.style.zIndex = isSelected ? "50" : "10";
    }, [isSelected, element]);

    // ── 3. Position + heading interpolation ──────────────────────────────
    useEffect(() => {
      if (!hasCoords || !markerRef.current) return;

      const prevLat = targetRef.current.lat;
      const prevLng = targetRef.current.lng;

      if (prevLat === null || prevLng === null) {
        targetRef.current = { lat: tLat, lng: tLng };
        coordsRef.current = { lat: tLat, lng: tLng };
        markerRef.current.setLngLat([tLng, tLat]);
        return;
      }

      if (prevLat === tLat && prevLng === tLng) return;

      const dist = getHaversineDistance(prevLat, prevLng, tLat, tLng);
      const newBearing = dist > 5
        ? getBearing(prevLat, prevLng, tLat, tLng)
        : headingRef.current;

      targetRef.current = { lat: tLat, lng: tLng };

      animRef.current = {
        startLat:     coordsRef.current.lat,
        startLng:     coordsRef.current.lng,
        endLat:       tLat,
        endLng:       tLng,
        startBearing: headingRef.current,
        endBearing:   newBearing,
        startTime:    performance.now(),
        duration:     4800,
      };

      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tLat, tLng]);

    // ── RAF tick ─────────────────────────────────────────────────────────
    const tick = useCallback(() => {
      const anim = animRef.current;
      if (!anim || !markerRef.current) { rafIdRef.current = null; return; }

      const t    = Math.min((performance.now() - anim.startTime) / anim.duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

      const lat     = lerp(anim.startLat, anim.endLat, ease);
      const lng     = lerp(anim.startLng, anim.endLng, ease);
      const bearing = interpolateAngle(anim.startBearing, anim.endBearing, ease);

      coordsRef.current  = { lat, lng };
      headingRef.current = bearing;

      markerRef.current.setLngLat([lng, lat]);
      writeRotation(bearing, true);

      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
        animRef.current  = null;
      }
    }, []); // stable — reads only refs

    // ── Write CSS rotation directly to DOM node (GPU composited) ─────────
    function writeRotation(deg, smooth) {
      if (!iconWrapRef.current) return;
      iconWrapRef.current.style.transition = smooth
        ? "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        : "none";
      iconWrapRef.current.style.transform = `translate3d(0,0,0) rotate(${deg}deg)`;
    }

    if (!hasCoords) return null;

    const routeNum   = bus.routeId || "BUS";
    const regNum     = bus.registrationNumber || "";
    const statusInfo = getStatusInfo(bus);
    const speedLabel = getSpeedLabel(bus);

    const animVariant = status === "exiting" ? "exiting" : isSelected ? "selected" : "active";
    const iconSize    = isSelected ? 34 : 28;

    return createPortal(
      <motion.div
        variants={OUTER_VARIANTS}
        initial="enter"
        animate={animVariant}
        transition={{
          opacity: { duration: 0.25, ease: "easeOut" },
          scale:   { type: "spring", stiffness: 320, damping: 24 },
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
          willChange:     "transform, opacity",
        }}
      >
        {/* ══ Info popup card (always upright — outside the rotating wrapper) ══ */}
        <AnimatePresence>
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 4,  scale: 0.94 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              marginBottom:   6,
              padding:        "7px 10px",
              borderRadius:   10,
              background:     "rgba(2, 6, 23, 0.90)",
              border:         `1px solid ${isSelected ? routeColor + "80" : "rgba(51,65,85,0.9)"}`,
              backdropFilter: "blur(8px)",
              boxShadow:      isSelected
                ? `0 0 0 1.5px ${routeColor}55, 0 6px 24px rgba(0,0,0,0.5)`
                : "0 3px 14px rgba(0,0,0,0.45)",
              minWidth:       90,
              pointerEvents:  "none",
              display:        "flex",
              flexDirection:  "column",
              gap:            3,
            }}
          >
            {/* Route badge row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Colored live dot */}
              <span style={{
                width:        8,
                height:       8,
                borderRadius: "50%",
                background:   routeColor,
                boxShadow:    `0 0 6px ${routeColor}`,
                flexShrink:   0,
                animation:    "pulse 2s ease-in-out infinite",
              }} />
              {/* Route number */}
              <span style={{
                fontFamily:    "ui-monospace, 'Courier New', monospace",
                fontSize:      13,
                fontWeight:    700,
                color:         routeColor,
                letterSpacing: "0.02em",
                lineHeight:    1,
              }}>
                {routeNum}
              </span>
            </div>

            {/* Registration */}
            {regNum && (
              <span style={{
                fontFamily:    "ui-monospace, 'Courier New', monospace",
                fontSize:      10,
                fontWeight:    500,
                color:         "#94a3b8",
                letterSpacing: "0.05em",
              }}>
                {regNum}
              </span>
            )}

            {/* Status + Speed row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 1 }}>
              {/* Status label (colored) */}
              <span style={{
                fontFamily:  "system-ui, sans-serif",
                fontSize:    10,
                fontWeight:  600,
                color:       statusInfo.color,
                lineHeight:  1,
              }}>
                {statusInfo.label}
              </span>

              {/* Speed chip */}
              {speedLabel && (
                <span style={{
                  fontFamily:    "ui-monospace, monospace",
                  fontSize:      9.5,
                  fontWeight:    500,
                  color:         "#64748b",
                  display:       "flex",
                  alignItems:    "center",
                  gap:           2,
                }}>
                  {/* speedometer icon (inline SVG) */}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12m-10 0a10 10 0 1 0 20 0" />
                    <path d="M12 12l4.5-5" />
                  </svg>
                  {speedLabel}
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ══ Connector stem ══ */}
        <div style={{
          width:        1.5,
          height:       6,
          background:   `linear-gradient(to bottom, ${routeColor}99, transparent)`,
          borderRadius: 1,
          flexShrink:   0,
        }} />

        {/* ══ Rotating bus icon wrapper ══ */}
        {/* The ref is written imperatively by the RAF tick — no React involved */}
        <div
          ref={iconWrapRef}
          className="bus-icon-wrap"
          style={{
            transform:      `translate3d(0,0,0) rotate(${headingRef.current}deg)`,
            willChange:     "transform",
            position:       "relative",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          {/* Selection glow ring (animated, pulsing) */}
          {isSelected && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.55, 0, 0.55] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position:     "absolute",
                inset:        -8,
                borderRadius: "50%",
                border:       `2px solid ${routeColor}`,
                pointerEvents:"none",
              }}
            />
          )}

          <BusIcon color={routeColor} size={iconSize} />
        </div>
      </motion.div>,
      element
    );
  },

  // ── Memo comparator — skip re-render unless something visual changes ──────
  (p, n) =>
    p.status                       === n.status                       &&
    p.isSelected                   === n.isSelected                   &&
    p.bus.id                       === n.bus.id                       &&
    p.bus.routeId                  === n.bus.routeId                  &&
    p.bus.latitude                 === n.bus.latitude                 &&
    p.bus.longitude                === n.bus.longitude                &&
    p.bus.position?.latitude       === n.bus.position?.latitude       &&
    p.bus.position?.longitude      === n.bus.position?.longitude      &&
    p.bus.status?.state            === n.bus.status?.state            &&
    p.bus.status?.delayMinutes     === n.bus.status?.delayMinutes     &&
    p.bus.speed                    === n.bus.speed
);

export default AnimatedBusMarker;
