import React from "react";
import { typography } from "@/design/typography";
import { colors } from "@/design/colors";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between pb-4 mb-4 border-b border-border">
      <div>
        <h1 className={`${typography.h3} font-bold text-foreground`}>{title}</h1>
        {description && <p className={`${typography.bodySmall} ${colors.muted} mt-0.5`}>{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
