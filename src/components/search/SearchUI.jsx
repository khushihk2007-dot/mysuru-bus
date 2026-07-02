/**
 * @file SearchUI.jsx
 * @description Transit search interface blocks (Floating Search, suggestions, history, filter badges, and empty states).
 */

import React, { useState } from "react";
import { Search, Mic, CornerDownLeft, Clock, MapPin, Bus, Route, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "../cards/Card";

// 1. Voice Search Button Placeholder
export const VoiceSearchButton = ({ onClick, isActive, className, ...props }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded-full hover:bg-secondary text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
        isActive && "bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger",
        className
      )}
      title="Search with Voice"
      {...props}
    >
      <Mic className={cn("h-4 w-4", isActive && "animate-pulse")} />
    </button>
  );
};

// 2. Floating Search Bar
export const FloatingSearchBar = ({
  value = "",
  onChange,
  onClear,
  onVoiceClick,
  isListening,
  placeholder = "Search routes, stops, or buses...",
  className,
  ...props
}) => {
  return (
    <div className={cn("relative w-full flex items-center bg-card rounded-lg border border-border shadow-md focus-within:border-border-strong focus-within:ring-1 focus-within:ring-ring transition-all px-3 py-1.5 h-11", className)} {...props}>
      <Search className="h-4 w-4 text-text-muted mr-2.5 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-secondary mr-1 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <VoiceSearchButton onClick={onVoiceClick} isActive={isListening} />
    </div>
  );
};

// 3. Quick Filters (Pills for fast search configuration)
export const QuickFilters = ({ activeFilter, onSelect, className }) => {
  const filters = [
    { id: "all", label: "All Assets", icon: SlidersHorizontal },
    { id: "routes", label: "Routes", icon: Route },
    { id: "stops", label: "Stops", icon: MapPin },
    { id: "vehicles", label: "Buses", icon: Bus },
  ];

  return (
    <div className={cn("flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none", className)}>
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onSelect && onSelect(filter.id)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-card text-text-secondary select-none transition-all hover:bg-secondary/40",
              isActive && "bg-primary border-primary text-primary-foreground hover:bg-primary-hover"
            )}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// 4. Search Suggestions List
export const SearchSuggestions = ({ suggestions = [], onSelect, className }) => {
  return (
    <div className={cn("flex flex-col rounded-md border border-border bg-card p-1 shadow-sm", className)}>
      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Suggestions</div>
      {suggestions.map((item, index) => {
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect && onSelect(item)}
            className="flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-xs text-text-primary hover:bg-secondary transition-colors text-left"
          >
            <span className="truncate">{item}</span>
            <CornerDownLeft className="h-3 w-3 text-text-muted" />
          </button>
        );
      })}
    </div>
  );
};

// 5. Search History List
export const SearchHistory = ({ items = [], onDelete, onSelect, className }) => {
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between px-1.5 py-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Search History</span>
      </div>
      <div className="flex flex-col rounded-lg border border-border bg-card p-1 shadow-sm">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-sm px-2 py-1.5 text-xs hover:bg-secondary transition-colors"
          >
            <button
              type="button"
              onClick={() => onSelect && onSelect(item)}
              className="flex items-center gap-2 flex-1 text-left text-text-primary min-w-0"
            >
              <Clock className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="truncate">{item}</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(item)}
              className="p-0.5 rounded-full text-text-muted hover:text-danger hover:bg-secondary transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. Recent Searches (Flat Layout)
export const RecentSearches = ({ items = [], onSelect, className }) => {
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-0.5">Recent Searches</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect && onSelect(item)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-border bg-card hover:bg-secondary/40 text-text-secondary transition-colors"
          >
            <Clock className="h-3 w-3 text-text-muted shrink-0" />
            <span>{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// 7. Search Results Panel
export const SearchResults = ({ results = [], onSelect, className }) => {
  const renderIcon = (type) => {
    switch (type) {
      case "route":
        return <Route className="h-4 w-4 text-primary" />;
      case "stop":
        return <MapPin className="h-4 w-4 text-success" />;
      case "vehicle":
        return <Bus className="h-4 w-4 text-info" />;
      default:
        return <Search className="h-4 w-4 text-text-muted" />;
    }
  };

  return (
    <div className={cn("flex flex-col rounded-lg border border-border bg-card p-1 shadow-md max-h-[350px] overflow-y-auto", className)}>
      {results.length === 0 ? (
        <SearchEmptyState />
      ) : (
        results.map((res, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect && onSelect(res)}
            className="flex items-center gap-3 w-full rounded-sm px-3 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
          >
            <div className="p-1.5 bg-secondary rounded text-text-secondary">
              {renderIcon(res.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-text-primary truncate">{res.title}</span>
                <span className="text-[10px] uppercase font-bold text-text-muted shrink-0 ml-2">{res.type}</span>
              </div>
              <p className="text-xs text-text-muted truncate mt-0.5">{res.description}</p>
            </div>
          </button>
        ))
      )}
    </div>
  );
};

// 8. Search Empty State
export const SearchEmptyState = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-6 px-4 text-center", className)}>
      <Search className="h-8 w-8 text-text-muted mb-2 animate-pulse" />
      <h4 className="text-xs font-semibold text-text-primary">No Matching Assets</h4>
      <p className="text-[10px] text-text-muted mt-1 max-w-[200px] leading-normal">
        Double check the spelling or refine your filters (routes, stops, vehicles).
      </p>
    </div>
  );
};
