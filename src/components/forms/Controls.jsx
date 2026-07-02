/**
 * @file Controls.jsx
 * @description Input control selectors (Checkbox, Switch, Radio, Slider).
 * Styled with active highlights and disabled flags.
 */

import React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// Checkbox
export const Checkbox = React.forwardRef(
  ({ className, checked, onChange, label, disabled, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const activeId = id || fallbackId;

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          id={activeId}
          ref={ref}
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange && onChange(!checked)}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border bg-card shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
            checked && "bg-primary border-primary text-primary-foreground",
            className
          )}
          {...props}
        >
          {checked && <Check className="h-3 w-3 stroke-[3]" />}
        </button>
        {label && (
          <label
            htmlFor={activeId}
            className={cn(
              "text-sm font-medium text-text-primary select-none cursor-pointer",
              disabled && "cursor-not-allowed text-text-muted"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

// Switch (Toggle)
export const Switch = React.forwardRef(
  ({ className, checked, onChange, label, disabled, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const activeId = id || fallbackId;

    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          id={activeId}
          ref={ref}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange && onChange(!checked)}
          className={cn(
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:opacity-50",
            checked ? "bg-primary" : "bg-secondary",
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
              checked ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>
        {label && (
          <label
            htmlFor={activeId}
            className={cn(
              "text-sm font-medium text-text-primary select-none cursor-pointer",
              disabled && "cursor-not-allowed text-text-muted"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Switch.displayName = "Switch";

// Radio Group
export const RadioGroup = ({ children, className, ...props }) => {
  return (
    <div className={cn("grid gap-2", className)} role="radiogroup" {...props}>
      {children}
    </div>
  );
};
RadioGroup.displayName = "RadioGroup";

// Radio Button
export const RadioButton = React.forwardRef(
  ({ className, checked, onChange, label, value, name, disabled, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const activeId = id || fallbackId;

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          id={activeId}
          ref={ref}
          role="radio"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange && onChange(value)}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled",
            checked && "border-primary text-primary",
            className
          )}
          {...props}
        >
          {checked && <Circle className="h-2 w-2 fill-current text-primary" />}
        </button>
        {label && (
          <label
            htmlFor={activeId}
            className={cn(
              "text-sm font-medium text-text-primary select-none cursor-pointer",
              disabled && "cursor-not-allowed text-text-muted"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
RadioButton.displayName = "RadioButton";

// Slider
export const Slider = React.forwardRef(
  ({ className, label, min = 0, max = 100, step = 1, value = 0, onChange, disabled, ...props }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="w-full flex flex-col gap-1">
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
              {label}
            </label>
          )}
          <span className="text-xs font-mono font-medium text-text-secondary">{value}</span>
        </div>
        <div className="relative flex w-full items-center select-none">
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange && onChange(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--secondary) ${percentage}%, var(--secondary) 100%)`
            }}
            className={cn(
              "w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border-strong [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-105 [&::-webkit-slider-thumb]:active:scale-95",
              "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-border-strong [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-105 [&::-moz-range-thumb]:active:scale-95",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Slider.displayName = "Slider";
