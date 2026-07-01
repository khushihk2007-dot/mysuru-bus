import React, { useState } from "react";
import { AlertCircle, ChevronUp, ChevronDown, Bell } from "lucide-react";
import { zIndex } from "@/design/zIndex";
import { radius } from "@/design/radius";
import { shadows } from "@/design/shadows";

export function BottomActivityBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`absolute bottom-4 left-4 right-4 md:left-6 md:right-6 bg-card border border-border ${radius.lg} ${shadows.md} ${zIndex.controls} transition-all duration-300 ease-in-out`}
      aria-label="Activity Alerts"
    >
      {/* Header bar / Collapsed layout */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-5 h-5 bg-muted rounded-full">
            <Bell className="w-3 h-3 text-muted-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">Live Transit Updates</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
            All Systems Operational
          </span>
        </div>
        <button
          aria-label={isOpen ? "Collapse panel" : "Expand panel"}
          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded panel details */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[160px] border-t border-border opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-4 flex flex-col gap-3">
          <div className="flex gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Upcoming schedule updates</p>
              <p className="text-muted-foreground mt-0.5">Route mapping modifications will take effect starting next Monday. No delays are expected.</p>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground border-t border-border pt-2 flex items-center justify-between">
            <span>Last checked: Just now</span>
            <span className="cursor-pointer text-primary hover:underline">Dismiss warnings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
