import React from "react";
import { Loader2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Base Skeleton component
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded bg-secondary/80", className)}
      {...props}
    />
  );
};

// 2. Spinner (Loading Indicator)
export const Spinner = ({ className, size = "md", ...props }) => {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
      {...props}
    />
  );
};

// 3. Progress Bar (Percentage-driven loader)
export const ProgressBar = ({ value = 0, className, ...props }) => {
  // Clamp value between 0 and 100
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

// 4. Linear Loader (Infinite running loader bar)
export const LinearLoader = ({ className, ...props }) => {
  return (
    <div className={cn("w-full h-1 bg-secondary overflow-hidden relative rounded-full", className)} {...props}>
      <div className="absolute h-full bg-primary rounded-full animate-[shimmer_1.5s_infinite_linear] w-[40%]" />
      
      {/* Adding custom keyframe animation inline or using styles for tailwind */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

// 5. Map Loader (Radar pulse loader for transit platforms)
export const MapLoader = ({ label = "Scanning live transit feeds...", className, ...props }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300",
        className
      )}
      {...props}
    >
      <div className="relative flex items-center justify-center">
        {/* Breathing radar ring layers */}
        <span className="absolute h-16 w-16 rounded-full bg-primary/5 animate-ping duration-1000" />
        <span className="absolute h-24 w-24 rounded-full bg-primary/5 animate-ping duration-1000 delay-300" />
        <div className="relative p-4 bg-card rounded-full border border-border shadow-md flex items-center justify-center">
          <Radio className="h-6 w-6 text-primary animate-[pulse_2s_infinite]" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
          {label}
        </span>
        <div className="w-32">
          <LinearLoader />
        </div>
      </div>
    </div>
  );
};
