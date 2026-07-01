import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SidebarSection } from "./SidebarSection";
import { zIndex } from "@/design/zIndex";
import { shadows } from "@/design/shadows";

export function Sidebar({ activeSection, isSidebarOpen, setSidebarOpen }) {
  // If activeSection is 'map', we should close the sidebar contextually or keep it hidden.
  const isHidden = !isSidebarOpen || activeSection === "map";

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full bg-card border-r border-border relative transition-all duration-300 ease-in-out select-none
          ${isHidden ? "w-0 overflow-hidden opacity-0 border-r-0" : "w-[340px] opacity-100"} ${zIndex.sidebar}`}
        aria-label="Contextual panel"
      >
        <div className="flex-1 flex flex-col h-full p-5 overflow-hidden">
          {/* Scrollable Container for Sidebar Modules */}
          <div className="flex-1 overflow-y-auto pr-1">
            <SidebarSection activeSection={activeSection} />
          </div>
        </div>

        {/* Toggle Collapse Button (floating at the edge) */}
        {activeSection !== "map" && (
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className={`absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center cursor-pointer shadow-sm hover:bg-muted hover:text-foreground transition-all duration-150 z-50`}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </aside>

      {/* Mobile Drawer (Bottom Sheet) */}
      {isSidebarOpen && activeSection !== "map" && (
        <div className="md:hidden fixed inset-x-0 bottom-16 bg-card border-t border-border rounded-t-2xl max-h-[70vh] flex flex-col z-30 transition-transform duration-300 ease-out shadow-lg">
          {/* Handle bar */}
          <div className="w-12 h-1 bg-border rounded-full mx-auto my-3" />
          
          <div className="flex items-center justify-between px-5 pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {activeSection} details
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close drawer"
              className="p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <SidebarSection activeSection={activeSection} />
          </div>
        </div>
      )}
    </>
  );
}
