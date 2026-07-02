/**
 * @file StatusIndicators.jsx
 * @description Real-time status indicators (Moving, Stopped, Offline, GPS Lost, Updating, Live, Delayed) with pulsing beacons.
 */

import React from "react";
import { Navigation, AlertTriangle, RefreshCw, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. StatusDot
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
    offline: "bg-neutral-400 dark:bg-neutral-600",
    gpsLost: "bg-warning",
    updating: "bg-primary",
  };

  const sizeStyles = {
    sm: "h-1.5 w-1.5",
    md: "h-2.5 w-2.5",
    lg: "h-3.5 w-3.5",
  };

  const isPulsing = animate && (status === "live" || status === "moving" || status === "updating");

  return (
    <span className={cn("relative flex shrink-0 items-center justify-center", sizeStyles[size], className)} {...props}>
      {isPulsing && (
        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping", statusStyles[status])} />
      )}
      <span className={cn("relative inline-flex rounded-full", sizeStyles[size], statusStyles[status])} />
    </span>
  );
};

// Specialized Status components with text labels

export const MovingStatus = ({ label = "Moving", className }) => (
  <div className={cn("inline-flex items-center gap-1.5 text-xs text-success font-medium select-none", className)}>
    <StatusDot status="moving" size="sm" />
    <span>{label}</span>
  </div>
);

export const StoppedStatus = ({ label = "Stopped", className }) => (
  <div className={cn("inline-flex items-center gap-1.5 text-xs text-info font-medium select-none", className)}>
    <StatusDot status="stopped" size="sm" />
    <span>{label}</span>
  </div>
);

export const OfflineStatus = ({ label = "Offline", className }) => (
  <div className={cn("inline-flex items-center gap-1.5 text-xs text-text-muted font-medium select-none", className)}>
    <StatusDot status="offline" size="sm" animate={false} />
    <span>{label}</span>
  </div>
);

export const GpsLostStatus = ({ label = "GPS Signal Lost", className }) => (
  <div className={cn("inline-flex items-center gap-1.5 text-xs text-warning font-semibold select-none", className)}>
    <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
    <span>{label}</span>
  </div>
);

export const UpdatingStatus = ({ label = "Updating Feed", className }) => (
  <div className={cn("inline-flex items-center gap-1.5 text-xs text-primary font-medium select-none", className)}>
    <RefreshCw className="h-3 w-3 text-primary animate-spin shrink-0" />
    <span>{label}</span>
  </div>
);

export const LiveStatus = ({ label = "Live Tracked", className }) => (
  <div className={cn("inline-flex items-center gap-1.5 text-xs text-danger font-semibold select-none", className)}>
    <Radio className="h-3.5 w-3.5 text-danger animate-pulse shrink-0" />
    <span>{label}</span>
  </div>
);

export const DelayedStatus = ({ minutes = 5, className }) => (
  <div className={cn("inline-flex items-center gap-1.5 text-xs text-warning font-semibold select-none", className)}>
    <StatusDot status="delayed" size="sm" />
    <span>Delayed {minutes > 0 ? `+${minutes}m` : ""}</span>
  </div>
);
