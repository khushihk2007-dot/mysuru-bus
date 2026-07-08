/**
 * src/features/map/components/BusIcon.jsx
 *
 * Top-down KSRTC-style bus icon.
 *
 * Inspired by the red-and-cream KSRTC/BMTC Indian city bus aesthetic.
 * Designed for use as a rotating MapLibre map marker:
 *   • Front of bus faces UP  → correct at 0 ° (North)
 *   • The parent wrapper rotates this SVG to the GPS bearing
 *   • Transparent background
 *
 * Visual design:
 *   • Deep red bus body   (#C0281C)
 *   • Cream accent stripe running across the mid-section
 *   • Teal-blue panoramic windshields (front + rear)
 *   • Darker roof panel with AC vents
 *   • Black tyres with grey rim highlights
 *   • Amber headlights, red tail-lights
 *   • Route-number dark badge on the roof
 *   • Soft drop-shadow beneath the body
 *   • Selection glow ring (shown only when isSelected)
 */

"use client";

import React from "react";

/**
 * @param {object}  props
 * @param {string}  [props.color]          Route accent colour (overrides the default red).
 *                                         When absent the classic KSRTC red is used.
 * @param {number}  [props.size=36]        Bounding-box width = height in px.
 * @param {boolean} [props.isSelected]     Renders selection glow ring when true.
 * @param {string}  [props.className]
 */
