/**
 * @file Dialogs.jsx
 * @description Modals and confirmation dialog overlays (Confirm, Delete, Info, Route Details, Settings) with ESC close hooks.
 */

import React, { useEffect } from "react";
import { X, AlertTriangle, Info as InfoIcon, Settings, Route, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";
import { Button } from "../buttons/Button";

// Core Modal Base
export const Dialog = ({
  isOpen,
  onClose,
  children,
  className,
  ...props
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose && onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
      
      {/* Box */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-text-primary focus:outline-none select-none",
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

// 1. Confirmation Dialog
export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "Please confirm this action to continue.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false
}) => (
  <Dialog isOpen={isOpen} onClose={onClose}>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-1 border-b border-border/40">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      </div>
      <p className="text-xs text-text-muted leading-relaxed select-text">{description}</p>
      
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/40">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant="primary" size="sm" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </div>
  </Dialog>
);

// 2. Delete Dialog
export const DeleteDialog = ({
  isOpen,
  onClose,
  onDelete,
  title = "Delete resource?",
  description = "This action is permanent and cannot be undone. All active fleet configurations will be lost.",
  deleteText = "Delete Permanently",
  cancelText = "Cancel",
  isLoading = false
}) => (
  <Dialog isOpen={isOpen} onClose={onClose}>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-1 border-b border-border/40">
        <Trash2 className="h-5 w-5 text-danger shrink-0" />
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      </div>
      <p className="text-xs text-text-muted leading-relaxed select-text">{description}</p>
      
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/40">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} isLoading={isLoading}>
          {deleteText}
        </Button>
      </div>
    </div>
  </Dialog>
);

// 3. Information Dialog
export const InformationDialog = ({
  isOpen,
  onClose,
  title = "Information Alert",
  children
}) => (
  <Dialog isOpen={isOpen} onClose={onClose}>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-1 border-b border-border/40">
        <InfoIcon className="h-5 w-5 text-info shrink-0" />
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      </div>
      <div className="text-xs text-text-secondary leading-relaxed select-text">
        {children}
      </div>
      <div className="flex justify-end mt-4 pt-3 border-t border-border/40">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close Panel
        </Button>
      </div>
    </div>
  </Dialog>
);

// 4. Route Details Dialog (Specially formatted transit route viewer)
export const RouteDetailsDialog = ({
  isOpen,
  onClose,
  routeCode,
  routeName,
  stopsCount,
  distanceKm,
  durationMins,
  schedulesCount
}) => (
  <Dialog isOpen={isOpen} onClose={onClose} className="max-w-lg">
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
        <Route className="h-5 w-5 text-primary shrink-0" />
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-mono font-bold rounded-sm">
            {routeCode}
          </span>
          <h3 className="text-sm font-bold text-text-primary">{routeName}</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center border-b border-border/40 pb-4 select-text">
        <div className="p-3 bg-secondary rounded-lg">
          <span className="text-[10px] text-text-muted block font-semibold uppercase">Total Stops</span>
          <span className="text-base font-bold text-text-primary">{stopsCount} stops</span>
        </div>
        <div className="p-3 bg-secondary rounded-lg">
          <span className="text-[10px] text-text-muted block font-semibold uppercase">Distance</span>
          <span className="text-base font-bold text-text-primary font-mono">{distanceKm} km</span>
        </div>
        <div className="p-3 bg-secondary rounded-lg">
          <span className="text-[10px] text-text-muted block font-semibold uppercase">Travel Time</span>
          <span className="text-base font-bold text-text-primary font-mono">{durationMins} mins</span>
        </div>
      </div>

      <div className="text-xs flex flex-col gap-1.5">
        <span className="font-semibold text-text-secondary uppercase tracking-wider text-[10px]">Operations schedule</span>
        <div className="flex justify-between items-center text-text-muted py-1 border-b border-border/20">
          <span>Weekly frequency</span>
          <span className="font-semibold text-text-primary">{schedulesCount} daily runs</span>
        </div>
        <div className="flex justify-between items-center text-text-muted py-1">
          <span>Active telemetry</span>
          <span className="font-semibold text-success flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-success inline-block animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/40">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close Details
        </Button>
      </div>
    </div>
  </Dialog>
);

// 5. Settings Dialog
export const SettingsDialog = ({
  isOpen,
  onClose,
  children,
  title = "System Settings"
}) => (
  <Dialog isOpen={isOpen} onClose={onClose} className="max-w-lg">
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <Settings className="h-5 w-5 text-text-secondary shrink-0" />
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      </div>
      
      <div className="flex flex-col gap-4 py-2 select-text">
        {children}
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/40">
        <Button variant="primary" size="sm" onClick={onClose}>
          Save & Close
        </Button>
      </div>
    </div>
  </Dialog>
);
