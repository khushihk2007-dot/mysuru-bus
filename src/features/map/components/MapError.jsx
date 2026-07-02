/**
 * @file MapError.jsx
 * @description Graceful error state shown when the map fails to initialize,
 * tiles fail to load, or there is no internet connection.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { WifiOff, RefreshCw, MapPin } from "lucide-react";

/**
 * MapError
 *
 * @param {object} props
 * @param {Error}  props.error   — The error object to display
 * @param {function} [props.onRetry] — Optional retry callback
 */
export function MapError({ error, onRetry }) {
  const isOffline =
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("fetch") ||
    !navigator?.onLine;

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      role="alert"
      aria-live="assertive"
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Error icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center">
          {isOffline ? (
            <WifiOff className="w-7 h-7 text-danger" />
          ) : (
            <MapPin className="w-7 h-7 text-danger" />
          )}
        </div>
      </div>

      {/* Error content */}
      <div className="flex flex-col items-center gap-2 max-w-xs text-center px-6">
        <h3 className="text-sm font-semibold text-foreground">
          {isOffline ? "No Internet Connection" : "Map Failed to Load"}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isOffline
            ? "The map requires an internet connection to load OpenStreetMap tiles. Please check your connection and try again."
            : "Something went wrong while initialising the map. This may be a temporary issue."}
        </p>

        {/* Error details for developers */}
        {process.env.NODE_ENV === "development" && error?.message && (
          <code className="mt-2 text-[10px] font-mono text-danger/80 bg-danger/5 border border-danger/10 px-2 py-1 rounded w-full text-left break-all">
            {error.message}
          </code>
        )}
      </div>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Retry loading the map"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </motion.div>
  );
}

export default MapError;
