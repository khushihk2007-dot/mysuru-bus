"use client";

import React from "react";
import { useTransit } from "@/features/transit/context/TransitContext";

/**
 * RouteSelector
 * Reusable dropdown component allowing users to select routes dynamically.
 * Integrates with TransitContext.
 *
 * @param {object} props
 * @param {string} [props.className] - Optional container classes.
 */
export function RouteSelector({ className = "" }) {
  const { routes, selectedRouteId, setSelectedRouteId } = useTransit();

  return (
    <div className={`flex flex-col gap-1 ${className}`} role="group" aria-label="Route selector dropdown">
      <label
        htmlFor="route-dropdown-select"
        className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
      >
        Select Route Filter
      </label>
      <select
        id="route-dropdown-select"
        value={selectedRouteId || ""}
        onChange={(e) => setSelectedRouteId(e.target.value || null)}
        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <option value="">Show All Active Fleet</option>
        {routes.map((route) => (
          <option key={route.id} value={route.id}>
            Route {route.shortName}: {route.longName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RouteSelector;
