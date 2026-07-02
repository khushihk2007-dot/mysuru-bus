/**
 * @file MapLayers.jsx
 * @description Layer switcher control in the map HUD.
 * Provides toggles for base layers (light/dark minimal styles) and transit overlays (routes, stops, labels).
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Map, Globe, X, Eye, EyeOff, Sliders } from "lucide-react";
import { useMapLayers } from "../hooks/useMapLayers";
import { useTransit } from "@/features/transit/context/TransitContext";

const BASE_LAYERS = [
  { id: "osm",       label: "Street Mode",    icon: Map },
];

export function MapLayers({ className = "" }) {
  const { layers, setBaseLayer } = useMapLayers();
  const [isOpen, setIsOpen] = useState(false);
  const transit = useTransit();

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        aria-label="Switch map layers"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`
          w-9 h-9 flex items-center justify-center
          bg-card border rounded-lg shadow-md
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
          ${isOpen
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-text-secondary hover:bg-secondary hover:text-text-primary"
          }
        `}
      >
        <Layers className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Popover panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Map layer switcher"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 bottom-full mb-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-30 select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Map Layers
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close layer switcher"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Base Style Info */}
            <div className="p-2 flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider text-text-muted px-1">
                Base style
              </span>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/40 text-xs font-medium text-foreground">
                <Map className="w-3.5 h-3.5 text-primary" />
                Muted CartoDB Basemap
              </div>
            </div>

            {/* Transit Overlays */}
            <div className="border-t border-border p-2 flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-wider text-text-muted px-1">
                Transit overlays
              </span>

              <div className="flex flex-col gap-1 text-xs">
                {/* Routes Toggle */}
                <div className="flex items-center justify-between px-1 py-1 rounded hover:bg-muted/40">
                  <span className="text-text-secondary">Route Lines</span>
                  <button
                    onClick={() => transit.toggleLayerVisibility("routes")}
                    className={`p-1 rounded hover:bg-muted ${transit.layerVisibility.routes ? "text-primary" : "text-text-muted"}`}
                    aria-label={transit.layerVisibility.routes ? "Hide routes" : "Show routes"}
                  >
                    {transit.layerVisibility.routes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Stops Toggle */}
                <div className="flex items-center justify-between px-1 py-1 rounded hover:bg-muted/40">
                  <span className="text-text-secondary">Station Stops</span>
                  <button
                    onClick={() => transit.toggleLayerVisibility("stops")}
                    className={`p-1 rounded hover:bg-muted ${transit.layerVisibility.stops ? "text-primary" : "text-text-muted"}`}
                    aria-label={transit.layerVisibility.stops ? "Hide stops" : "Show stops"}
                  >
                    {transit.layerVisibility.stops ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Labels Toggle */}
                <div className="flex items-center justify-between px-1 py-1 rounded hover:bg-muted/40">
                  <span className="text-text-secondary">Stop Labels</span>
                  <button
                    disabled={!transit.layerVisibility.stops}
                    onClick={() => transit.toggleLayerVisibility("labels")}
                    className={`p-1 rounded hover:bg-muted disabled:opacity-40 ${transit.layerVisibility.labels && transit.layerVisibility.stops ? "text-primary" : "text-text-muted"}`}
                    aria-label={transit.layerVisibility.labels ? "Hide labels" : "Show labels"}
                  >
                    {transit.layerVisibility.labels && transit.layerVisibility.stops ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Tip notice */}
            <div className="px-3 py-2 border-t border-border bg-surface/50 text-center">
              <span className="text-[9px] text-text-muted flex items-center justify-center gap-1">
                <Sliders className="w-2.5 h-2.5" />
                Change opacity in GIS settings panel
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MapLayers;
