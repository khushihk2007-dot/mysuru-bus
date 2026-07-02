/**
 * @file RouteList.jsx
 * @description List view of all available transit routes.
 * Handles mouse hovers and clicks to sync with map visual highlights.
 */

"use client";

import React from "react";
import { useTransit } from "../context/TransitContext";
import { ArrowRight, Compass } from "lucide-react";

export function RouteList() {
  const {
    routes,
    selectedRouteId,
    setSelectedRouteId,
    setHoveredRouteId,
    loading,
    error
  } = useTransit();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground">Loading routes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl text-center">
        <span className="text-xs text-destructive font-medium">Failed to load routes</span>
        <p className="text-[10px] text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5" role="tablist" aria-label="Available Routes">
      {routes.map((route) => {
        const isHovered = false; // state handled by hover hooks
        const isSelected = selectedRouteId === route.id;

        return (
          <div
            key={route.id}
            role="tab"
            aria-selected={isSelected}
            tabIndex={0}
            onClick={() => setSelectedRouteId(isSelected ? null : route.id)}
            onMouseEnter={() => setHoveredRouteId(route.id)}
            onMouseLeave={() => setHoveredRouteId(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedRouteId(isSelected ? null : route.id);
              }
            }}
            className={`
              group relative flex items-center justify-between p-3.5 
              bg-card border rounded-xl cursor-pointer select-none
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
              hover:border-border hover:shadow-md hover:bg-muted/50
              ${isSelected 
                ? "border-primary/45 bg-primary/5 ring-1 ring-primary/25 shadow-sm" 
                : "border-border shadow-sm"
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* Route Badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm tracking-tight text-white shrink-0 shadow-sm"
                style={{ backgroundColor: route.color }}
              >
                {route.shortName}
              </div>

              {/* Names */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {route.longName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                  {route.description}
                </span>
              </div>
            </div>

            {/* Action Arrow */}
            <div className="text-muted-foreground hover:text-foreground shrink-0 pl-2">
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RouteList;