export function BusIcon({
  color,
  size = 36,
  isSelected = false,
  className = "",
}) {
  // Use the route colour for accent strip + selection ring only;
  // the body always stays the KSRTC deep red unless the caller explicitly
  // wants a fully custom-coloured bus.
  const accentColor  = color ?? "#C0281C";
  const bodyColor    = "#C0281C";          // classic KSRTC red
  const roofColor    = "#991F16";          // darker roof
  const creamColor   = "#F5E6C8";          // cream / off-white stripe
  const glassColor   = "#5BBFCF";          // teal windshield
  const glassDark    = "#3A9BAD";
  const tyreColor    = "#1A1A1A";
  const rimColor     = "#6B7280";
  const shadowColor  = "#000";
  const headlight    = "#FDE68A";
  const taillight    = "#F87171";

  // Unique gradient IDs scoped to this component render
  const gradId   = `busBody_${size}`;
  const roofGrad = `busRoof_${size}`;
  const glassGrad= `busGlass_${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        {/* ── Body gradient – darker on sides for depth ── */}
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#9B1E13" stopOpacity="1" />
          <stop offset="18%"  stopColor={bodyColor} stopOpacity="1" />
          <stop offset="82%"  stopColor={bodyColor} stopOpacity="1" />
          <stop offset="100%" stopColor="#9B1E13" stopOpacity="1" />
        </linearGradient>

        {/* ── Roof gradient ── */}
        <linearGradient id={roofGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={roofColor} />
          <stop offset="100%" stopColor="#7A1710" />
        </linearGradient>

        {/* ── Windshield glass gradient ── */}
        <linearGradient id={glassGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={glassColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={glassDark}  stopOpacity="0.75" />
        </linearGradient>

        {/* ── Selection glow filter ── */}
        <filter id="selGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ════════════════════════════════════════════
          SELECTION GLOW  (behind everything)
      ════════════════════════════════════════════ */}
      {isSelected && (
        <ellipse
          cx="20" cy="28"
          rx="18" ry="26"
          fill={accentColor}
          opacity="0.22"
          filter="url(#selGlow)"
        />
      )}

      {/* ════════════════════════════════════════════
          DROP SHADOW
      ════════════════════════════════════════════ */}
      <ellipse cx="20" cy="50" rx="13" ry="3.5" fill={shadowColor} opacity="0.2" />

      {/* ════════════════════════════════════════════
          BODY HULL
      ════════════════════════════════════════════ */}
      {/* Main body */}
      <rect x="6" y="11" width="28" height="37" rx="4" fill={`url(#${gradId})`} />

      {/* Front nose (rounded) */}
      <rect x="8"  y="7"  width="24" height="6"  rx="3.5" fill={bodyColor} />

      {/* Rear bumper */}
      <rect x="9"  y="46" width="22" height="5"  rx="2.5" fill={bodyColor} opacity="0.85" />

      {/* ════════════════════════════════════════════
          CREAM HORIZONTAL STRIPE
          Runs across the body mid-section
      ════════════════════════════════════════════ */}
      {/* Full-width cream band */}
      <rect x="6"  y="28" width="28" height="8" fill={creamColor} />
      {/* Thin red pinstripes bordering the cream band */}
      <rect x="6"  y="27.5" width="28" height="1"   fill={bodyColor} opacity="0.6" />
      <rect x="6"  y="36"   width="28" height="1"   fill={bodyColor} opacity="0.6" />

      {/* ════════════════════════════════════════════
          ROOF PANEL
      ════════════════════════════════════════════ */}
      <rect x="10" y="11" width="20" height="35" rx="2" fill={`url(#${roofGrad})`} opacity="0.55" />

      {/* AC unit / roof vent blocks */}
      <rect x="16" y="14" width="8"  height="4"  rx="1.5" fill="#7A1710" opacity="0.7" />
      <rect x="17" y="14.5" width="6" height="3" rx="1"   fill="#5C120D" opacity="0.5" />

      {/* Roof spine highlight */}
      <rect x="19" y="13" width="2"  height="32" rx="1" fill="#fff" opacity="0.06" />

      {/* ════════════════════════════════════════════
          FRONT WINDSHIELD
      ════════════════════════════════════════════ */}
      <rect x="10" y="8" width="20" height="10" rx="2" fill={`url(#${glassGrad})`} />
      {/* Wiper lines */}
      <line x1="13" y1="16.5" x2="19" y2="9.5"  stroke="#fff" strokeWidth="0.8" strokeOpacity="0.45" />
      <line x1="27" y1="16.5" x2="21" y2="9.5"  stroke="#fff" strokeWidth="0.8" strokeOpacity="0.45" />
      {/* Frame border */}
      <rect x="10" y="8" width="20" height="10" rx="2" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.5" />

      {/* ════════════════════════════════════════════
          REAR WINDSHIELD
      ════════════════════════════════════════════ */}
      <rect x="10" y="38" width="20" height="9" rx="2" fill={`url(#${glassGrad})`} opacity="0.8" />
      <rect x="10" y="38" width="20" height="9" rx="2" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.4" />

      {/* ════════════════════════════════════════════
          SIDE WINDOWS  (left column – x=6..9.5)
      ════════════════════════════════════════════ */}
      <rect x="6.5" y="13"  width="4" height="6"  rx="1.2" fill={glassColor} opacity="0.75" />
      <rect x="6.5" y="21"  width="4" height="6"  rx="1.2" fill={glassColor} opacity="0.75" />
      {/* cream stripe slot – no window */}
      <rect x="6.5" y="37"  width="4" height="6"  rx="1.2" fill={glassColor} opacity="0.6" />
      <rect x="6.5" y="44"  width="4" height="5"  rx="1.2" fill={glassColor} opacity="0.5" />

      {/* ════════════════════════════════════════════
          SIDE WINDOWS  (right column – x=29.5..34)
      ════════════════════════════════════════════ */}
      <rect x="29.5" y="13" width="4" height="6"  rx="1.2" fill={glassColor} opacity="0.75" />
      <rect x="29.5" y="21" width="4" height="6"  rx="1.2" fill={glassColor} opacity="0.75" />
      <rect x="29.5" y="37" width="4" height="6"  rx="1.2" fill={glassColor} opacity="0.6" />
      <rect x="29.5" y="44" width="4" height="5"  rx="1.2" fill={glassColor} opacity="0.5" />

      {/* ════════════════════════════════════════════
          WHEELS  (4 corners)
      ════════════════════════════════════════════ */}
      {/* Front-left */}
      <rect x="2.5" y="9.5"  width="5.5" height="9" rx="2"   fill={tyreColor} />
      <rect x="3.5" y="11"   width="3.5" height="6" rx="1.2" fill={rimColor}  />
      <rect x="4.5" y="12.5" width="1.5" height="3" rx="0.7" fill="#9CA3AF"   />

      {/* Front-right */}
      <rect x="32"  y="9.5"  width="5.5" height="9" rx="2"   fill={tyreColor} />
      <rect x="33"  y="11"   width="3.5" height="6" rx="1.2" fill={rimColor}  />
      <rect x="34"  y="12.5" width="1.5" height="3" rx="0.7" fill="#9CA3AF"   />

      {/* Rear-left */}
      <rect x="2.5" y="38"   width="5.5" height="9" rx="2"   fill={tyreColor} />
      <rect x="3.5" y="39.5" width="3.5" height="6" rx="1.2" fill={rimColor}  />
      <rect x="4.5" y="41"   width="1.5" height="3" rx="0.7" fill="#9CA3AF"   />

      {/* Rear-right */}
      <rect x="32"  y="38"   width="5.5" height="9" rx="2"   fill={tyreColor} />
      <rect x="33"  y="39.5" width="3.5" height="6" rx="1.2" fill={rimColor}  />
      <rect x="34"  y="41"   width="1.5" height="3" rx="0.7" fill="#9CA3AF"   />

      {/* ════════════════════════════════════════════
          HEADLIGHTS  (front)
      ════════════════════════════════════════════ */}
      <rect x="10" y="7"  width="6" height="2.5" rx="1.2" fill={headlight} opacity="0.95" />
      <rect x="24" y="7"  width="6" height="2.5" rx="1.2" fill={headlight} opacity="0.95" />

      {/* ════════════════════════════════════════════
          TAIL LIGHTS  (rear)
      ════════════════════════════════════════════ */}
      <rect x="10" y="48" width="6" height="2.5" rx="1.2" fill={taillight} opacity="0.9" />
      <rect x="24" y="48" width="6" height="2.5" rx="1.2" fill={taillight} opacity="0.9" />

      {/* ════════════════════════════════════════════
          DESTINATION BOARD  (above front windshield)
          Small cream rectangle with a darker text hint
      ════════════════════════════════════════════ */}
      <rect x="13" y="7.5" width="14" height="3" rx="1" fill={creamColor} opacity="0.9" />
      <rect x="14" y="8.2" width="12" height="1.5" rx="0.5" fill="#999" opacity="0.4" />

      {/* ════════════════════════════════════════════
          ROOF NUMBER BADGE
      ════════════════════════════════════════════ */}
      <rect x="15" y="20" width="10" height="6" rx="1.5" fill="#000" opacity="0.32" />
    </svg>
  );
}

export default BusIcon;
