/**
 * src/features/map/components/BusLayer.jsx
 *
 * Live bus markers layers.
 * Fetches real-time bus locations (all or selected route specific) from the backend,
 * coordinates marker lifecycle states (entrance, active, exit), and renders animated markers.
 */

"use client";

import React, { useState } from "react";
import { useTransit } from "@/features/transit/context/TransitContext";
import { useLiveBuses, useAllBuses } from "@/hooks/api/useLiveBuses";
import { useAnimatedMarkers } from "../hooks/useAnimatedMarkers";
import { AnimatedBusMarker } from "./AnimatedBusMarker";
import { RotateCw, AlertTriangle } from "lucide-react";

export function BusLayer() {
  const { selectedRouteId } = useTransit();
  const [selectedBusId, setSelectedBusId] = useState(null);

  // Fetch either specific route buses or all buses depending on route selection
  const routeBusesQuery = useLiveBuses(selectedRouteId);
  const allBusesQuery = useAllBuses({ enabled: !selectedRouteId });

  const activeQuery = selectedRouteId ? routeBusesQuery : allBusesQuery;
  const {
    data: buses = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = activeQuery;

  // Track entering, active, and exiting markers
  const { markers, removeMarker } = useAnimatedMarkers(buses);

  // 1. Loading State Overlay
  if (isLoading) {
    return (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-950/90 text-white px-4 py-2 rounded-full border border-slate-800 shadow-xl text-xs flex items-center gap-2.5 pointer-events-auto backdrop-blur-sm">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="font-medium tracking-wide">Syncing fleet GPS data...</span>
      </div>
    );
  }

  // 2. Error State Overlay
  if (isError) {
    return (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-red-950/95 border border-red-800 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-3.5 pointer-events-auto backdrop-blur-sm">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-red-200">GPS Feed Offline</span>
          <span className="text-[9.5px] text-red-300 truncate max-w-[200px] mt-0.5">
            {error?.message || "Failed to reach backend services."}
          </span>
        </div>
        <button
          onClick={() => refetch()}
          className="bg-red-800/80 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0"
        >
          <RotateCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  // 3. Empty State Overlay (only when we don't even have exiting markers to display)
  if (buses.length === 0 && markers.length === 0) {
    return (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-950/95 border border-amber-800 text-white px-5 py-3 rounded-xl shadow-xl text-xs flex flex-col items-center pointer-events-auto backdrop-blur-sm max-w-[280px] text-center">
        <span className="font-semibold text-amber-200">No Active Transmitters</span>
        <span className="text-[10px] text-amber-300/85 mt-1 leading-normal">
          {selectedRouteId
            ? "There are no live buses currently transmitting on this route."
            : "No active buses are online across the network."}
        </span>
        <button
          onClick={() => refetch()}
          className="mt-2 bg-amber-800/80 hover:bg-amber-800 text-white font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer text-[10px] uppercase tracking-wider flex items-center gap-1"
        >
          <RotateCw className="w-3 h-3" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Sync indicator dot in top right during refetch */}
      {isFetching && (
        <div className="absolute top-4 right-16 z-30 bg-slate-950/80 text-emerald-400 border border-slate-800/60 p-1.5 rounded-lg shadow-md flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>
      )}

      {/* Render Active, Entering, and Exiting Bus Markers */}
      {markers.map((marker) => (
        <AnimatedBusMarker
          key={marker.id}
          bus={marker.bus}
          prevBus={marker.prevBus}
          status={marker.status}
          onExitComplete={removeMarker}
          isSelected={marker.id === selectedBusId}
          onSelect={() => setSelectedBusId((prev) => (prev === marker.id ? null : marker.id))}
        />
      ))}
    </>
  );
}

export default BusLayer;
