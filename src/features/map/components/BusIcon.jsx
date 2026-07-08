/**
 * src/features/map/components/BusIcon.jsx
 *
 * Top-down flat SVG bus icon.
 * - The bus body faces UPWARD (north) at 0° rotation.
 * - Designed to be rotated by the parent via CSS transform.
 * - Transparent background so only the bus shape renders on the map.
 * - Accepts a route color for the bus body and a contrasting roof stripe.
 */

"use client";

import React from "react";

/**
 * @param {object}  props
 * @param {string}  [props.color="#10B981"]  - Body / roof color (hex or CSS).
 * @param {number}  [props.size=36]          - Width = Height in px.
 * @param {boolean} [props.isSelected=false] - Render selection glow ring.
 * @param {string}  [props.className]
 */
export function BusIcon({ color = "#10B981", size = 36, isSelected = false, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      {/* ── Selection glow ring ── */}
      {isSelected && (
        <ellipse
          cx="18"
          cy="25"
          rx="17"
          ry="23"
          fill={color}
          opacity="0.20"
          filter="url(#glow)"
        />
      )}

      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Roof gradient for depth */}
        <linearGradient id={`busGrad_${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.78" />
        </linearGradient>

        {/* Glass gradient (windshields) */}
        <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B8E4FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7BC8F0" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* ── Drop shadow ── */}
      <ellipse cx="18" cy="43" rx="12" ry="4" fill="#000" opacity="0.18" />

      {/* ── Main bus body ── */}
      {/* Rear bumper */}
      <rect x="8" y="39" width="20" height="4" rx="2" fill={color} opacity="0.7" />

      {/* Body hull */}
      <rect
        x="5"
        y="10"
        width="26"
        height="32"
        rx="4"
        fill={`url(#busGrad_${color.replace("#", "")})`}
      />

      {/* Front bumper / nose */}
      <rect x="8" y="7" width="20" height="5" rx="3" fill={color} />

      {/* ── Roof details ── */}
      {/* Central roof strip (darker) */}
      <rect x="14" y="10" width="8" height="30" rx="1" fill="#000" opacity="0.10" />

      {/* Roof vents / AC unit */}
      <rect x="15" y="13" width="6" height="3" rx="1" fill="#fff" opacity="0.25" />
      <rect x="15" y="20" width="6" height="2" rx="1" fill="#fff" opacity="0.18" />

      {/* ── Front windshield ── */}
      <rect x="9" y="10" width="18" height="9" rx="2" fill="url(#glassGrad)" />
      {/* Windshield wiper lines */}
      <line x1="11" y1="17" x2="17" y2="12" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="25" y1="17" x2="19" y2="12" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.5" />

      {/* ── Rear windshield ── */}
      <rect x="9" y="31" width="18" height="7" rx="2" fill="url(#glassGrad)" opacity="0.7" />

      {/* ── Side windows (left side) ── */}
      <rect x="5.5" y="14" width="4" height="5" rx="1" fill="url(#glassGrad)" opacity="0.8" />
      <rect x="5.5" y="21" width="4" height="5" rx="1" fill="url(#glassGrad)" opacity="0.8" />
      <rect x="5.5" y="28" width="4" height="5" rx="1" fill="url(#glassGrad)" opacity="0.6" />

      {/* ── Side windows (right side) ── */}
      <rect x="26.5" y="14" width="4" height="5" rx="1" fill="url(#glassGrad)" opacity="0.8" />
      <rect x="26.5" y="21" width="4" height="5" rx="1" fill="url(#glassGrad)" opacity="0.8" />
      <rect x="26.5" y="28" width="4" height="5" rx="1" fill="url(#glassGrad)" opacity="0.6" />

      {/* ── Wheels ── */}
      {/* Front-left */}
      <rect x="2" y="9" width="5" height="7" rx="1.5" fill="#1e293b" />
      <rect x="3" y="10.5" width="3" height="4" rx="1" fill="#334155" />
      {/* Front-right */}
      <rect x="29" y="9" width="5" height="7" rx="1.5" fill="#1e293b" />
      <rect x="30" y="10.5" width="3" height="4" rx="1" fill="#334155" />
      {/* Rear-left */}
      <rect x="2" y="34" width="5" height="7" rx="1.5" fill="#1e293b" />
      <rect x="3" y="35.5" width="3" height="4" rx="1" fill="#334155" />
      {/* Rear-right */}
      <rect x="29" y="34" width="5" height="7" rx="1.5" fill="#1e293b" />
      <rect x="30" y="35.5" width="3" height="4" rx="1" fill="#334155" />

      {/* ── Headlights ── */}
      <rect x="9" y="7.5" width="5" height="2" rx="1" fill="#FDE68A" opacity="0.9" />
      <rect x="22" y="7.5" width="5" height="2" rx="1" fill="#FDE68A" opacity="0.9" />

      {/* ── Tail lights ── */}
      <rect x="9" y="40.5" width="5" height="2" rx="1" fill="#FCA5A5" opacity="0.85" />
      <rect x="22" y="40.5" width="5" height="2" rx="1" fill="#FCA5A5" opacity="0.85" />

      {/* ── Route number badge (center of roof) ── */}
      <rect x="12" y="22" width="12" height="7" rx="2" fill="#000" opacity="0.38" />
    </svg>
  );
}

export default BusIcon;
