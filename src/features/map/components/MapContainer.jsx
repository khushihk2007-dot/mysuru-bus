import React from "react";
import { Compass, Globe } from "lucide-react";
import { FloatingSearch } from "@/shared/components/layout/FloatingSearch";
import { MapControls } from "./MapControls";
import { BottomActivityBar } from "@/shared/components/layout/BottomActivityBar";
import { zIndex } from "@/design/zIndex";

export function MapContainer({ setActiveItem }) {
  // Simulating item clicks on the map placeholder for testing context panels
  const triggerMapSelection = (id) => {
    if (setActiveItem) {
      setActiveItem(id);
    }
  };

  return (
    <div 
      className={`relative flex-1 h-full bg-muted/30 flex items-center justify-center overflow-hidden border-r border-border select-none ${zIndex.map}`}
      aria-label="Transit Map Canvas"
    >
      {/* Floating Elements on Top of Map */}
      <FloatingSearch />
      
      <MapControls />
      
      <BottomActivityBar />

      {/* Map Placeholder Content */}
      <div className="text-center p-8 max-w-sm flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10 animate-pulse">
            <Globe className="w-10 h-10 text-primary/50" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-card border border-border rounded-full flex items-center justify-center shadow-sm">
            <Compass className="w-4.5 h-4.5 text-muted-foreground animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>
        
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Mysuru Transit Live Map</h2>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          The interactive map, route visualization, and real-time vehicle telemetry layers will be integrated in Phase 4.
        </p>

        {/* Action triggers to test detail panel activation */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => triggerMapSelection("bus-route-10A")}
            className="px-2.5 py-1.5 bg-card border border-border text-[10px] font-medium rounded-lg hover:bg-muted active:scale-95 transition-all shadow-sm"
          >
            Inspect Route 10A
          </button>
          <button 
            onClick={() => triggerMapSelection("stop-court-house")}
            className="px-2.5 py-1.5 bg-card border border-border text-[10px] font-medium rounded-lg hover:bg-muted active:scale-95 transition-all shadow-sm"
          >
            Inspect Court House Stop
          </button>
        </div>
      </div>
      
      {/* Grid Pattern Background to Simulate Map Coordinates */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
    </div>
  );
}
export default MapContainer;
