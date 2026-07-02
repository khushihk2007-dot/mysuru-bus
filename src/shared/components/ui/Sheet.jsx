import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

export const Sheet = ({
  isOpen,
  onClose,
  position = "right",
  children,
  className,
  title,
  description,
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

  const positionClasses = {
    left: "left-0 top-0 bottom-0 h-full w-full max-w-sm border-r animate-in slide-in-from-left duration-300",
    right: "right-0 top-0 bottom-0 h-full w-full max-w-sm border-l animate-in slide-in-from-right duration-300",
    top: "top-0 left-0 right-0 w-full h-auto max-h-[80vh] border-b animate-in slide-in-from-top duration-300",
    bottom: "bottom-0 left-0 right-0 w-full h-auto max-h-[80vh] border-t animate-in slide-in-from-bottom duration-300",
  };

  return (
    <div className={cn("fixed inset-0", zIndex.drawer)}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay/40 backdrop-blur-[1px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Container */}
      <div
        className={cn(
          "fixed bg-card text-card-foreground p-6 shadow-xl border-border transition-all duration-300 flex flex-col focus:outline-none",
          positionClasses[position],
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-secondary transition-all focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {title && (
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text-primary leading-none">{title}</h2>
            {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1 pb-4", className)} {...props} />
);

export const SheetTitle = ({ className, ...props }) => (
  <h2 className={cn("text-base font-semibold text-text-primary", className)} {...props} />
);

export const SheetDescription = ({ className, ...props }) => (
  <p className={cn("text-xs text-text-muted", className)} {...props} />
);

export const SheetFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4 border-t border-border/40 mt-auto", className)} {...props} />
);
