import React from "react";
import { Plus, Minus, Navigation, Compass, Layers, Milestone, Maximize } from "lucide-react";
import { zIndex } from "@/design/zIndex";
import { radius } from "@/design/radius";
import { shadows } from "@/design/shadows";

export function MapControls() {
  const controlGroups = [
    [
      { icon: Plus, label: "Zoom In" },
      { icon: Minus, label: "Zoom Out" },
    ],
    [
      { icon: Navigation, label: "Locate Me" },
      { icon: Compass, label: "Compass orientation" },
    ],
    [
      { icon: Layers, label: "Map Layers" },
      { icon: Milestone, label: "Traffic Information" },
      { icon: Maximize, label: "Toggle Fullscreen" },
    ],
  ];

  return (
    <div
      className={`absolute right-4 top-20 md:top-24 flex flex-col gap-3 ${zIndex.controls}`}
      aria-label="Map Utilities"
    >
      {controlGroups.map((group, groupIdx) => (
        <div
          key={groupIdx}
          className={`flex flex-col bg-card border border-border ${radius.lg} ${shadows.md} overflow-hidden`}
        >
          {group.map((control, controlIdx) => {
            const Icon = control.icon;
            return (
              <button
                key={controlIdx}
                aria-label={control.label}
                className="relative group flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted-foreground/10 transition-colors border-b border-border last:border-b-0"
              >
                <Icon className="w-4.5 h-4.5" />
                
                {/* Right Tooltip */}
                <span className="absolute right-11 hidden group-hover:block bg-foreground text-background text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                  {control.label}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
