/**
 * @file Select.jsx
 * @description Dropdown select and searchable combobox input components.
 * Configured with focus states and dark mode options.
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Select component
export const Select = React.forwardRef(
  ({ className, options = [], label, error, helperText, value, onChange, placeholder = "Select option...", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className={cn(
              "flex h-9 w-full appearance-none rounded-md border border-border bg-card px-3 py-1 pr-10 text-sm text-text-primary shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
              error && "border-danger focus-visible:ring-danger",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// Combobox component (Searchable popover selection)
export const Combobox = ({
  options = [],
  value,
  onChange,
  placeholder = "Search options...",
  label,
  error,
  className,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange && onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={cn("w-full flex flex-col gap-1 relative", className)}>
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-1 text-sm text-text-primary shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground text-left",
            error && "border-danger focus:ring-danger"
          )}
        >
          <span className={cn(!selectedOption && "text-text-muted")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-text-muted shrink-0 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center border-b border-border px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-text-muted hover:text-text-primary p-0.5 rounded-full hover:bg-secondary">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-text-muted">No results found.</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary hover:text-text-primary transition-colors text-left",
                      isSelected && "font-medium bg-secondary text-primary"
                    )}
                  >
                    <span className="flex-1 pr-6">{opt.label}</span>
                    {isSelected && (
                      <Check className="absolute right-2 h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
};
