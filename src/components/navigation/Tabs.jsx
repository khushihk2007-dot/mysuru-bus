/**
 * @file Tabs.jsx
 * @description Flexible Tabs component supporting responsive layouts and smooth sliding animations.
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = "pills", // 'pills' | 'underline'
  className,
  ...props
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        "flex w-full select-none",
        variant === "underline" ? "border-b border-border space-x-6" : "bg-secondary p-1 rounded-lg space-x-1",
        className
      )}
      {...props}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange && onChange(tab.id)}
            className={cn(
              "relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer",
              variant === "underline"
                ? "rounded-none bg-transparent text-text-secondary hover:text-text-primary px-1 pb-2 border-b-2 border-transparent"
                : "text-text-secondary hover:text-text-primary flex-1 text-center",
              isActive && (variant === "underline" ? "text-primary border-b-primary font-bold" : "text-primary-foreground font-bold"),
              tab.disabled && "opacity-30 cursor-not-allowed pointer-events-none"
            )}
          >
            {/* Sliding Highlight pill using framer-motion */}
            {isActive && variant === "pills" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-primary rounded-md -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
Tabs.displayName = "Tabs";
export default Tabs;
