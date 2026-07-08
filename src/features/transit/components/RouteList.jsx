/**
 * @file RouteList.jsx
 * @description List view of all available transit routes.
 * Handles mouse hovers and clicks to sync with map visual highlights.
 */

"use client";

import React from "react";
import { useTransit } from "../context/TransitContext";
import { ArrowRight } from "lucide-react";
import { RouteSelector } from "@/components/map/RouteSelector";

import { Skeleton, Spinner } from "@/shared/components/ui/Loading";
import { NoRoutesState } from "@/shared/components/ui/EmptyState";

export function RouteList() {
  const {
    routes,
    selectedRouteId,
    setSelectedRouteId,
    setHoveredRouteId,
    loading,
    error,
    handleRetry
  } = useTransit();

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-1">
        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2 py-4">
          <Spinner size="sm" />
          <span className="text-xs text-muted-foreground font-medium">Syncing active transit lines...</span>
        </div>
        {/* Skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 border border-border/60 bg-card rounded-xl">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3 rounded" />
              <Skeleton className="h-2.5 w-2/3 rounded" />
            </div>
            <Skeleton className="w-4 h-4 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-destructive/15 bg-destructive/5 rounded-xl text-center flex flex-col items-center gap-3">
        <span className="text-xs text-destructive font-bold uppercase tracking-wider">Network Request Failed</span>
        <p className="text-[10px] text-muted-foreground leading-normal max-w-[200px]">
          {error.message || "Failed to reach backend services. Please verify your connection."}
        </p>
        <button
          onClick={handleRetry}
          className="bg-destructive hover:bg-destructive/90 text-white font-semibold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <NoRoutesState
        actionButton={
          <button
            onClick={handleRetry}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
          >
            Retry Fetch
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5" role="tablist" aria-label="Available Routes">
      <RouteSelector className="mb-2" />
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
