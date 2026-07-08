"use client";

import React from "react";
import { useTransit } from "@/features/transit/context/TransitContext";
import { useLiveBuses, useAllBuses } from "@/hooks/api/useLiveBuses";
import { BusMarker } from "./BusMarker";
import { RotateCw, AlertTriangle } from "lucide-react";

/**
 * BusMarkersLayer
 * Manages fetching of live buses and instantiating individual BusMarker components on the map.
 * Also handles loading, error, empty, and retry states for live bus updates.
 */
export function BusMarkersLayer() {
  const { selectedRouteId } = useTransit();

  // Fetch either specific route buses or all buses
  const routeBusesQuery = useLiveBuses(selectedRouteId);
  const allBusesQuery = useAllBuses();

  const activeQuery = selectedRouteId ? routeBusesQuery : allBusesQuery;
  const { data: buses = [], isLoading, isError, error, refetch, isFetching } = activeQuery;

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

  // 3. Empty State Overlay
  if (buses.length === 0) {
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
      {/* Small live heartbeat sync indicator in top right */}
      {isFetching && (
        <div className="absolute top-4 right-16 z-30 bg-slate-950/80 text-emerald-400 border border-slate-800/60 p-1.5 rounded-lg shadow-md flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>
      )}

      {/* Render Active Bus Markers */}
      {buses.map((bus) => {
        const lat = typeof bus.latitude === "number" ? bus.latitude : bus.position?.latitude;
        const lng = typeof bus.longitude === "number" ? bus.longitude : bus.position?.longitude;

        if (typeof lat !== "number" || typeof lng !== "number" || lat === 0 || lng === 0) {
          return null;
        }

        return <BusMarker key={bus.id} bus={bus} />;
      })}
    </>
  );
}

export default BusMarkersLayer;
