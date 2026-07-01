import React from "react";
import { Search, SlidersHorizontal, Mic } from "lucide-react";
import { zIndex } from "@/design/zIndex";
import { radius } from "@/design/radius";
import { shadows } from "@/design/shadows";

export function FloatingSearch() {
  return (
    <div
      className={`absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[480px] bg-card border border-border ${radius.xl} ${shadows.md} ${zIndex.floatingSearch} flex items-center gap-3 px-4 py-2.5 transition-all duration-200 hover:border-border/80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary`}
    >
      <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
      
      <input
        type="text"
        placeholder="Search routes, buses or stops..."
        className="w-full bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground/70"
        aria-label="Search transit platform"
      />

      {/* Shortcut Indicator */}
      <span className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground border border-border rounded bg-muted/50 select-none">
        ⌘K
      </span>

      <div className="h-4 w-px bg-border shrink-0" />

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          aria-label="Filter results"
          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <button
          aria-label="Voice search"
          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
