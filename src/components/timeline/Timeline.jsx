/**
 * @file Timeline.jsx
 * @description Transit timelines (Vertical, Horizontal, Progress tracking, Route Stop progress, Activity feeds).
 */

import React from "react";
import { CheckCircle2, Clock, Info, ShieldAlert, MapPin, Bus } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Vertical Timeline
export const VerticalTimeline = ({ items = [], className }) => {
  return (
    <div className={cn("flex flex-col relative border-l border-border pl-4 gap-6 select-none", className)}>
      {items.map((item, idx) => {
        const Icon = item.icon || Clock;
        return (
          <div key={idx} className="relative w-full text-left">
            {/* Left Dot */}
            <div className="absolute -left-[23px] top-1 bg-card rounded-full p-0.5 border border-border">
              <Icon className="h-3 w-3 text-text-muted" />
            </div>
            
            <div className="flex flex-col gap-0.5 select-text">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">{item.title}</span>
                <span className="text-[9px] font-mono text-text-muted">{item.time}</span>
              </div>
              {item.description && <p className="text-[11px] text-text-muted leading-relaxed">{item.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 2. Horizontal Timeline
export const HorizontalTimeline = ({ items = [], className }) => {
  return (
    <div className={cn("flex items-center w-full select-none overflow-x-auto pb-2 scrollbar-none", className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const Icon = item.icon || CheckCircle2;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1 shrink-0 text-center px-2">
              <div className="p-1.5 rounded-full bg-secondary text-text-secondary border border-border">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold text-text-primary leading-tight">{item.title}</span>
              <span className="text-[9px] font-mono text-text-muted">{item.time}</span>
            </div>
            {!isLast && <div className="h-px bg-border flex-1 min-w-[32px] mx-1 shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// 3. Progress Timeline (Step progress tracker)
export const ProgressTimeline = ({ steps = [], currentStep = 0, className }) => {
  return (
    <div className={cn("flex items-center w-full select-none justify-between", className)}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-background border-primary text-primary ring-2 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-secondary border-border text-text-muted"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-3 w-3 fill-current text-primary-foreground" /> : idx + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold",
                  isCurrent && "text-text-primary font-bold",
                  !isCurrent && "text-text-secondary"
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-3 min-w-[20px] transition-colors",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// 4. Route Progress Timeline (Transit specific stop sequence progress)
export const RouteProgressTimeline = ({ stops = [], activeStopIndex = 0, nextArrivalText, className }) => {
  return (
    <div className={cn("flex flex-col relative pl-6 border-l-2 border-border gap-6 select-none", className)}>
      {stops.map((stop, idx) => {
        const isPassed = idx < activeStopIndex;
        const isCurrent = idx === activeStopIndex;
        const isUpcoming = idx > activeStopIndex;

        return (
          <div key={idx} className="relative w-full text-left">
            {/* Custom timeline nodes */}
            <div className="absolute -left-[32px] top-0.5 flex items-center justify-center">
              {isPassed && (
                <div className="h-4.5 w-4.5 rounded-full bg-primary border-4 border-card flex items-center justify-center shadow-sm">
                  <div className="h-1 w-1 rounded-full bg-primary-foreground" />
                </div>
              )}
              {isCurrent && (
                <div className="relative flex items-center justify-center">
                  <span className="absolute h-6 w-6 rounded-full bg-success/20 animate-ping" />
                  <div className="h-5 w-5 rounded-full bg-success border-4 border-card flex items-center justify-center shadow-md">
                    <Bus className="h-2 w-2 text-white" />
                  </div>
                </div>
              )}
              {isUpcoming && (
                <div className="h-4.5 w-4.5 rounded-full bg-secondary border-4 border-card flex items-center justify-center shadow-sm">
                  <div className="h-1 w-1 rounded-full bg-text-muted" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5 select-text">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isCurrent ? "text-success font-bold" : "text-text-primary",
                    isPassed && "text-text-muted font-normal"
                  )}
                >
                  {stop.stopName}
                </span>
                {isUpcoming && stop.eta && (
                  <span className="text-[10px] font-mono text-primary font-bold shrink-0">{stop.eta}</span>
                )}
                {isCurrent && nextArrivalText && (
                  <span className="text-[9px] font-bold text-success uppercase tracking-wider bg-success/10 px-1 rounded">
                    {nextArrivalText}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                Stop #{stop.sequence || idx + 1}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 5. Activity Timeline (System Logs/Activity updates)
export const ActivityTimeline = ({ activities = [], className }) => {
  const getIcon = (type) => {
    switch (type) {
      case "info":
        return <Info className="h-3 w-3 text-info" />;
      case "alert":
        return <ShieldAlert className="h-3 w-3 text-danger" />;
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-success" />;
      default:
        return <Clock className="h-3 w-3 text-text-muted" />;
    }
  };

  return (
    <div className={cn("flex flex-col relative border-l border-border pl-4 gap-6 select-none", className)}>
      {activities.map((act, idx) => (
        <div key={idx} className="relative w-full text-left">
          <div className="absolute -left-[23px] top-1 bg-card rounded-full p-0.5 border border-border">
            {getIcon(act.type)}
          </div>
          <div className="flex flex-col gap-0.5 select-text">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-text-primary">{act.message}</span>
              <span className="text-[9px] font-mono text-text-muted shrink-0 ml-3">{act.time}</span>
            </div>
            {act.details && <p className="text-[10px] text-text-muted mt-0.5 leading-normal">{act.details}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
