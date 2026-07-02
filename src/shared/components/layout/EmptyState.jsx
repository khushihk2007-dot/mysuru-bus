import React from "react";
import { EmptyState as UIEmptyState } from "../ui/EmptyState";
import { FolderOpen } from "lucide-react";

export function EmptyState({ 
  title = "No data available", 
  description = "There is nothing to display here at the moment.", 
  icon = FolderOpen 
}) {
  return (
    <UIEmptyState
      title={title}
      description={description}
      icon={icon}
    />
  );
}
