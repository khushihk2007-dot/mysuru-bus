/**
 * @file Chip.jsx
 * @description Tag filters and route chips (Route, Stop, Bus, Status, Filter, Favorite).
 */

import React from "react";
import { X, MapPin, Bus as BusIcon, Route as RouteIcon, Heart, Filter, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Core Chip Component
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
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-border bg-card text-text-secondary select-none transition-all",
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
    icon={<MapPin className="h-3.5 w-3.5" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

export const BusChip = ({ vehicleId, active, onClick, onRemove }) => (
  <Chip
    label={vehicleId}
    icon={<BusIcon className="h-3.5 w-3.5" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

export const StatusChip = ({ statusLabel, active, onClick, onRemove }) => (
  <Chip
    label={statusLabel}
    icon={<Activity className="h-3.5 w-3.5" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

export const FilterChip = ({ label, active, onClick, onRemove }) => (
  <Chip
    label={label}
    icon={<Filter className="h-3.5 w-3.5" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);

export const FavoriteChip = ({ label, active, onClick, onRemove }) => (
  <Chip
    label={label}
    icon={<Heart className="h-3.5 w-3.5 fill-current text-danger" />}
    active={active}
    onClick={onClick}
    onRemove={onRemove}
  />
);
