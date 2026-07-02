"use client";

import React, { useState, useEffect } from "react";
import { NavigationRail } from "@/shared/components/layout/NavigationRail";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { RightPanel } from "@/shared/components/layout/RightPanel";
import { MapContainer } from "@/features/map/components/MapContainer";
import { zIndex } from "@/design/zIndex";
import { colors } from "@/design/colors";

export function AppShell({ children }) {
  // Navigation active tab
  const [activeSection, setActiveSection] = useState("map");
  // Sidebar state
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  // Selected transit asset for Inspector Right Panel
  const [activeItem, setActiveItem] = useState(null);
  const [isRightPanelOpen, setRightPanelOpen] = useState(false);
  // Simple layout theme
  const [theme, setTheme] = useState("light");

  // Sync right panel open state with item selection
  const handleSelectActiveItem = (item) => {
    setActiveItem(item);
    setRightPanelOpen(!!item);
  };

  // Handle theme body classes
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${colors.background} ${theme}`}>
      {/* Left Navigation Rail (Desktop/Tablet) or Bottom Nav (Mobile) */}
      <NavigationRail
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-row h-full overflow-hidden relative">

        {/* Collapsible Left Sidebar */}
        <Sidebar
          activeSection={activeSection}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Central Map Workspace */}
        <main className="flex-1 h-full relative overflow-hidden flex flex-col">
          <MapContainer setActiveItem={handleSelectActiveItem} />
          {children}
        </main>

        {/* Right Details Panel */}
        <RightPanel
          activeItem={activeItem}
          setActiveItem={handleSelectActiveItem}
          isRightPanelOpen={isRightPanelOpen}
          setRightPanelOpen={setRightPanelOpen}
        />

      </div>
    </div>
  );
}

export default AppShell;
