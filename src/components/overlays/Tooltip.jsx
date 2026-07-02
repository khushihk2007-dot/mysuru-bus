/**
 * @file Tooltip.jsx
 * @description Small, Rich, and Keyboard Shortcut tooltips styled with hover and focus listeners.
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

export const TooltipProvider = ({ children }) => <>{children}</>;

// Core Tooltip
export const Tooltip = ({
  children,
  content,
  position = "top",
  className,
  delay = 200,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top",
    left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
    right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      {...props}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 rounded bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-2 py-1 text-[11px] font-medium shadow-md pointer-events-none select-none transition-all duration-100 animate-in fade-in scale-in-95",
            positions[position],
            zIndex.tooltip,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// 1. Small Tooltip
export const SmallTooltip = ({ label, children, ...props }) => (
  <Tooltip content={label} {...props}>
    {children}
  </Tooltip>
);

// 2. Rich Tooltip (Supports subheadings, body text, or visual elements)
export const RichTooltip = ({
  title,
  description,
  children,
  position = "top",
  className
}) => {
  const contentNode = (
    <div className="flex flex-col gap-1 text-left p-1 w-48">
      {title && <span className="font-bold text-[11px] leading-tight text-neutral-50 dark:text-neutral-900">{title}</span>}
      {description && <p className="text-[10px] text-neutral-300 dark:text-neutral-600 leading-normal">{description}</p>}
    </div>
  );

  return (
    <Tooltip content={contentNode} position={position} className={cn("p-2", className)}>
      {children}
    </Tooltip>
  );
};

// 3. Keyboard Shortcut Tooltip (renders tags like CMD+K)
export const KeyboardShortcutTooltip = ({
  label,
  keys = [],
  children,
  position = "top"
}) => {
  const contentNode = (
    <div className="flex items-center gap-1.5 py-0.5">
      <span>{label}</span>
      <div className="flex items-center gap-0.5">
        {keys.map((k, idx) => (
          <kbd
            key={idx}
            className="px-1 py-0.25 bg-neutral-800 dark:bg-neutral-200 border border-neutral-700 dark:border-neutral-300 rounded text-[9px] font-sans font-semibold tracking-wider text-neutral-200 dark:text-neutral-700 leading-none shadow-sm"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );

  return (
    <Tooltip content={contentNode} position={position}>
      {children}
    </Tooltip>
  );
};
