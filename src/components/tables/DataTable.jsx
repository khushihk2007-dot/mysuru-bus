/**
 * @file DataTable.jsx
 * @description Reusable data table layouts (Sortable headers, Loading skeletons, Empty indicators, and Pagination Footers).
 */

import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../feedback/Loading";

// 1. Sortable Header
export const SortableHeader = ({ columnKey, currentSortKey, sortDirection, onSort, children, className }) => {
  const isSorted = columnKey === currentSortKey;
  
  return (
    <button
      onClick={() => onSort && onSort(columnKey)}
      className={cn(
        "flex items-center gap-1 hover:text-text-primary transition-colors text-[10px] font-bold uppercase tracking-wider text-text-muted focus:outline-none cursor-pointer",
        isSorted && "text-text-primary",
        className
      )}
    >
      <span>{children}</span>
      {isSorted ? (
        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
};

// 2. Empty Table row placeholder
export const EmptyTable = ({ colSpan = 5, message = "No records found in this table." }) => (
  <tr>
    <td colSpan={colSpan} className="py-10 text-center text-xs text-text-muted select-none">
      <div className="flex flex-col items-center justify-center gap-2">
        <span>{message}</span>
      </div>
    </td>
  </tr>
);

// 3. Loading Table row placeholder (Pulsing skeletons)
export const LoadingTable = ({ colSpan = 5, rowCount = 3 }) => (
  <>
    {Array.from({ length: rowCount }).map((_, rIdx) => (
      <tr key={rIdx} className="border-b border-border/30">
        {Array.from({ length: colSpan }).map((_, cIdx) => (
          <td key={cIdx} className="px-4 py-3">
            <Skeleton className="h-4 w-4/5 rounded-sm" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// 4. Pagination Footer (Page selectors and result counters)
export const PaginationFooter = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  className
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border/40 gap-3 select-none text-xs text-text-secondary w-full", className)}>
      <div>
        {totalItems > 0 ? (
          <p className="text-text-muted">
            Showing <span className="font-semibold text-text-primary">{startItem}</span> to{" "}
            <span className="font-semibold text-text-primary">{endItem}</span> of{" "}
            <span className="font-semibold text-text-primary">{totalItems}</span> entries
          </p>
        ) : (
          <p className="text-text-muted">Showing 0 to 0 of 0 entries</p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="px-2.5 py-1 border border-border rounded bg-card hover:bg-secondary text-text-secondary font-semibold transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => {
          const page = idx + 1;
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange && onPageChange(page)}
              className={cn(
                "px-2.5 py-1 border border-border rounded bg-card text-text-secondary font-semibold hover:bg-secondary transition-colors cursor-pointer",
                isCurrent && "bg-primary text-primary-foreground border-primary hover:bg-primary-hover hover:text-primary-foreground"
              )}
            >
              {page}
            </button>
          );
        })}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="px-2.5 py-1 border border-border rounded bg-card hover:bg-secondary text-text-secondary font-semibold transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// 5. Generic Data Table
export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage,
  className
}) => {
  return (
    <div className={cn("w-full border border-border rounded-lg bg-card overflow-x-auto shadow-sm", className)}>
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-secondary/40 border-b border-border/50 select-none">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold text-text-muted">
                {col.sortable ? (
                  <SortableHeader
                    columnKey={col.key}
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  >
                    {col.label}
                  </SortableHeader>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{col.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20 text-text-primary select-text">
          {isLoading ? (
            <LoadingTable colSpan={columns.length} />
          ) : data.length === 0 ? (
            <EmptyTable colSpan={columns.length} message={emptyMessage} />
          ) : (
            data.map((row, rIdx) => (
              <tr key={row.id || rIdx} className="hover:bg-secondary/20 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
