/**
 * src/features/map/components/BusIcon.jsx
 *
 * Clean top-down bus SVG — designed to match the Phase 8.1 mockup.
 *
 * Design details:
 *   • Single solid route-color body
 *   • Clear windshield (lighter tint) at the TOP — front of bus faces UP at 0°
 *   • Rear window at the bottom
 *   • Two side mirrors as tiny wing nubs
 *   • Amber headlights strip at front
 *   • Dark wheels at 4 corners
 *   • Subtle inner body line for depth
 *   • Selection: slightly larger with a glow ring rendered by the parent
 *
 * The parent (AnimatedBusMarker) rotates this element via CSS transform
 * to match the GPS bearing, so the icon always faces its direction of travel.
 */

"use client";

import React from "react";

export function BusIcon({ color = "#10B981", size = 28, className = "" }) {
  // Derive a darker shade for depth / body edge
  const id = color.replace("#", "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        {/* Body: subtle vertical gradient for depth */}
        <linearGradient id={`body_${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="1"    />
          <stop offset="100%" stopColor={color} stopOpacity="0.82" />
        </linearGradient>

        {/* Side-edge shading makes it feel 3-D */}
        <linearGradient id={`side_${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.22" />
          <stop offset="12%"  stopColor="#000" stopOpacity="0"    />
          <stop offset="88%"  stopColor="#000" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>

        {/* Windshield glass */}
        <linearGradient id={`glass_${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#C7EEFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7EC8E3" stopOpacity="0.80" />
        </linearGradient>
      </defs>

      {/* ── Drop shadow ── */}
      <ellipse cx="14" cy="40.5" rx="9" ry="2.5" fill="#000" opacity="0.18" />

      {/* ── Main body ── */}
      <rect x="4" y="7" width="20" height="32" rx="4" fill={`url(#body_${id})`} />

      {/* Side-edge darkening overlay */}
      <rect x="4" y="7" width="20" height="32" rx="4" fill={`url(#side_${id})`} />

      {/* ── Front nose cap ── */}
      <rect x="6" y="4" width="16" height="5" rx="3" fill={color} />

      {/* ── Rear bumper ── */}
      <rect x="6" y="36" width="16" height="4" rx="2" fill={color} opacity="0.75" />

      {/* ── Front windshield ── */}
      <rect x="7" y="7" width="14" height="9" rx="2" fill={`url(#glass_${id})`} />

      {/* Wiper lines */}
      <line x1="9"  y1="15" x2="13" y2="9"  stroke="#fff" strokeWidth="0.7" strokeOpacity="0.5" />
      <line x1="19" y1="15" x2="15" y2="9"  stroke="#fff" strokeWidth="0.7" strokeOpacity="0.5" />

      {/* ── Rear window ── */}
      <rect x="7" y="27" width="14" height="8" rx="2" fill={`url(#glass_${id})`} opacity="0.7" />

      {/* ── Central body stripe (roof center line) ── */}
      <rect x="12.5" y="7" width="3" height="32" rx="1" fill="#000" opacity="0.07" />

      {/* ── Headlights ── */}
      <rect x="7"  y="4.5" width="5" height="2" rx="1" fill="#FDE68A" opacity="0.95" />
      <rect x="16" y="4.5" width="5" height="2" rx="1" fill="#FDE68A" opacity="0.95" />

      {/* ── Tail lights ── */}
      <rect x="7"  y="38" width="5" height="2" rx="1" fill="#FCA5A5" opacity="0.9" />
      <rect x="16" y="38" width="5" height="2" rx="1" fill="#FCA5A5" opacity="0.9" />

      {/* ── Side mirrors (tiny wings off the sides) ── */}
      <rect x="1"  y="11" width="3.5" height="5" rx="1" fill={color} opacity="0.9" />
      <rect x="23.5" y="11" width="3.5" height="5" rx="1" fill={color} opacity="0.9" />

      {/* ── Wheels (4 corners, dark) ── */}
      {/* Front-left */}
      <rect x="2" y="8"  width="4" height="7" rx="1.5" fill="#1e293b" />
      <rect x="2.8" y="9" width="2.4" height="5" rx="1" fill="#374151" />

      {/* Front-right */}
      <rect x="22" y="8"  width="4" height="7" rx="1.5" fill="#1e293b" />
      <rect x="22.8" y="9" width="2.4" height="5" rx="1" fill="#374151" />

      {/* Rear-left */}
      <rect x="2" y="30" width="4" height="7" rx="1.5" fill="#1e293b" />
      <rect x="2.8" y="31" width="2.4" height="5" rx="1" fill="#374151" />

      {/* Rear-right */}
      <rect x="22" y="30" width="4" height="7" rx="1.5" fill="#1e293b" />
      <rect x="22.8" y="31" width="2.4" height="5" rx="1" fill="#374151" />
    </svg>
  );
}

export default BusIcon;
