import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

export const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip = ({
  children,
  content,
  position = "top",
  className,
  delay = 300,
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
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  const positionClasses = {
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
            "absolute z-50 rounded-sm bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-2.5 py-1 text-xs font-medium shadow-md pointer-events-none select-none transition-all duration-150 animate-in fade-in scale-in-95",
            positionClasses[position],
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
export default Tooltip;
