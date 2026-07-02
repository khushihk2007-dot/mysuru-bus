/**
 * @file Pagination.jsx
 * @description Standard table pagination footer layout including next, previous, and page counts.
 */

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
  ...props
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      if (start === 1) {
        end = maxVisible;
      } else if (end === totalPages) {
        start = totalPages - maxVisible + 1;
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <nav
      className={cn("flex items-center justify-between px-2 py-3 border-t border-border/40 select-none", className)}
      aria-label="Pagination Navigation"
      {...props}
    >
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-secondary disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="relative ml-3 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-secondary disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-text-muted">
            Page <span className="font-semibold text-text-primary">{currentPage}</span> of{" "}
            <span className="font-semibold text-text-primary">{totalPages}</span>
          </p>
        </div>

        <div>
          <div className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination Grid">
            {/* First Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange && onPageChange(1)}
              className="relative inline-flex items-center rounded-l-md border border-border bg-card p-2 text-xs font-medium text-text-secondary hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            {/* Prev Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              className="relative inline-flex items-center border-y border-r border-border bg-card p-2 text-xs font-medium text-text-secondary hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {getPageNumbers().map((p) => {
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => onPageChange && onPageChange(p)}
                  className={cn(
                    "relative inline-flex items-center border-y border-r border-border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer",
                    isCurrent
                      ? "z-10 bg-primary text-primary-foreground border-primary"
                      : "bg-card text-text-secondary hover:bg-secondary"
                  )}
                >
                  {p}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              className="relative inline-flex items-center border-y border-r border-border bg-card p-2 text-xs font-medium text-text-secondary hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            {/* Last Page */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange && onPageChange(totalPages)}
              className="relative inline-flex items-center rounded-r-md border border-y border-r border-border bg-card p-2 text-xs font-medium text-text-secondary hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
Pagination.displayName = "Pagination";
export default Pagination;
