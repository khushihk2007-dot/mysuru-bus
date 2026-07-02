import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { zIndex } from "@/design/zIndex";

export const Dialog = ({
  isOpen,
  onClose,
  children,
  className,
  ...props
}) => {
  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose && onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 flex items-center justify-center p-4", zIndex.modal)}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay/40 backdrop-blur-[1px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Container */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-text-primary focus-visible:outline-none",
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-secondary transition-all focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
};

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left pb-4", className)} {...props} />
);

export const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight text-text-primary", className)} {...props} />
);

export const DialogDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-text-muted", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4 border-t border-border/40 mt-6", className)} {...props} />
);
