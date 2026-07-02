/**
 * @file Breadcrumb.jsx
 * @description Standard Breadcrumb navigation for nested views (e.g., Mysore Depot > Route 119 > Bus KA-09-F-1234).
 */

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export const Breadcrumb = ({ items = [], className, ...props }) => {
  return (
    <nav
      className={cn("flex items-center space-x-1.5 text-xs text-text-muted select-none", className)}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="inline-flex items-center space-x-1.5">
        <li className="inline-flex items-center">
          <Link
            href="/"
            onClick={(e) => e.preventDefault()}
            className="flex items-center hover:text-text-primary transition-colors gap-1"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center space-x-1.5">
              <ChevronRight className="h-3 w-3 text-text-muted shrink-0" />
              {isLast ? (
                <span className="font-semibold text-text-primary truncate max-w-[120px] md:max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || "#"}
                  onClick={(e) => {
                    if (!item.href) e.preventDefault();
                    item.onClick && item.onClick(e);
                  }}
                  className="hover:text-text-primary transition-colors truncate max-w-[100px] md:max-w-[180px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
Breadcrumb.displayName = "Breadcrumb";
export default Breadcrumb;
