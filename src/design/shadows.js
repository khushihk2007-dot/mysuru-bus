export const shadows = {
  // Elevation scale classes
  level0: "shadow-none",
  level1: "shadow-sm border border-border/40",                 // Subtle cards, list items
  level2: "shadow-md border border-border/60",                 // Floating controls, map tools
  level3: "shadow-lg border border-border/80",                 // Sidebars, dropdown popups
  level4: "shadow-xl border border-border",                    // Modals, sheets, dialogs

  // Specific semantic component shadow mappings
  card: "shadow-sm border border-border/40 hover:shadow-md hover:border-border/80 transition-all duration-200",
  floatingPanel: "shadow-md border border-border/60 bg-card",
  dialog: "shadow-xl border border-border bg-card",
  dropdown: "shadow-lg border border-border/60 bg-popover",
  tooltip: "shadow-sm border border-border/30 bg-popover text-popover-foreground text-xs",

  // Raw CSS Custom Property tokens
  tokens: {
    level0: "none",
    level1: "var(--shadow-level1)",
    level2: "var(--shadow-level2)",
    level3: "var(--shadow-level3)",
    level4: "var(--shadow-level4)",
  }
};
