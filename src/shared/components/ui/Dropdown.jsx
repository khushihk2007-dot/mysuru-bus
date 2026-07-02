import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

export const Dropdown = ({
  trigger,
  children,
  className,
  align = "right",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const alignmentClasses = {
    left: "left-0 origin-top-left",
    right: "right-0 origin-top-right",
    center: "left-1/2 -translate-x-1/2 origin-top",
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left" {...props}>
      {/* Trigger */}
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu Options Popover */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            alignmentClasses[align],
            zIndex.dropdown,
            className
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onClick: (e) => {
                  if (child.props.onClick) child.props.onClick(e);
                  setIsOpen(false);
                },
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  className,
  children,
  icon,
  disabled,
  onClick,
  variant = "default",
  ...props
}) => {
  const variantClasses = {
    default: "text-text-primary hover:bg-secondary hover:text-text-primary",
    danger: "text-danger hover:bg-danger/10 hover:text-danger",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors text-left outline-none cursor-default select-none disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className
      )}
      role="menuitem"
      {...props}
    >
      {icon && <span className="mr-2 h-4 w-4 shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
};

export const DropdownSeparator = ({ className, ...props }) => (
  <div className={cn("-mx-1 my-1 h-px bg-border/50", className)} {...props} />
);

export const DropdownLabel = ({ className, ...props }) => (
  <div className={cn("px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted select-none", className)} {...props} />
);
