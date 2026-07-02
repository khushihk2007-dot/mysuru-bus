/**
 * @file Loading.jsx
 * @description Standardized loading states (Skeletons for Cards, Lists, Sidebars, Search, Timeline panels; and Progress bars/circles).
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Base Skeleton Pulse
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded bg-secondary/80", className)}
      {...props}
    />
  );
};

// 2. Skeleton Card
export const SkeletonCard = ({ className }) => (
  <div className={cn("p-4 rounded-lg border border-border bg-card flex flex-col gap-3 w-full", className)}>
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
);

// 3. Skeleton List
export const SkeletonList = ({ count = 3, className }) => (
  <div className={cn("flex flex-col gap-2 w-full", className)}>
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="p-3 rounded-lg border border-border bg-card flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// 4. Skeleton Sidebar
export const SkeletonSidebar = ({ className }) => (
  <div className={cn("w-full flex flex-col gap-4 p-4", className)}>
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="flex flex-col gap-3 mt-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-2.5 px-2">
          <Skeleton className="h-4 w-4 shrink-0" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

// 5. Skeleton Search
export const SkeletonSearch = ({ className }) => (
  <div className={cn("flex flex-col gap-3 w-full", className)}>
    <Skeleton className="h-10 w-full rounded-lg" />
    <div className="flex flex-col gap-2 mt-1.5">
      <Skeleton className="h-3.5 w-1/4 rounded-full px-2" />
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  </div>
);

// 6. Skeleton Panel (Right Details side panel)
export const SkeletonPanel = ({ className }) => (
  <div className={cn("w-full flex flex-col gap-5 p-4", className)}>
    <div className="flex justify-between items-center pb-2 border-b border-border/40">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-7 w-7 rounded-sm" />
    </div>
    
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  </div>
);

// 7. Skeleton Timeline
export const SkeletonTimeline = ({ count = 3, className }) => (
  <div className={cn("flex flex-col w-full pl-4 relative border-l border-border/60 gap-6", className)}>
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="relative w-full">
        {/* Node indicator */}
        <div className="absolute -left-[21px] top-1">
          <Skeleton className="h-2.5 w-2.5 rounded-full border border-card ring-2 ring-border/40" />
        </div>
        <div className="flex flex-col gap-1.5 pl-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

// 8. Loading Spinner
export const LoadingSpinner = ({ className, size = "md", ...props }) => {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary shrink-0", sizeClasses[size], className)}
      {...props}
    />
  );
};

// 9. Linear Progress
export const LinearProgress = ({ value = 0, className, ...props }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full h-1.5 bg-secondary rounded-full overflow-hidden", className)} {...props}>
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

// 10. Circular Progress
export const CircularProgress = ({ value = 0, size = 36, strokeWidth = 3.5, className }) => {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-secondary"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-300 ease-out"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-text-secondary">{clamped}%</span>
    </div>
  );
};
