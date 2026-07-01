import React from "react";
import { Map, Route, MapPin, Search, Star, BarChart3, Settings, Moon, Sun, Menu } from "lucide-react";
import { colors } from "@/design/colors";
import { zIndex } from "@/design/zIndex";
import { radius } from "@/design/radius";

export function NavigationRail({ activeSection, setActiveSection, theme, toggleTheme, isSidebarOpen, setSidebarOpen }) {
  const items = [
    { id: "map", label: "Live Map", icon: Map },
    { id: "routes", label: "Routes", icon: Route },
    { id: "stops", label: "Stops", icon: MapPin },
    { id: "search", label: "Search", icon: Search },
    { id: "favorites", label: "Favorites", icon: Star },
    { id: "analytics", label: "Analytics", icon: BarChart3, disabled: true },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop/Tablet Left Rail */}
      <nav
        className={`hidden md:flex flex-col justify-between items-center h-full w-[76px] py-4 bg-card border-r border-border ${zIndex.rail}`}
        aria-label="Main Navigation Rail"
      >
        {/* Top: Brand Logo */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl" title="Mysuru Transit">
            <span className="text-primary font-bold text-lg select-none">M</span>
          </div>
          
          {/* Nav Items */}
          <div className="flex flex-col gap-2 w-full px-2" role="tablist" aria-label="Navigation Sections">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={item.label}
                  disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : 0}
                  onClick={() => {
                    if (item.disabled) return;
                    setActiveSection(item.id);
                    if (item.id !== "map" && !isSidebarOpen) {
                      setSidebarOpen(true);
                    }
                  }}
                  className={`relative group flex items-center justify-center w-12 h-12 ${radius.lg} transition-all duration-150
                    ${item.disabled 
                      ? "opacity-35 cursor-not-allowed text-muted-foreground" 
                      : isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <span className="absolute left-[64px] hidden group-hover:block bg-foreground text-background text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50 transition-opacity">
                    {item.label} {item.disabled && "(Coming soon)"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom: Utilities */}
        <div className="flex flex-col items-center gap-4 w-full px-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="flex items-center justify-center w-12 h-12 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Profile Avatar */}
          <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold cursor-pointer hover:border-primary/50 transition-colors" title="User Profile">
            KA
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4 pb-safe ${zIndex.rail}`}
        aria-label="Mobile Navigation"
      >
        {items.filter(item => !item.disabled).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id !== "map" && !isSidebarOpen) {
                  setSidebarOpen(true);
                }
              }}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors
                ${isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
