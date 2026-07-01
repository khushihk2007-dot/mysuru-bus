import React from "react";
import { EmptyState } from "./EmptyState";
import { PageHeader } from "./PageHeader";
import { SectionCard } from "./SectionCard";
import { MapPin, Route, Star, Search, Info } from "lucide-react";

export function SidebarSection({ activeSection }) {
  switch (activeSection) {
    case "routes":
      return (
        <div className="flex flex-col h-full">
          <PageHeader title="Transit Routes" description="Browse available routes and timetables" />
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <SectionCard className="p-4 border-dashed border-2 flex items-center justify-center min-h-[120px]">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Select a route on the map or search above to view details</p>
              </div>
            </SectionCard>
            <EmptyState title="No active routes selected" description="Search for routes to see schedules and timings." icon={Route} />
          </div>
        </div>
      );
    case "stops":
      return (
        <div className="flex flex-col h-full">
          <PageHeader title="Stops & Stations" description="Find physical stations and real-time ETAs" />
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <EmptyState title="No stops selected" description="Find stops on the map to view incoming buses." icon={MapPin} />
          </div>
        </div>
      );
    case "search":
      return (
        <div className="flex flex-col h-full">
          <PageHeader title="Search Queries" description="Recent and suggested search parameters" />
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <EmptyState title="No recent searches" description="Type in the search bar above to look for buses or routes." icon={Search} />
          </div>
        </div>
      );
    case "favorites":
      return (
        <div className="flex flex-col h-full">
          <PageHeader title="Favorites" description="Pinned routes and stops for quick access" />
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <EmptyState title="Favorites list is empty" description="Star routes and stops to keep track of them here." icon={Star} />
          </div>
        </div>
      );
    case "settings":
      return (
        <div className="flex flex-col h-full">
          <PageHeader title="Settings" description="Customize map layers, theme, and profile details" />
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <SectionCard>
              <h3 className="text-sm font-semibold mb-2">Display Settings</h3>
              <p className="text-xs text-muted-foreground mb-4">Choose how markers and routes are rendered on the map.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs py-1 border-b border-border">
                  <span>Show traffic data</span>
                  <span className="text-muted-foreground">Disabled</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span>High density mode</span>
                  <span className="text-muted-foreground">Enabled</span>
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
