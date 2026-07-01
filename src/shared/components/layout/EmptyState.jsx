import React from "react";
import { FolderOpen } from "lucide-react";
import { colors } from "@/design/colors";
import { typography } from "@/design/typography";

export function EmptyState({ title = "No data available", description = "There is nothing to display here at the moment.", icon: Icon = FolderOpen }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[200px]">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className={`w-8 h-8 ${colors.muted}`} aria-hidden="true" />
      </div>
      <h3 className={`${typography.h4} mb-1`}>{title}</h3>
      <p className={`${typography.bodySmall} ${colors.muted} max-w-[240px]`}>{description}</p>
    </div>
  );
}
