/**
 * @file Lists.jsx
 * @description List views (Bus list, Route list, Stop list, Search Results list, Activity feed, Notifications, and Favorites list).
 */

import React from "react";
import { Star, Bell, Info, ShieldAlert, ArrowRight, MapPin, Bus as BusIcon, Route as RouteIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../feedback/Badge";

// 1. Bus List
export const BusList = ({ buses = [], activeBusId, onSelectBus, className }) => {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {buses.map((bus) => {
        const isActive = bus.vehicleId === activeBusId;
        return (
          <button
            key={bus.vehicleId}
            onClick={() => onSelectBus && onSelectBus(bus.vehicleId)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer",
              isActive && "border-primary bg-primary/5 hover:bg-primary/10"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded text-text-secondary">
                <BusIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono font-bold text-sm text-text-primary">{bus.vehicleId}</span>
                  <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.25 text-text-secondary rounded">
                    {bus.routeCode}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate max-w-[150px]">Next: {bus.nextStop}</p>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-xs font-mono font-semibold text-text-primary">{bus.speed} km/h</span>
              <span className={cn("text-[9px] font-bold uppercase", bus.delay <= 0 ? "text-success" : "text-warning")}>
                {bus.delay <= 0 ? "On Time" : `+${bus.delay}m delay`}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// 2. Route List
export const RouteList = ({ routes = [], activeRouteCode, onSelectRoute, className }) => {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {routes.map((rt) => {
        const isActive = rt.code === activeRouteCode;
        return (
          <button
            key={rt.code}
            onClick={() => onSelectRoute && onSelectRoute(rt.code)}
            className={cn(
              "flex flex-col gap-2 p-3 rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer",
              isActive && "border-primary bg-primary/5 hover:bg-primary/10"
            )}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-sm"
                  style={{ backgroundColor: `var(${rt.routeColorVar || "--route-8"})` }}
                >
                  {rt.code}
                </span>
                <span className="text-xs font-bold text-text-primary truncate max-w-[160px]">{rt.name}</span>
              </div>
              <span className="text-[9px] font-semibold text-text-muted">{rt.activeVehicles} active</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary select-text">
              <span className="truncate">{rt.startStop}</span>
              <ArrowRight className="h-3 w-3 text-text-muted shrink-0" />
              <span className="truncate">{rt.endStop}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// 3. Stop List
export const StopList = ({ stops = [], activeStopId, onSelectStop, className }) => {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {stops.map((stop) => {
        const isActive = stop.id === activeStopId;
        return (
          <button
            key={stop.id}
            onClick={() => onSelectStop && onSelectStop(stop.id)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer",
              isActive && "border-primary bg-primary/5 hover:bg-primary/10"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded text-text-secondary">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-text-primary block truncate max-w-[180px]">
                  {stop.stopName}
                </span>
                <span className="text-[10px] font-mono text-text-muted">Code: {stop.code}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 text-text-secondary rounded shrink-0">
              {stop.upcomingRoutesCount} lines
            </span>
          </button>
        );
      })}
    </div>
  );
};

// 4. Search Result List
export const SearchResultList = ({ results = [], onSelectResult, className }) => {
  const getIcon = (type) => {
    switch (type) {
      case "route": return <RouteIcon className="h-4 w-4 text-primary" />;
      case "stop": return <MapPin className="h-4 w-4 text-success" />;
      case "vehicle": return <BusIcon className="h-4 w-4 text-info" />;
      default: return <MapPin className="h-4 w-4 text-text-muted" />;
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {results.map((res, idx) => (
        <button
          key={idx}
          onClick={() => onSelectResult && onSelectResult(res)}
          className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <div className="p-1.5 bg-secondary rounded text-text-secondary shrink-0">
            {getIcon(res.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-xs text-text-primary truncate">{res.title}</span>
              <span className="text-[9px] uppercase font-bold text-text-muted shrink-0 ml-2">{res.type}</span>
            </div>
            <p className="text-[11px] text-text-muted truncate mt-0.5">{res.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

// 5. Activity List
export const ActivityList = ({ activities = [], className }) => {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {activities.map((act, idx) => (
        <div key={idx} className="p-3 rounded-lg border border-border bg-card flex gap-3 text-left">
          <div className="p-1.5 bg-secondary rounded text-text-muted self-start shrink-0">
            <Info className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-xs font-semibold text-text-primary truncate">{act.message}</span>
              <span className="text-[9px] font-mono text-text-muted shrink-0">{act.time}</span>
            </div>
            {act.details && <p className="text-[11px] text-text-muted leading-snug">{act.details}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

// 6. Notification List
export const NotificationList = ({ notifications = [], onDismiss, className }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case "danger": return <ShieldAlert className="h-4 w-4 text-danger" />;
      case "warning": return <ShieldAlert className="h-4 w-4 text-warning" />;
      default: return <Bell className="h-4 w-4 text-info" />;
    }
  };

  return (
    <div className={cn("flex flex-col gap-2.5 w-full", className)}>
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="p-3 rounded-lg border border-border bg-card flex gap-3 text-left relative group animate-in fade-in duration-200"
        >
          <div className="mt-0.5 shrink-0">{getAlertIcon(notif.type)}</div>
          <div className="flex-1 min-w-0 pr-4">
            <span className="text-xs font-bold text-text-primary block leading-none">{notif.title}</span>
            <p className="text-[11px] text-text-muted mt-1 leading-snug">{notif.description}</p>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(notif.id)}
              className="absolute right-2 top-2 p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// 7. Favorites List
export const FavoritesList = ({ items = [], onRemoveFavorite, onSelect, className }) => {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {items.map((fav) => (
        <div
          key={fav.id}
          className="p-3 rounded-lg border border-border bg-card flex items-center justify-between gap-3 text-left group hover:border-border-strong transition-all"
        >
          <button
            type="button"
            onClick={() => onSelect && onSelect(fav)}
            className="flex items-center gap-3 flex-1 min-w-0 focus:outline-none"
          >
            <div className="p-2 bg-warning/10 text-warning rounded shrink-0">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-text-primary block truncate">{fav.title}</span>
              <span className="text-[10px] text-text-muted uppercase font-semibold">{fav.type}</span>
            </div>
          </button>
          
          {onRemoveFavorite && (
            <button
              type="button"
              onClick={() => onRemoveFavorite(fav.id)}
              className="p-1 rounded text-text-muted hover:text-danger hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
