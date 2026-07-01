import React from "react";
import { colors } from "@/design/colors";
import { radius } from "@/design/radius";
import { shadows } from "@/design/shadows";

export function SectionCard({ children, className = "" }) {
  return (
    <div className={`p-4 bg-card border border-border ${radius.lg} ${shadows.sm} ${className}`}>
      {children}
    </div>
  );
}
