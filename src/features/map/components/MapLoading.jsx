/**
 * @file MapLoading.jsx
 * @description Loading state component shown while the MapLibre map initializes.
 * Displays a premium animated shimmer with brand-consistent styling.
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";

/**
 * MapLoading
 *
 * @param {object}  props
 * @param {boolean} props.visible — Controls mount/unmount via AnimatePresence
 */
export function MapLoading({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="map-loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeOut" } }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
          aria-live="polite"
          aria-label="Map loading"
          role="status"
        >
          {/* Animated grid shimmer background */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Pulsing rings */}
          <div className="relative flex items-center justify-center mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-primary/20"
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut",
                }}
                style={{ width: 64, height: 64 }}
              />
            ))}

            {/* Core icon */}
            <motion.div
              className="relative w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg"
              animate={{ scale: [0.97, 1.03, 0.97] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </motion.div>
          </div>

          {/* Text */}
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-foreground tracking-tight">
              Loading Mysuru Transit Map
            </p>
            <p className="text-xs text-muted-foreground">
              Initialising OpenStreetMap tiles…
            </p>
          </motion.div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MapLoading;
