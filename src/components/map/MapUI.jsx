/**
 * @file MapUI.jsx
 * @description Reusable UI overlays for map controls (Zoom, Locate, Compass, Scale, Coordinates, Toolbars, Traffic toggles).
 */

import React, { useState } from "react";
import { Plus, Minus, Compass, Navigation, Layers, Maximize2, Map, Globe, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

// 1. Zoom Controls
export const ZoomControls = ({ onZoomIn, onZoomOut, className }) => (
  <div className={cn("flex flex-col bg-card border border-border shadow-md rounded-md overflow-hidden", className)}>
    <button
      onClick={onZoomIn}
      className="p-2 hover:bg-secondary text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-ring border-b border-border/40"
      title="Zoom In"
    >
      <Plus className="h-4 w-4" />
    </button>
    <button
      onClick={onZoomOut}
      className="p-2 hover:bg-secondary text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
      title="Zoom Out"
    >
      <Minus className="h-4 w-4" />
    </button>
  </div>
);

// 2. Compass Button
export const CompassButton = ({ rotation = 0, onResetRotation, className }) => (
  <button
    onClick={onResetRotation}
    className={cn(
      "p-2 bg-card border border-border shadow-md rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
      className
    )}
    title="Reset Bearing"
  >
    <Compass
      className="h-4 w-4 transition-transform duration-200"
      style={{ transform: `rotate(${rotation}deg)` }}
    />
  </button>
);

// 3. Locate Button (GPS Locate)
export const LocateButton = ({ isActive, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-2 bg-card border border-border shadow-md rounded-md hover:bg-secondary transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
      isActive ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-text-secondary hover:text-text-primary",
      className
    )}
    title="Locate Me"
  >
    <Navigation className={cn("h-4 w-4", isActive && "fill-current animate-pulse")} />
  </button>
);

// 4. Layer Button (Switch vector/satellite)
export const LayerButton = ({ activeLayer = "vector", onSelectLayer, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const layers = [
    { id: "vector", label: "Street Vector", icon: Map },
    { id: "satellite", label: "Satellite Hybrid", icon: Globe },
  ];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "p-2 bg-card border border-border shadow-md rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
          isOpen && "bg-secondary text-text-primary",
          className
        )}
        title="Switch Layers"
      >
        <Layers className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1.5 z-40 bg-card border border-border rounded-lg shadow-lg p-1.5 flex flex-col gap-1 w-36 animate-in fade-in slide-in-from-bottom-1 duration-150">
          {layers.map((lay) => {
            const Icon = lay.icon;
            const isSelected = activeLayer === lay.id;
            return (
              <button
                key={lay.id}
                onClick={() => {
                  onSelectLayer && onSelectLayer(lay.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-left text-text-secondary hover:bg-secondary hover:text-text-primary transition-colors",
                  isSelected && "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{lay.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 5. Traffic Toggle
export const TrafficToggle = ({ isActive, onToggle, className }) => (
  <button
    onClick={onToggle}
    className={cn(
      "p-2 bg-card border border-border shadow-md rounded-md hover:bg-secondary transition-colors focus:outline-none focus:ring-1 focus:ring-ring flex items-center gap-1.5 text-xs font-semibold select-none",
      isActive ? "text-success bg-success/10 border-success/20 hover:bg-success/15" : "text-text-secondary hover:text-text-primary",
      className
    )}
    title="Toggle Traffic Layer"
  >
    {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    <span>Traffic</span>
  </button>
);

// 6. Fullscreen Button
export const FullscreenButton = ({ isFullscreen, onToggle, className }) => (
  <button
    onClick={onToggle}
    className={cn(
      "p-2 bg-card border border-border shadow-md rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
      className
    )}
    title="Toggle Fullscreen"
  >
    <Maximize2 className="h-4 w-4" />
  </button>
);

// 7. Scale Indicator (Graphical scale label)
export const ScaleIndicator = ({ scaleText = "500 m", className }) => (
  <div className={cn("flex flex-col items-start select-none font-mono text-[9px] text-text-secondary font-medium", className)}>
    <span>{scaleText}</span>
    <div className="h-1 border-x border-b border-text-secondary w-14 mt-0.5" />
  </div>
);

// 8. Coordinate Display
export const CoordinateDisplay = ({ lat = 12.2958, lng = 76.6394, zoom = 13.5, className }) => (
  <div className={cn("bg-card/85 backdrop-blur-[2px] border border-border/60 px-2 py-1 rounded shadow-sm font-mono text-[10px] text-text-secondary select-none flex items-center gap-2", className)}>
    <span>LAT: {lat.toFixed(4)}</span>
    <span>LNG: {lng.toFixed(4)}</span>
    <span>ZOOM: {zoom.toFixed(1)}</span>
  </div>
);

// 9. Map Floating Controls Container (Z-Index stack wrapper)
export const MapFloatingControls = ({ children, className }) => (
  <div
    className={cn(
      "absolute bottom-4 right-4 flex flex-col gap-2 items-end",
      zIndex.floatingControls,
      className
    )}
  >
    {children}
  </div>
);

// 10. Map Toolbar (Horizontal navigation overlay)
export const MapToolbar = ({ children, className }) => (
  <div
    className={cn(
      "absolute top-4 left-4 right-4 md:left-[92px] md:right-auto flex items-center gap-2 p-1.5 rounded-lg border border-border bg-card shadow-lg max-w-sm overflow-x-auto scrollbar-none",
      zIndex.floatingControls,
      className
    )}
  >
    {children}
  </div>
);

// 11. Map Overlay Card (Float details popup)
export const MapOverlayCard = ({ children, onClose, className }) => (
  <div
    className={cn(
      "absolute top-18 left-4 md:left-[92px] w-[320px] bg-card border border-border rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden",
      zIndex.floatingControls,
      className
    )}
  >
    {onClose && (
      <button
        onClick={onClose}
        className="absolute right-2 top-2 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-secondary z-10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
    {children}
  </div>
);
