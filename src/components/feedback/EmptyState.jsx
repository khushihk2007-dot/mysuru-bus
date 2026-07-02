/**
 * @file EmptyState.jsx
 * @description Customizable and pre-styled EmptyState variants for missing assets or network failures.
 */

import React from "react";
import { Compass, MapPin, Star, Search, BellOff, BarChart2, WifiOff, AlertTriangle, Hammer, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Core EmptyState Layout
export const EmptyState = ({
  icon: Icon = Compass,
  title = "No data available",
  description = "There is nothing to display here at the moment.",
  actionButton,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center h-full min-h-[240px] w-full bg-card rounded-lg border border-dashed border-border/80 animate-in fade-in duration-200 select-none",
        className
      )}
      {...props}
    >
      <div className="p-3.5 bg-secondary rounded-full mb-3 text-text-secondary shadow-sm">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-[240px] leading-relaxed mb-4">{description}</p>
      {actionButton && <div className="flex justify-center">{actionButton}</div>}
    </div>
  );
};

// 1. No Routes
export const NoRoutesState = ({ actionButton, ...props }) => (
  <EmptyState
    icon={Compass}
    title="No Transit Routes Active"
    description="There are currently no active bus routes mapped in this area. Check later during schedules."
    actionButton={actionButton}
    {...props}
  />
);

// 2. No Stops
export const NoStopsState = ({ actionButton, ...props }) => (
  <EmptyState
    icon={MapPin}
    title="No Transit Stops Found"
    description="We couldn't locate any transit stops near the current selection or search coordinates."
    actionButton={actionButton}
    {...props}
  />
);

// 3. No Search Results
export const NoSearchResultsState = ({ query, actionButton, ...props }) => (
  <EmptyState
    icon={Search}
    title="No Match Found"
    description={query ? `No matching active routes, vehicles, or stops found for "${query}".` : "No results matched your current search filters."}
    actionButton={actionButton}
    {...props}
  />
);

// 4. No Favorites
export const NoFavoritesState = ({ actionButton, ...props }) => (
  <EmptyState
    icon={Star}
    title="No Saved Favorites"
    description="Star your frequently monitored bus lines, stops, or fleets to display them here."
    actionButton={actionButton}
    {...props}
  />
);

// 5. No Notifications
export const NoNotificationsState = ({ actionButton, ...props }) => (
  <EmptyState
    icon={BellOff}
    title="All Clear"
    description="You have no notifications or service alerts. Fleet is operating on normal schedule."
    actionButton={actionButton}
    {...props}
  />
);

// 6. No Activity
export const NoActivityState = ({ actionButton, ...props }) => (
  <EmptyState
    icon={BarChart2}
    title="No Logs Logged"
    description="Activity logs are empty. Start route tracking sessions to view fleet history."
    actionButton={actionButton}
    {...props}
  />
);

// 7. No Internet
export const NoInternetState = ({ onRetry, ...props }) => (
  <EmptyState
    icon={WifiOff}
    title="Connection Interrupted"
    description="Your device appears offline. Real-time satellite tracking suspended until signal returns."
    actionButton={
      onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Connection</span>
        </button>
      )
    }
    {...props}
  />
);

// 8. Server Error
export const ServerErrorState = ({ onRefresh, ...props }) => (
  <EmptyState
    icon={AlertTriangle}
    title="Database Query Error"
    description="Failed to retrieve latest live feed from transit telemetry. Please refresh."
    actionButton={
      onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-danger text-white text-xs font-semibold hover:bg-danger/90 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reload Feed</span>
        </button>
      )
    }
    {...props}
  />
);

// 9. Maintenance
export const MaintenanceState = ({ ...props }) => (
  <EmptyState
    icon={Hammer}
    title="Scheduled Maintenance"
    description=" Mysore Transit APIs are undergoing schema upgrades. Services resume shortly."
    {...props}
  />
);
