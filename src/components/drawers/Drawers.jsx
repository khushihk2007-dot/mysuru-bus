/**
 * @file Drawers.jsx
 * @description Slide-out drawers and information panels (Bottom Sheets, Side Drawers, Right Info Panels, and Floating Drawers) using Framer Motion.
 */

import React, { useEffect } from "react";
import { X, GripHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design/zIndex";

// 1. Bottom Sheet (Pulls up from bottom, common on mobile)
export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  ...props
}) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn("fixed inset-0", zIndex.drawer)}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-overlay/40 backdrop-blur-[1px]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 max-h-[85vh] bg-card border-t border-border rounded-t-2xl shadow-xl p-4 flex flex-col focus:outline-none select-none",
              className
            )}
            role="dialog"
            aria-modal="true"
            {...props}
          >
            {/* Grab handle indicator */}
            <div className="flex justify-center mb-2 shrink-0">
              <GripHorizontal className="h-5 w-10 text-text-muted cursor-grab" />
            </div>

            <div className="flex justify-between items-center mb-3">
              {title && <h3 className="text-sm font-bold text-text-primary">{title}</h3>}
              <button
                onClick={onClose}
                className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 select-text">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 2. Side Drawer (Slides from left or right)
export const SideDrawer = ({
  isOpen,
  onClose,
  position = "left",
  title,
  children,
  className,
  ...props
}) => {
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

  const slideOrigin = position === "left" ? { x: "-100%" } : { x: "100%" };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn("fixed inset-0", zIndex.drawer)}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-overlay/40 backdrop-blur-[1px]"
          />
          
          {/* Drawer container */}
          <motion.div
            initial={slideOrigin}
            animate={{ x: 0 }}
            exit={slideOrigin}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed top-0 bottom-0 h-full w-full max-w-sm bg-card p-6 shadow-xl border-border flex flex-col focus:outline-none select-none",
              position === "left" ? "left-0 border-r" : "right-0 border-l",
              className
            )}
            role="dialog"
            aria-modal="true"
            {...props}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded text-text-muted hover:text-text-primary hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {title && (
              <h3 className="text-sm font-bold text-text-primary mb-4 pr-6 leading-none">
                {title}
              </h3>
            )}
            <div className="flex-1 overflow-y-auto min-h-0 select-text">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 3. Right Information Panel (Standard detail sidebar panel)
export const RightInformationPanel = ({ isOpen, onClose, title, children, className, ...props }) => (
  <SideDrawer
    isOpen={isOpen}
    onClose={onClose}
    position="right"
    title={title}
    className={cn("max-w-md", className)}
    {...props}
  >
    {children}
  </SideDrawer>
);

// 4. Floating Drawer (Has outer margins, elevated cards)
export const FloatingDrawer = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  ...props
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn("fixed inset-0 pointer-events-none", zIndex.drawer)}>
          {/* Backdrop (enabled clickable backdrop bounds) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-overlay/25 backdrop-blur-[0.5px] pointer-events-auto"
          />

          <motion.div
            initial={{ x: "120%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "120%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={cn(
              "fixed top-4 bottom-4 right-4 w-full max-w-sm rounded-xl border border-border bg-card/95 backdrop-blur-md p-5 shadow-2xl flex flex-col focus:outline-none pointer-events-auto select-none",
              className
            )}
            role="dialog"
            {...props}
          >
            <div className="flex justify-between items-center mb-3">
              {title && <h3 className="text-sm font-bold text-text-primary truncate">{title}</h3>}
              <button
                onClick={onClose}
                className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 select-text">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
