/**
 * @file Card.jsx
 * @description Transit dashboard card modules (Information, Statistics, Route, Bus, Stop, Depot, Analytics, Interactive, Hover, Glass, Feature, and Settings cards).
 */

import React from "react";
import { Info, Bus as BusIcon, TrendingUp, Settings, MapPin, Navigation, ArrowRight, Star, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Core Base Card layout wrappers
export const Card = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-4", className)} {...props}>
    {children}
  </div>
);
CardHeader.displayName = "CardHeader";

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn("text-base font-semibold leading-none tracking-tight text-text-primary", className)} {...props}>
    {children}
  </h3>
);
CardTitle.displayName = "CardTitle";

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn("text-xs text-text-muted", className)} {...props}>
    {children}
  </p>
);
CardDescription.displayName = "CardDescription";

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-4 pt-0", className)} {...props}>
    {children}
  </div>
);
CardContent.displayName = "CardContent";

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("flex items-center p-4 pt-0 border-t border-border/40 mt-3 justify-between", className)} {...props}>
    {children}
  </div>
);
CardFooter.displayName = "CardFooter";

// 2. Information Card
export const InformationCard = ({ title, description, icon = <Info className="h-4 w-4 text-primary" />, children, className, ...props }) => (
  <Card className={cn("border-l-4 border-l-primary", className)} {...props}>
    <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
      <div className="mt-0.5 p-1 rounded-sm bg-primary/10 text-primary">{icon}</div>
      <div className="flex-1">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription className="mt-1">{description}</CardDescription>}
      </div>
    </CardHeader>
    {children && <CardContent className="pt-2">{children}</CardContent>}
  </Card>
);

// 3. Statistics Card
export const StatisticsCard = ({ label, value, change, trend = "up", subtext, className, ...props }) => (
  <Card className={cn("bg-card", className)} {...props}>
    <CardContent className="p-4 flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-text-primary">{value}</span>
        {change && (
          <span
            className={cn(
              "text-xs font-semibold flex items-center",
              trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-text-muted"
            )}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && <span className="text-[10px] text-text-muted">{subtext}</span>}
    </CardContent>
  </Card>
);

// 4. Route Card
export const RouteCard = ({ routeCode, routeName, startStop, endStop, frequency, activeVehicles, routeColorVar = "--route-8", className, ...props }) => (
  <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)} {...props}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-sm text-xs font-mono font-bold text-white shadow-sm"
            style={{ backgroundColor: `var(${routeColorVar})` }}
          >
            {routeCode}
          </span>
          <CardTitle className="text-sm font-semibold truncate max-w-[150px]">{routeName}</CardTitle>
        </div>
        <span className="text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-sm">
          {activeVehicles} active
        </span>
      </div>
    </CardHeader>
    <CardContent className="text-xs pb-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-text-secondary">
        <MapPin className="h-3 w-3 text-text-muted shrink-0" />
        <span className="truncate">{startStop}</span>
        <ArrowRight className="h-3 w-3 text-text-muted shrink-0" />
        <span className="truncate">{endStop}</span>
      </div>
      <div className="text-[11px] text-text-muted">
        Frequency: Every {frequency} mins
      </div>
    </CardContent>
  </Card>
);

