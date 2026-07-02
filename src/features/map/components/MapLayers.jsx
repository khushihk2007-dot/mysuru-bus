/**
 * @file MapLayers.jsx
 * @description Layer switcher placeholder control.
 * Provides the UI shell for switching base layers and toggling overlays.
 * No real layer data is loaded in this phase — architectural stub only.
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Map, Globe, X } from "lucide-react";
import { useMapLayers } from "../hooks/useMapLayers";

const BASE_LAYERS = [
  { id: "osm",       label: "Street",    icon: Map },
  { id: "satellite", label: "Satellite", icon: Globe },
];

/**
 * MapLayers
 * A popover-style layer switcher button.
 */
export function MapLayers({ className = "" }) {
  const { layers, setBaseLayer } = useMapLayers();
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Map layer switcher"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 bottom-full mb-2 w-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-30"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Base Layer
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close layer switcher"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Layer options */}
            <div className="p-1.5 flex flex-col gap-0.5">
              {BASE_LAYERS.map(({ id, label, icon: Icon }) => {
                const active = layers.baseLayer === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setBaseLayer(id); setIsOpen(false); }}
                    className={`
                      flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-left
                      transition-colors duration-100
                      ${active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text-secondary hover:bg-secondary hover:text-text-primary"
                      }
                    `}
                    aria-pressed={active}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Coming soon notice */}
            <div className="px-3 py-2 border-t border-border bg-surface/50">
              <p className="text-[9px] text-text-muted">
                Satellite &amp; traffic layers coming soon
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MapLayers;
