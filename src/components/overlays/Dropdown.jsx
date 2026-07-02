/**
 * @file Dropdown.jsx
 * @description Action menus (Profile, Filters, Context/Right-click, Routes, and Settings) with positioning and keyboard support.
 */

import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, Filter, Shield, Moon, Sun, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

// Core Dropdown Layout
export const Dropdown = ({
  trigger,
  children,
  className,
  align = "right",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const alignments = {
    left: "left-0 origin-top-left",
    right: "right-0 origin-top-right",
    center: "left-1/2 -translate-x-1/2 origin-top",
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left select-none" {...props}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-52 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            alignments[align],
            zIndex.dropdown,
            className
          )}
          role="menu"
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
  const variants = {
    default: "text-text-primary hover:bg-secondary hover:text-text-primary",
    danger: "text-danger hover:bg-danger/10 hover:text-danger",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-sm px-2 py-1.5 text-xs font-medium transition-colors text-left outline-none cursor-default select-none disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      role="menuitem"
      {...props}
    >
      {icon && <span className="mr-2 h-3.5 w-3.5 shrink-0 text-text-muted">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
};

export const DropdownSeparator = ({ className, ...props }) => (
  <div className={cn("-mx-1 my-1 h-px bg-border/50", className)} {...props} />
);

export const DropdownLabel = ({ className, ...props }) => (
  <div className={cn("px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted select-none", className)} {...props} />
);

// 1. Profile Menu
export const ProfileMenu = ({ userName = "KA Admin", userEmail = "admin@mysurutransit.in", onLogout, trigger }) => (
  <Dropdown trigger={trigger}>
    <DropdownLabel>Logged in as</DropdownLabel>
    <div className="px-2 py-1.5 flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-text-primary truncate">{userName}</span>
      <span className="text-[10px] text-text-muted truncate">{userEmail}</span>
    </div>
    <DropdownSeparator />
    <DropdownItem icon={<User className="h-3.5 w-3.5" />}>My Account</DropdownItem>
    <DropdownItem icon={<Settings className="h-3.5 w-3.5" />}>Preferences</DropdownItem>
    <DropdownSeparator />
    <DropdownItem icon={<LogOut className="h-3.5 w-3.5" />} variant="danger" onClick={onLogout}>
      Logout Session
    </DropdownItem>
  </Dropdown>
);

// 2. Filter Menu (Toggle multi-checkboxes)
export const FilterMenu = ({ filters = [], selected = [], onToggle, trigger }) => (
  <Dropdown trigger={trigger} align="right">
    <DropdownLabel>Toggle Map Layers</DropdownLabel>
    {filters.map((fil) => {
      const isChecked = selected.includes(fil.id);
      return (
        <DropdownItem
          key={fil.id}
          onClick={() => onToggle && onToggle(fil.id)}
          icon={<Filter className="h-3.5 w-3.5" />}
        >
          <div className="flex justify-between items-center w-full">
            <span>{fil.label}</span>
            {isChecked && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
          </div>
        </DropdownItem>
      );
    })}
  </Dropdown>
);

// 3. Context Menu (Standard right-click trigger)
export const ContextMenu = ({ x = 0, y = 0, isOpen, onClose, children, className }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose && onClose();
    };
    if (isOpen) {
      document.addEventListener("mousedown", clickOutside);
    }
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className={cn(
        "fixed z-50 w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in zoom-in-95 duration-100",
        zIndex.dropdown,
        className
      )}
    >
      {children}
    </div>
  );
};

// 4. Route Menu
export const RouteMenu = ({ routes = [], activeRouteCode, onSelectRoute, trigger }) => (
  <Dropdown trigger={trigger} align="left">
    <DropdownLabel>Active Transit Lines</DropdownLabel>
    {routes.map((rt) => {
      const isActive = rt.code === activeRouteCode;
      return (
        <DropdownItem
          key={rt.code}
          onClick={() => onSelectRoute && onSelectRoute(rt.code)}
          icon={<MapPin className="h-3.5 w-3.5" />}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-mono font-bold">{rt.code}</span>
            <span className="text-text-secondary truncate max-w-[100px] ml-2">{rt.name}</span>
            {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
          </div>
        </DropdownItem>
      );
    })}
  </Dropdown>
);

// 5. Settings Menu
export const SettingsMenu = ({ theme = "light", onThemeToggle, metricMode = "km", onMetricToggle, trigger }) => (
  <Dropdown trigger={trigger}>
    <DropdownLabel>Quick settings</DropdownLabel>
    <DropdownItem
      onClick={onThemeToggle}
      icon={theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    >
      <span>Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
    </DropdownItem>
    <DropdownItem
      onClick={onMetricToggle}
      icon={<Shield className="h-3.5 w-3.5" />}
    >
      <span>Distance unit: {metricMode === "km" ? "Kilometers" : "Miles"}</span>
    </DropdownItem>
  </Dropdown>
);