// 5. Bus Card
export const BusCard = ({ vehicleId, routeCode, status, speed, occupancy, nextStop, delay, className, ...props }) => (
  <Card className={cn("bg-card relative overflow-hidden", className)} {...props}>
    <div className="absolute top-0 left-0 w-full h-[3px] bg-success" />
    <CardContent className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BusIcon className="h-4 w-4 text-text-secondary" />
          <span className="text-sm font-mono font-bold text-text-primary">{vehicleId}</span>
          <span className="text-xs px-1.5 py-0.25 bg-secondary text-text-secondary rounded-sm font-mono">{routeCode}</span>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm",
            status === "moving" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 border-y border-border/40 py-2 text-xs">
        <div>
          <span className="text-[10px] text-text-muted block uppercase font-semibold">Speed</span>
          <span className="font-mono text-text-primary">{speed} km/h</span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted block uppercase font-semibold">Occupancy</span>
          <span className="font-mono text-text-primary">{occupancy}%</span>
        </div>
      </div>

      <div className="text-xs">
        <span className="text-[10px] text-text-muted block uppercase font-semibold">Next Stop</span>
        <span className="text-text-primary truncate block">{nextStop}</span>
      </div>

      {delay !== undefined && (
        <div className="flex justify-between items-center text-[11px] pt-1">
          <span className="text-text-muted">Delay status</span>
          <span className={cn("font-medium", delay <= 0 ? "text-success" : "text-warning")}>
            {delay <= 0 ? "On Time" : `+${delay} min`}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

// 6. Stop Card
export const StopCard = ({ stopName, code, upcomingArrivals = [], isFavorite, onToggleFavorite, className, ...props }) => (
  <Card className={cn("bg-card", className)} {...props}>
    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
      <div>
        <CardTitle className="text-sm font-semibold">{stopName}</CardTitle>
        <CardDescription className="font-mono mt-0.5">Code: {code}</CardDescription>
      </div>
      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className="p-1 rounded text-text-muted hover:text-warning transition-colors"
        >
          <Star className={cn("h-4 w-4", isFavorite && "fill-current text-warning")} />
        </button>
      )}
    </CardHeader>
    <CardContent className="pb-3 flex flex-col gap-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Upcoming arrivals</div>
      <div className="flex flex-col gap-1.5">
        {upcomingArrivals.map((arr, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.25 bg-secondary text-text-secondary rounded-sm font-mono text-[10px]">
                {arr.routeCode}
              </span>
              <span className="text-text-primary truncate max-w-[120px]">{arr.destination}</span>
            </div>
            <span className="font-mono text-primary font-semibold">{arr.time}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// 7. Depot Card
export const DepotCard = ({ depotName, capacity, currentFleetCount, managerName, contact, className, ...props }) => {
  const fillPercentage = (currentFleetCount / capacity) * 100;
  return (
    <Card className={cn("bg-card", className)} {...props}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold">{depotName}</CardTitle>
          <Layers className="h-4 w-4 text-text-muted" />
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex flex-col gap-3">
        <div className="text-xs flex flex-col gap-1">
          <div className="flex justify-between text-[11px] text-text-secondary">
            <span>Fleet Load ({currentFleetCount} / {capacity} buses)</span>
            <span className="font-mono font-semibold">{fillPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", fillPercentage > 90 ? "bg-danger" : "bg-primary")}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        <div className="border-t border-border/40 pt-2 text-[11px] flex justify-between text-text-muted">
          <span>Manager: {managerName}</span>
          <span className="font-mono">{contact}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// 8. Analytics Card
export const AnalyticsCard = ({ title, value, label, children, className, ...props }) => (
  <Card className={cn("bg-card", className)} {...props}>
    <CardHeader className="pb-1">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</CardTitle>
        <TrendingUp className="h-4 w-4 text-text-muted" />
      </div>
      <div className="mt-1">
        <span className="text-2xl font-bold tracking-tight text-text-primary">{value}</span>
        <span className="text-xs text-text-muted ml-1.5">{label}</span>
      </div>
    </CardHeader>
    <CardContent className="pt-2">
      <div className="w-full flex items-end gap-1 px-1 h-14">
        {children || (
          <>
            <div className="bg-primary/20 w-full h-[40%] rounded-sm hover:bg-primary transition-colors cursor-pointer" />
            <div className="bg-primary/20 w-full h-[60%] rounded-sm hover:bg-primary transition-colors cursor-pointer" />
            <div className="bg-primary/20 w-full h-[50%] rounded-sm hover:bg-primary transition-colors cursor-pointer" />
            <div className="bg-primary/30 w-full h-[80%] rounded-sm hover:bg-primary transition-colors cursor-pointer" />
            <div className="bg-primary/30 w-full h-[75%] rounded-sm hover:bg-primary transition-colors cursor-pointer" />
            <div className="bg-primary w-full h-[95%] rounded-sm hover:bg-primary transition-colors cursor-pointer" />
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

// 9. Interactive Card
export const InteractiveCard = React.forwardRef(({ className, children, onClick, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground p-4 shadow-sm cursor-pointer select-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-border-strong active:scale-[0.99] hover:bg-secondary/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
InteractiveCard.displayName = "InteractiveCard";

// 10. Hover Card
export const HoverCard = ({ children, className, ...props }) => (
  <div
    className={cn(
      "rounded-lg border border-border bg-card p-4 text-card-foreground shadow-md transition-all duration-150 animate-in fade-in slide-in-from-top-1 max-w-[280px] z-30",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// 11. Glass Card (Subtle translucent gradient)
export const GlassCard = ({ children, className, ...props }) => (
  <div
    className={cn(
      "rounded-lg border border-white/10 dark:border-white/5 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md shadow-sm p-4 text-text-primary",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// 12. Feature Card
export const FeatureCard = ({ title, description, icon = <ShieldCheck className="h-6 w-6 text-primary" />, actionText, onAction, className, ...props }) => (
  <Card className={cn("bg-card relative overflow-hidden p-5 flex flex-col gap-4 justify-between", className)} {...props}>
    <div className="flex gap-4">
      <div className="p-3 bg-primary/10 rounded-lg text-primary self-start shrink-0">{icon}</div>
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        <p className="text-xs text-text-muted leading-relaxed">{description}</p>
      </div>
    </div>
    {actionText && (
      <button
        onClick={onAction}
        className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 self-start focus:outline-none"
      >
        <span>{actionText}</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    )}
  </Card>
);

// 13. Settings Card
export const SettingsCard = ({ title, description, children, className, ...props }) => (
  <Card className={cn("bg-card", className)} {...props}>
    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
      <div className="flex-1 pr-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <CardDescription className="mt-1">{description}</CardDescription>}
      </div>
      <Settings className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
    </CardHeader>
    <CardContent className="pt-1">{children}</CardContent>
  </Card>
);
