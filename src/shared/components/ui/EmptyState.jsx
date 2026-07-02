import React from "react";
import { Compass, MapPin, Star, Search, BellOff, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Core EmptyState Component
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
        "flex flex-col items-center justify-center p-8 text-center h-full min-h-[250px] w-full bg-card rounded-lg border border-dashed border-border/80 animate-in fade-in duration-200",
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

// Specialized Empty State Presets

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

// 3. No Favorites
export const NoFavoritesState = ({ actionButton, ...props }) => (
  <EmptyState
    icon={Star}
    title="No Saved Favorites"
    description="Star your frequently monitored bus lines, stops, or fleets to display them here."
    actionButton={actionButton}
    {...props}
  />
);

// 4. No Search Results
export const NoSearchResultsState = ({ query, actionButton, ...props }) => (
  <EmptyState
    icon={Search}
    title="No Match Found"
    description={query ? `No matching active routes, vehicles, or stops found for "${query}".` : "No results matched your current search filters."}
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

// 6. No Analytics
export const NoAnalyticsState = ({ actionButton, ...props }) => (
  <EmptyState
    icon={BarChart2}
    title="No Analytics Data"
    description="Analytical logs are empty. Start route tracking sessions to generate reports."
    actionButton={actionButton}
    {...props}
  />
);
