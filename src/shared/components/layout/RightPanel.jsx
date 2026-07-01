import React from "react";
import { EmptyState } from "./EmptyState";
import { SectionCard } from "./SectionCard";
import { PageHeader } from "./PageHeader";
import { Info, Clock, Route, Activity, X } from "lucide-react";
import { zIndex } from "@/design/zIndex";
import { radius } from "@/design/radius";

export function RightPanel({ activeItem, setActiveItem, isRightPanelOpen, setRightPanelOpen }) {
  // If panel is hidden, we handle transitions
  const isHidden = !isRightPanelOpen;

  return (
    <>
      {/* Desktop Right Context Panel */}
      <aside
        className={`hidden lg:flex flex-col h-full w-[320px] bg-card border-l border-border relative transition-all duration-300 ease-in-out
          ${isHidden ? "w-0 overflow-hidden opacity-0 border-l-0" : "opacity-100"} ${zIndex.sidebar}`}
        aria-label="Details panel"
      >
        <div className="flex-1 flex flex-col h-full p-5 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {!activeItem ? (
              <EmptyState 
                title="No item selected" 
                description="Select a route, stop, or live vehicle to display details." 
                icon={Info} 
              />
            ) : (
              <div className="space-y-4">
                <PageHeader 
                  title="Context Details" 
                  description="Detailed inspection of the active transit asset"
                  actions={
                    <button 
                      onClick={() => setActiveItem(null)} 
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  } 
                />

                <SectionCard>
                  <div className="flex items-center gap-2 mb-3">
                    <Route className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asset Information</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Bus Stop ID: {activeItem}</p>
                    <p className="text-xs text-muted-foreground mt-1">Real-time telemetry and ETA predictions will populate here.</p>
                  </div>
                </SectionCard>

                <SectionCard>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</span>
                  </div>
                  <p className="text-xs text-muted-foreground">No recent schedules available.</p>
                </SectionCard>

                <SectionCard>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Activity</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Waiting for telemetry ping...</p>
                </SectionCard>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Tablet Drawer (Right overlay) */}
      {!isHidden && (
        <div className={`hidden md:flex lg:hidden fixed inset-y-0 right-0 w-[320px] bg-card border-l border-border shadow-2xl flex-col p-5 z-40 transition-transform duration-300`}>
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <span className="text-sm font-semibold">Inspect Panel</span>
            <button onClick={() => setActiveItem(null)} className="p-1 rounded-full hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <EmptyState title="Context Inspect" description="Select a vehicle or station to begin tracking." icon={Info} />
          </div>
        </div>
      )}

      {/* Mobile Drawer (Bottom sheet context) */}
      {!isHidden && (
        <div className="md:hidden fixed inset-x-0 bottom-16 bg-card border-t border-border rounded-t-2xl max-h-[50vh] flex flex-col z-35 shadow-lg">
          <div className="w-12 h-1 bg-border rounded-full mx-auto my-3" />
          <div className="flex items-center justify-between px-5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset Details</span>
            <button onClick={() => setActiveItem(null)} className="p-1 rounded-full hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <EmptyState title="Inspector" description="Visual stats will sit here." icon={Info} />
          </div>
        </div>
      )}
    </>
  );
}
