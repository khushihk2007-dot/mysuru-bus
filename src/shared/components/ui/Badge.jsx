import React from "react";
import { Star, X, MapPin, Bus, Filter, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Core Badge Component
export const Badge = ({ className, variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-secondary text-secondary-foreground border-transparent",
    primary: "bg-primary text-primary-foreground border-transparent",
    success: "bg-success/15 text-success border-transparent",
    warning: "bg-warning/15 text-warning border-transparent",
    danger: "bg-danger/15 text-danger border-transparent",
    info: "bg-info/15 text-info border-transparent",
    outline: "bg-background text-text-primary border-border",
    live: "bg-danger/10 text-danger border-danger/25 font-semibold animate-pulse",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Semantic Badge Helpers
export const LiveBadge = ({ className, ...props }) => (
  <Badge variant="live" className={cn("uppercase tracking-wider text-[10px]", className)} {...props}>
    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-danger inline-block animate-ping" />
    Live
  </Badge>
);

export const OnlineBadge = ({ className, ...props }) => (
  <Badge variant="success" className={cn("text-[10px]", className)} {...props}>Online</Badge>
);

export const OfflineBadge = ({ className, ...props }) => (
  <Badge variant="default" className={cn("bg-disabled/40 text-text-muted text-[10px]", className)} {...props}>Offline</Badge>
);

export const DelayedBadge = ({ minutes = 5, className, ...props }) => (
  <Badge variant="warning" className={cn("text-[10px]", className)} {...props}>
    Delayed {minutes > 0 ? `+${minutes}m` : ""}
  </Badge>
);

export const OnTimeBadge = ({ className, ...props }) => (
  <Badge variant="success" className={cn("text-[10px]", className)} {...props}>On Time</Badge>
);

export const WarningBadge = ({ label = "Alert", className, ...props }) => (
  <Badge variant="danger" className={cn("text-[10px]", className)} {...props}>{label}</Badge>
);

export const FavoriteBadge = ({ className, ...props }) => (
  <Badge variant="outline" className={cn("gap-1 text-[10px] text-warning border-warning/20 bg-warning/5", className)} {...props}>
    <Star className="h-3 w-3 fill-current" />
    Favorite
  </Badge>
);

export const AnalyticsBadge = ({ label, className, ...props }) => (
  <Badge variant="info" className={cn("text-[10px]", className)} {...props}>{label}</Badge>
);

// 2. Chip Component
export const Chip = ({
  className,
  label,
  icon,
  onRemove,
  active,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border bg-card text-text-secondary select-none transition-all",
        onClick && "cursor-pointer hover:bg-secondary/40 active:scale-95",
        active && "bg-primary border-primary text-primary-foreground hover:bg-primary-hover",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "ml-1 p-0.5 rounded-full hover:bg-secondary-hover text-text-muted hover:text-text-primary transition-colors",
            active && "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-hover"
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

// Specialized Chips
export const RouteChip = ({ routeCode, routeColorVar = "--route-8", active, onClick, onRemove }) => (
  <Chip
    label={`Route ${routeCode}`}
    icon={
      <span
        className="h-2 w-2 rounded-full inline-block"
        style={{ backgroundColor: `var(${routeColorVar})` }}
      />
    }
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

export const StopChip = ({ stopName, active, onClick, onRemove }) => (
  <Chip
    label={stopName}
    icon={<MapPin className="h-3 w-3" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

export const VehicleChip = ({ vehicleId, active, onClick, onRemove }) => (
  <Chip
    label={vehicleId}
    icon={<Bus className="h-3 w-3" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

export const FavoriteChip = ({ label, active, onClick, onRemove }) => (
  <Chip
    label={label}
    icon={<Heart className="h-3 w-3 fill-current text-danger" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

export const FilterChip = ({ label, active, onClick, onRemove }) => (
  <Chip
    label={label}
    icon={<Filter className="h-3 w-3" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

// 3. StatusDot Component
export const StatusDot = ({
  status = "live",
  animate = true,
  className,
  size = "md",
  ...props
}) => {
  const statusStyles = {
    live: "bg-danger",
    moving: "bg-success",
    stopped: "bg-info",
    delayed: "bg-warning",
    offline: "bg-disabled-foreground",
    maintenance: "bg-secondary-foreground",
    error: "bg-danger",
    success: "bg-success",
  };

  const sizeStyles = {
    sm: "h-1.5 w-1.5",
    md: "h-2.5 w-2.5",
    lg: "h-3.5 w-3.5",
  };

  const isLivePulse = animate && (status === "live" || status === "moving");

  return (
    <span className={cn("relative flex shrink-0 items-center justify-center", sizeStyles[size], className)} {...props}>
      {isLivePulse && (
        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping", statusStyles[status])} />
      )}
      <span className={cn("relative inline-flex rounded-full", sizeStyles[size], statusStyles[status])} />
    </span>
  );
};
