/**
 * @file Input.jsx
 * @description Standard and specialized input components (Text, Search, Password, Number, OTP, Autocomplete).
 * Linked with design tokens for consistency.
 */

import React, { useState, useRef, useEffect } from "react";
import { Search, Eye, EyeOff, X, ChevronUp, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Standard Input
export const Input = React.forwardRef(
  ({ className, type = "text", error, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-text-primary shadow-sm transition-all placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
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

// 2. Search Input
export const SearchInput = React.forwardRef(
  ({ className, onClear, error, label, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
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

// 3. Password Input
export const PasswordInput = React.forwardRef(
  ({ className, error, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
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

// 4. Textarea
export const Textarea = React.forwardRef(
  ({ className, error, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
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

// 5. Number Input (With Chevron controls)
export const NumberInput = React.forwardRef(
  ({ className, error, label, min, max, step = 1, value = 0, onChange, ...props }, ref) => {
    const handleIncrement = () => {
      const newVal = Number(value) + step;
      if (max !== undefined && newVal > max) return;
      onChange && onChange(newVal);
    };

    const handleDecrement = () => {
      const newVal = Number(value) - step;
      if (min !== undefined && newVal < min) return;
      onChange && onChange(newVal);
    };

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            type="number"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange && onChange(Number(e.target.value))}
            className={cn(
              "flex h-9 w-full rounded-md border border-border bg-card pl-3 pr-10 py-1 text-sm text-text-primary shadow-sm transition-all placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
              error && "border-danger focus-visible:ring-danger",
              className
            )}
            {...props}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <button
              type="button"
              onClick={handleIncrement}
              className="p-0.5 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="p-0.5 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";

// 6. OTP Input (Accessible, manages active focus grids)
export const OtpInput = ({ length = 6, value = "", onChange, error, label }) => {
  const inputsRef = useRef([]);

  const handleTextChange = (e, index) => {
    const val = e.target.value;
    const digit = val.slice(-1); // Only take last character

    // Only allow numbers
    if (digit && isNaN(Number(digit))) return;

    const currentOtp = value.split("");
    currentOtp[index] = digit;
    const nextOtpValue = currentOtp.join("");

    onChange && onChange(nextOtpValue);

    // If typing a digit, advance focus
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const currentOtp = value.split("");
      
      // If current is empty, move backward and clear previous
      if (!currentOtp[index] && index > 0) {
        currentOtp[index - 1] = "";
        onChange && onChange(currentOtp.join(""));
        inputsRef.current[index - 1]?.focus();
      } else {
        currentOtp[index] = "";
        onChange && onChange(currentOtp.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (isNaN(Number(pasteData))) return;

    const truncated = pasteData.slice(0, length);
    onChange && onChange(truncated);
    inputsRef.current[Math.min(truncated.length, length - 1)]?.focus();
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2" onPaste={handlePaste}>
        {Array.from({ length }).map((_, idx) => {
          const char = value[idx] || "";
          return (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={char}
              onChange={(e) => handleTextChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "h-10 w-10 text-center font-mono font-bold text-base rounded-md border border-border bg-card shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50",
                error && "border-danger focus:ring-danger"
              )}
            />
          );
        })}
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
};

// 7. Autocomplete Input
export const AutocompleteInput = ({
  options = [],
  value = "",
  onChange,
  onSelect,
  placeholder,
  label,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-1 relative">
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary select-none">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange && onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-text-primary shadow-sm transition-all placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled",
            error && "border-danger focus-visible:ring-danger"
          )}
        />
      </div>

      {isOpen && value && filtered.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg max-h-[180px] overflow-y-auto p-1 animate-in fade-in slide-in-from-top-1 duration-100">
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect && onSelect(opt);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-left hover:bg-secondary transition-colors"
            >
              <span>{opt.label}</span>
              {value.toLowerCase() === opt.label.toLowerCase() && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
};
