import React, { useState } from "react";
import { Search, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Standard Input Component
export const Input = React.forwardRef(
  ({ className, type = "text", error, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-text-primary shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
            error && "border-danger focus-visible:ring-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// Search Input Component
export const SearchInput = React.forwardRef(
  ({ className, onClear, error, label, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-md border border-border bg-card pl-9 pr-9 py-1 text-sm text-text-primary shadow-sm transition-all placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
              error && "border-danger focus-visible:ring-danger",
              className
            )}
            {...props}
          />
          {props.value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-text-muted hover:text-text-primary hover:bg-secondary transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

// Password Input Component
export const PasswordInput = React.forwardRef(
  ({ className, error, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-md border border-border bg-card pl-3 pr-10 py-1 text-sm text-text-primary shadow-sm transition-all placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
              error && "border-danger focus-visible:ring-danger",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

// Textarea Component
export const Textarea = React.forwardRef(
  ({ className, error, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary select-none">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary shadow-sm transition-all placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
            error && "border-danger focus-visible:ring-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
