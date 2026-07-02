/**
 * @file Badge.jsx
 * @description Standard and semantic transit alert badges (Live, Online, Offline, Moving, Stopped, Delayed, On Time, Favorite, Warning, Success, Danger, Neutral).
 */

import React from "react";
import { Star, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// Core Badge Component
export const Badge = ({ className, variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-secondary text-secondary-foreground border-transparent",
    primary: "bg-primary text-primary-foreground border-transparent",
    success: "bg-success/15 text-success border-transparent",
    warning: "bg-warning/15 text-warning border-transparent",
    danger: "bg-danger/15 text-danger border-transparent",
    info: "bg-info/15 text-info border-transparent",
    neutral: "bg-neutral-200 dark:bg-neutral-800 text-text-secondary border-transparent",
    outline: "bg-background text-text-primary border-border",
    live: "bg-danger/10 text-danger border-danger/25 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Specialized Semantic Badges
export const LiveBadge = ({ className, ...props }) => (
  <Badge variant="live" className={cn("animate-pulse gap-1", className)} {...props}>
    <span className="h-1.5 w-1.5 rounded-full bg-danger inline-block animate-ping shrink-0" />
    Live
  </Badge>
);

export const OnlineBadge = ({ className, ...props }) => (
  <Badge variant="success" className={className} {...props}>Online</Badge>
);

export const OfflineBadge = ({ className, ...props }) => (
  <Badge variant="neutral" className={className} {...props}>Offline</Badge>
);

export const MovingBadge = ({ className, ...props }) => (
  <Badge variant="success" className={cn("bg-success/10 text-success border-transparent", className)} {...props}>Moving</Badge>
);

export const StoppedBadge = ({ className, ...props }) => (
  <Badge variant="info" className={className} {...props}>Stopped</Badge>
);

export const DelayedBadge = ({ minutes = 5, className, ...props }) => (
  <Badge variant="warning" className={className} {...props}>
    Delayed {minutes > 0 ? `+${minutes}m` : ""}
  </Badge>
);

export const OnTimeBadge = ({ className, ...props }) => (
  <Badge variant="success" className={className} {...props}>On Time</Badge>
);

export const FavoriteBadge = ({ className, ...props }) => (
  <Badge variant="outline" className={cn("gap-1 text-warning border-warning/20 bg-warning/5 font-semibold", className)} {...props}>
    <Star className="h-3 w-3 fill-current" />
    Favorite
  </Badge>
);

export const WarningBadge = ({ label = "Alert", className, ...props }) => (
  <Badge variant="danger" className={cn("gap-1", className)} {...props}>
    <ShieldAlert className="h-3 w-3 shrink-0" />
    {label}
  </Badge>
);

export const SuccessBadge = ({ label = "Success", className, ...props }) => (
  <Badge variant="success" className={className} {...props}>{label}</Badge>
);

export const DangerBadge = ({ label = "Danger", className, ...props }) => (
  <Badge variant="danger" className={className} {...props}>{label}</Badge>
);

export const NeutralBadge = ({ label = "Neutral", className, ...props }) => (
  <Badge variant="neutral" className={className} {...props}>{label}</Badge>
);
