/**
 * @file SidebarSection.jsx
 * @description Renders the contextual menu details inside the main sidebar panel.
 * Connects transit routes, stops, and selections into the layout.
 */

import React from "react";
import { EmptyState } from "./EmptyState";
import { PageHeader } from "./PageHeader";
import { SectionCard } from "./SectionCard";
import { MapPin, Route, Star, Search, Info, Sliders } from "lucide-react";
import { useTransit } from "@/features/transit/context/TransitContext";
import { RouteList } from "@/features/transit/components/RouteList";
import { RouteDetails } from "@/features/transit/components/RouteDetails";

export function SidebarSection({ activeSection, onSelectStop }) {
  const {
    selectedRouteId,
    layerVisibility,
    toggleLayerVisibility,
    layerOpacity,
    setLayerOpacity
  } = useTransit();

  switch (activeSection) {
    case "routes":
      return (
        <div className="flex flex-col h-full space-y-4">
          <PageHeader
            title={selectedRouteId ? "Route Inspector" : "Transit Routes"}
            description={selectedRouteId ? "Detailed inspect view of the bus line" : "Browse available bus lines in Mysuru"}
          />
          <div className="flex-1 overflow-y-auto pr-1">
            {selectedRouteId ? (
              <RouteDetails onSelectStop={onSelectStop} />
            ) : (
              <RouteList />
            )}
          </div>
        </div>
      );

    case "stops":
      return (
        <div className="flex flex-col h-full space-y-4">
          <PageHeader title="Stops & Stations" description="Find physical stations and ETAs" />
          <div className="flex-1 overflow-y-auto pr-1">
            {selectedRouteId ? (
              <RouteDetails onSelectStop={onSelectStop} />
            ) : (
              <div className="space-y-4">
                <SectionCard className="p-4 border-dashed border-2 flex items-center justify-center min-h-[120px]">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Select a route in the &quot;Routes&quot; tab to inspect its stop timeline and coordinate sequence.</p>
                  </div>
                </SectionCard>
                <EmptyState title="No stops inspected" description="Click on routes to see their individual stop listings." icon={MapPin} />
              </div>
            )}
          </div>
        </div>
      );

    case "search":
      return (
        <div className="flex flex-col h-full space-y-4">
          <PageHeader title="Search Queries" description="Recent and suggested search parameters" />
          <div className="flex-1 overflow-y-auto pr-1">
            <EmptyState title="No recent searches" description="Type in the search bar above to look for buses or routes." icon={Search} />
          </div>
        </div>
      );

    case "favorites":
      return (
        <div className="flex flex-col h-full space-y-4">
          <PageHeader title="Favorites" description="Pinned routes and stops for quick access" />
          <div className="flex-1 overflow-y-auto pr-1">
            <EmptyState title="Favorites list is empty" description="Star routes and stops to keep track of them here." icon={Star} />
          </div>
        </div>
      );

    case "settings":
      return (
        <div className="flex flex-col h-full space-y-4">
          <PageHeader title="GIS Settings" description="Customize map layers, opacity, and rendering" />
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            <SectionCard>
              <div className="flex items-center gap-2 mb-3">
                <Sliders className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">GIS Layer Manager</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Toggle visibility and control opacities of transit overlays.</p>
              
              {/* Layer Controls */}
              <div className="space-y-4 text-xs">
                {/* Routes Layer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Show Route Lines</span>
                    <input
                      type="checkbox"
                      checked={layerVisibility.routes}
                      onChange={() => toggleLayerVisibility("routes")}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </div>
                  {layerVisibility.routes && (
                    <div className="flex items-center gap-3 pl-1">
                      <span className="text-[10px] text-muted-foreground w-12">Opacity</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={layerOpacity.routes}
                        onChange={(e) => setLayerOpacity("routes", parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-[10px] text-muted-foreground w-6 text-right">
                        {Math.round(layerOpacity.routes * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Stops Layer */}
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Show Station Stops</span>
                    <input
                      type="checkbox"
                      checked={layerVisibility.stops}
                      onChange={() => toggleLayerVisibility("stops")}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </div>
                  {layerVisibility.stops && (
                    <div className="flex items-center gap-3 pl-1">
                      <span className="text-[10px] text-muted-foreground w-12">Opacity</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={layerOpacity.stops}
                        onChange={(e) => setLayerOpacity("stops", parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-[10px] text-muted-foreground w-6 text-right">
                        {Math.round(layerOpacity.stops * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Stop Labels Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="font-medium">Show Station Labels</span>
                  <input
                    type="checkbox"
                    disabled={!layerVisibility.stops}
                    checked={layerVisibility.labels}
                    onChange={() => toggleLayerVisibility("labels")}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col h-full items-center justify-center text-center p-6">
          <Info className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h2 className="text-sm font-semibold mb-1">Select a Section</h2>
          <p className="text-xs text-muted-foreground max-w-[200px]">Use the left rail navigation to browse different panels.</p>
        </div>
      );
  }
}

export default SidebarSection;
