/**
 * @file Notification.jsx
 * @description Transit alerts and message displays (Alert Banners, Snackbars, and Toasts) with semantic icons.
 */

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

// 1. Alert Banner (Static/Sticky top warning notice)
export const AlertBanner = ({
  message,
  type = "info", // 'info' | 'success' | 'warning' | 'danger'
  onClose,
  className,
  ...props
}) => {
  const styles = {
    info: "bg-info/10 text-info border-info/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
  };

  const icons = {
    info: <Info className="h-4 w-4 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0" />,
    danger: <AlertCircle className="h-4 w-4 shrink-0" />,
  };

  return (
    <div
      className={cn(
        "w-full border-b px-4 py-2.5 text-xs flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200 select-none",
        styles[type],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-0.5 rounded-full hover:bg-secondary/40 text-current transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

// 2. Snackbar (Bottom transient message popup)
export const Snackbar = ({
  message,
  actionText,
  onAction,
  isOpen,
  onClose,
  duration = 4000,
  className,
  ...props
}) => {
  useEffect(() => {
    if (isOpen && onClose) {
      const id = setTimeout(onClose, duration);
      return () => clearTimeout(id);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-between gap-4 px-4 py-2.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 shadow-lg text-xs w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200 select-none",
        zIndex.toast,
        className
      )}
      role="status"
      {...props}
    >
      <span className="font-medium truncate">{message}</span>
      <div className="flex items-center gap-2 shrink-0">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="text-primary dark:text-primary-hover font-bold hover:underline"
          >
            {actionText}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="p-0.5 rounded-full hover:bg-white/10 dark:hover:bg-black/10 text-neutral-400">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// 3. Toast Component (Individual list node card)
export const Toast = ({
  title,
  description,
  type = "default", // 'default' | 'success' | 'warning' | 'danger'
  onClose,
  className,
  ...props
}) => {
  const icons = {
    default: <Bell className="h-4 w-4 text-text-secondary" />,
    success: <CheckCircle2 className="h-4 w-4 text-success" />,
    warning: <AlertTriangle className="h-4 w-4 text-warning" />,
    danger: <AlertCircle className="h-4 w-4 text-danger" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-lg border border-border bg-card shadow-lg w-[320px] select-none text-text-primary animate-in fade-in slide-in-from-right-3 duration-200 relative",
        className
      )}
      role="status"
      {...props}
    >
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-4">
        {title && <span className="font-semibold text-xs leading-none">{title}</span>}
        {description && <p className="text-[11px] text-text-muted leading-snug">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 p-0.5 rounded-full text-text-muted hover:text-text-primary hover:bg-secondary transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

// 4. Alert Box variants (Standard page notice box templates)

export const SuccessAlert = ({ title = "Success", children, className }) => (
  <div className={cn("flex gap-3 p-3.5 rounded-lg border border-success/20 bg-success/5 text-xs text-success", className)}>
    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
    <div className="flex flex-col gap-0.5">
      <span className="font-bold">{title}</span>
      <div className="text-success/90">{children}</div>
    </div>
  </div>
);

export const WarningAlert = ({ title = "Warning", children, className }) => (
  <div className={cn("flex gap-3 p-3.5 rounded-lg border border-warning/20 bg-warning/5 text-xs text-warning", className)}>
    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
    <div className="flex flex-col gap-0.5">
      <span className="font-bold">{title}</span>
      <div className="text-warning/90">{children}</div>
    </div>
  </div>
);

export const DangerAlert = ({ title = "Alert", children, className }) => (
  <div className={cn("flex gap-3 p-3.5 rounded-lg border border-danger/20 bg-danger/5 text-xs text-danger", className)}>
    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
    <div className="flex flex-col gap-0.5">
      <span className="font-bold">{title}</span>
      <div className="text-danger/90">{children}</div>
    </div>
  </div>
);

export const InformationAlert = ({ title = "Notice", children, className }) => (
  <div className={cn("flex gap-3 p-3.5 rounded-lg border border-info/20 bg-info/5 text-xs text-info", className)}>
    <Info className="h-4 w-4 shrink-0 mt-0.5" />
    <div className="flex flex-col gap-0.5">
      <span className="font-bold">{title}</span>
      <div className="text-info/90">{children}</div>
    </div>
  </div>
);
