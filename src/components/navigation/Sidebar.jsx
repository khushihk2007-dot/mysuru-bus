/**
 * @file Sidebar.jsx
 * @description Flexible Sidebar component suite with groups, sections, collapsible toggles, and item counts.
 */

import React, { createContext, useContext, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

const SidebarContext = createContext(null);

// 1. Sidebar Container
export const Sidebar = ({
  children,
  isOpen = true,
  onToggle,
  className,
  ...props
}) => {
  return (
    <SidebarContext.Provider value={{ isOpen }}>
      <aside
        className={cn(
          "hidden md:flex flex-col h-full bg-card border-r border-border transition-all duration-300 overflow-hidden shrink-0 select-none",
          isOpen ? "w-[280px]" : "w-0 border-r-0",
          className
        )}
        {...props}
      >
        <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
          {children}
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};

// 2. Collapsible Sidebar Wrapper (using Framer Motion)
export const CollapsibleSidebar = ({
  children,
  width = 280,
  minWidth = 0,
  isOpen,
  onToggle,
  className,
  ...props
}) => {
  return (
    <SidebarContext.Provider value={{ isOpen }}>
      <div className="relative h-full flex shrink-0">
        <motion.div
          animate={{ width: isOpen ? width : minWidth }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "bg-card border-r border-border flex flex-col h-full overflow-hidden relative",
            className
          )}
          {...props}
        >
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {children}
          </div>
        </motion.div>
        
        {/* Absolute Toggle Button Trigger */}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "absolute top-4 -right-3 h-6 w-6 rounded-full border border-border bg-card shadow-sm flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-secondary cursor-pointer",
              zIndex.rail
            )}
          >
            {isOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </SidebarContext.Provider>
  );
};

// 3. Sidebar Group
export const SidebarGroup = ({ children, className, ...props }) => {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)} {...props}>
      {children}
    </div>
  );
};
SidebarGroup.displayName = "SidebarGroup";

// 4. Sidebar Section (Header label with collapsible option)
export const SidebarSection = ({
  title,
  children,
  defaultExpanded = true,
  collapsible = false,
  className,
  ...props
}) => {
  const { isOpen } = useContext(SidebarContext) || { isOpen: true };
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!isOpen) return null;

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)} {...props}>
      <div className="flex items-center justify-between px-2.5 py-1 select-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {title}
        </span>
        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-semibold text-primary hover:underline focus:outline-none"
          >
            {expanded ? "Hide" : "Show"}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col gap-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 5. Sidebar Item
export const SidebarItem = ({
  label,
  icon: Icon,
  isActive,
  badge,
  onClick,
  disabled,
  className,
  ...props
}) => {
  const { isOpen } = useContext(SidebarContext) || { isOpen: true };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors text-text-secondary hover:bg-secondary hover:text-text-primary text-left cursor-pointer disabled:opacity-30 disabled:pointer-events-none",
        isActive && "bg-secondary text-text-primary font-semibold border-l-2 border-l-primary rounded-l-none pl-2.5",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {isOpen && <span className="flex-1 truncate">{label}</span>}
      {isOpen && badge !== undefined && (
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.25 bg-secondary text-text-muted rounded-full shrink-0",
            isActive && "bg-primary/10 text-primary"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
SidebarItem.displayName = "SidebarItem";
