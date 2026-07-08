/**
 * @file RouteDetails.jsx
 * @description Detail inspection view for a single route.
 * Renders stops sequentially in a timeline/station list with visual alignment.
 */

"use client";

import React from "react";
import { useTransit } from "../context/TransitContext";
import { ChevronLeft, MapPin, Compass, ArrowLeft } from "lucide-react";

import { Skeleton, Spinner } from "@/shared/components/ui/Loading";
import { NoStopsState } from "@/shared/components/ui/EmptyState";

export function RouteDetails({ onSelectStop }) {
  const {
    selectedRouteId,
    setSelectedRouteId,
    selectedStopId,
    setSelectedStopId,
    setHoveredStopId,
    clearSelection,
    routes,
    stopsList,
    loading,
    error,
    handleRetry
  } = useTransit();

  const route = routes.find((r) => r.id === selectedRouteId);
  const routeStopsEntry = stopsList.find((entry) => entry.routeId === selectedRouteId);
  const stops = routeStopsEntry ? routeStopsEntry.stops : [];
  const isStopsLoading = loading && (!routeStopsEntry || routeStopsEntry.stops.length === 0);

  if (!route) {
    return (
      <div className="text-center p-4">
        <span className="text-xs text-muted-foreground">Route not found</span>
      </div>
    );
  }

  if (isStopsLoading) {
    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Header Back Bar */}
        <button
          onClick={() => setSelectedRouteId(null)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          aria-label="Back to all routes"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Routes
        </button>

        {/* Route Badge & Name */}
        <div className="flex items-start gap-3 p-3 bg-muted/40 border border-border/60 rounded-xl">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3 rounded" />
            <Skeleton className="h-2.5 w-2/3 rounded" />
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-2">
          <div className="flex items-center gap-2 mb-4">
            <Spinner size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Loading stops sequence...
            </span>
          </div>

          <div className="relative pl-6 space-y-5">
            {/* Skeletons for stops */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative flex items-center justify-between p-2.5">
                <Skeleton className="absolute left-[-21px] w-3.5 h-3.5 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-1/2 rounded" />
                  <Skeleton className="h-2 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && (!routeStopsEntry || routeStopsEntry.stops.length === 0)) {
    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Header Back Bar */}
        <button
          onClick={() => setSelectedRouteId(null)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          aria-label="Back to all routes"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Routes
        </button>

        <div className="p-5 border border-destructive/15 bg-destructive/5 rounded-xl text-center flex flex-col items-center gap-3 mt-4">
          <span className="text-xs text-destructive font-bold uppercase tracking-wider">Failed to Load Stops</span>
          <p className="text-[10px] text-muted-foreground leading-normal max-w-[200px]">
            {error.message || "Failed to reach backend services. Please verify your connection."}
          </p>
          <button
            onClick={handleRetry}
            className="bg-destructive hover:bg-destructive/90 text-white font-semibold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  if (!isStopsLoading && stops.length === 0) {
    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Header Back Bar */}
        <button
          onClick={() => setSelectedRouteId(null)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          aria-label="Back to all routes"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Routes
        </button>

        <NoStopsState
          actionButton={
            <button
              onClick={handleRetry}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
            >
              Retry Fetch
            </button>
          }
        />
      </div>
    );
  }

  const handleStopClick = (stopId) => {
    setSelectedStopId((prev) => (prev === stopId ? null : stopId));
    if (onSelectStop) {
      onSelectStop(stopId === selectedStopId ? null : stopId);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header Back Bar */}
      <button
        onClick={() => setSelectedRouteId(null)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        aria-label="Back to all routes"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Routes
      </button>

      {/* Route Badge & Name */}
      <div className="flex items-start gap-3 p-3 bg-muted/40 border border-border/60 rounded-xl">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
          style={{ backgroundColor: route.color }}
        >
          {route.shortName}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">
            {route.longName}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
            {route.description}
          </span>
        </div>
      </div>

      {/* Stop Sequence List */}
      <div className="flex-1 flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Stops Sequence ({stops.length})
        </span>

        {/* Timeline container */}
        <div className="relative pl-6 space-y-5">
          {/* Vertical connecting line */}
          <div
            className="absolute left-[9px] top-2 bottom-2 w-0.5 rounded-full"
            style={{ backgroundColor: route.color, opacity: 0.4 }}
          />

          {stops.map((stop, index) => {
            const isOrigin = index === 0;
            const isDestination = index === stops.length - 1;
            const isSelected = selectedStopId === stop.id;

            // Bullet styles based on type
            let bulletColor = "#FFFFFF";
            let bulletBorder = route.color;
            if (isOrigin) {
              bulletColor = "#10B981"; // Green origin
              bulletBorder = "#10B981";
            } else if (isDestination) {
              bulletColor = "#EF4444"; // Red destination
              bulletBorder = "#EF4444";
            }

            return (
              <div
                key={stop.id}
                role="button"
                aria-pressed={isSelected}
                tabIndex={0}
                onMouseEnter={() => setHoveredStopId(stop.id)}
                onMouseLeave={() => setHoveredStopId(null)}
                onClick={() => handleStopClick(stop.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleStopClick(stop.id);
                  }
                }}
                className={`
                  group relative flex items-center justify-between p-2.5 rounded-lg cursor-pointer select-none
                  transition-all duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-primary
                  ${isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "border border-transparent hover:bg-muted/50"
                  }
                `}
              >
                {/* Visual Bullet Dot */}
                <div
                  className={`
                    absolute left-[-21px] w-3.5 h-3.5 rounded-full border-2 bg-card z-10
                    transition-transform duration-150 group-hover:scale-110
                    ${isSelected ? "ring-4 ring-primary/20 scale-110" : ""}
                  `}
                  style={{
                    backgroundColor: isSelected ? route.color : bulletColor,
                    borderColor: bulletBorder
                  }}
                />

                {/* Stop Name & Type */}
                <div className="flex flex-col min-w-0 pr-2">
                  <span
                    className={`
                      text-xs font-medium truncate transition-colors
                      ${isSelected ? "text-primary font-semibold" : "text-foreground group-hover:text-primary"}
                    `}
                  >
                    {stop.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground capitalize mt-0.5">
                    {isOrigin ? "Origin Stop" : isDestination ? "Destination Terminus" : "Station Stop"}
                  </span>
                </div>

                {/* Pin Icon indicator */}
                <div
                  className={`
                    text-muted-foreground group-hover:text-primary shrink-0 transition-opacity
                    ${isSelected ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100"}
                  `}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RouteDetails;
