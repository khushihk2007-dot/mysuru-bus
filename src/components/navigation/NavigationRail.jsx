/**
 * @file NavigationRail.jsx
 * @description Standardized navigation interfaces for transit layouts (Rail, Top Nav, Bottom Tab Nav).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";
import { radius } from "@/design/radius";

// 1. Navigation Rail (Desktop sidebar layout)
export const NavigationRail = ({
  items = [],
  activeId,
  onSelect,
  logo = <span className="font-bold text-lg">M</span>,
  utilities,
  className,
  ...props
}) => {
  return (
    <nav
      className={cn(
        "hidden md:flex flex-col justify-between items-center h-full w-[76px] py-4 bg-card border-r border-border shrink-0 select-none",
        zIndex.rail,
        className
      )}
      aria-label="Main Navigation Rail"
      {...props}
    >
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand Logo Wrapper */}
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl text-primary">
          {logo}
        </div>
        
        {/* Items list */}
        <div className="flex flex-col gap-2 w-full px-2" role="tablist" aria-label="Rail Sections">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                disabled={item.disabled}
                tabIndex={item.disabled ? -1 : 0}
                onClick={() => !item.disabled && onSelect && onSelect(item.id)}
                className={cn(
                  "relative group flex items-center justify-center w-12 h-12 transition-all duration-150 text-text-secondary hover:bg-secondary hover:text-text-primary rounded-lg cursor-pointer",
                  radius.lg,
                  item.disabled && "opacity-30 cursor-not-allowed",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {/* Micro Tooltip */}
                <span className="absolute left-[60px] hidden group-hover:block bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50 transition-opacity">
                  {item.label} {item.disabled && "(Coming soon)"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {utilities && (
        <div className="flex flex-col items-center gap-4 w-full px-2">
          {utilities}
        </div>
      )}
    </nav>
  );
};

// 2. Top Navigation (Desktop/Tablet header menu)
export const TopNavigation = ({
  items = [],
  activeId,
  onSelect,
  brandName = "Mysuru Transit",
  actions,
  className,
  ...props
}) => {
  return (
    <header
      className={cn(
        "flex h-14 w-full items-center justify-between border-b border-border bg-card px-4 md:px-6 select-none shrink-0",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-text-primary tracking-tight">{brandName}</span>
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Top Menu">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && onSelect && onSelect(item.id)}
              disabled={item.disabled}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors text-text-secondary hover:bg-secondary hover:text-text-primary",
                activeId === item.id && "bg-secondary text-text-primary font-semibold"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
};

// 3. Bottom Navigation (Mobile footer menu tabs)
export const BottomNavigation = ({
  items = [],
  activeId,
  onSelect,
  className,
  ...props
}) => {
  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4 pb-safe select-none",
        zIndex.rail,
        className
      )}
      aria-label="Mobile Bottom Navigation"
      {...props}
    >
      {items.filter(item => !item.disabled).map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect && onSelect(item.id)}
            aria-label={item.label}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors text-text-secondary hover:text-text-primary",
              isActive && "text-primary font-medium hover:text-primary"
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
