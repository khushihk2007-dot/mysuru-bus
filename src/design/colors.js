export const colors = {
  // Raw CSS Custom Property tokens
  tokens: {
    primary: "var(--primary)",
    primaryHover: "var(--primary-hover)",
    primaryActive: "var(--primary-active)",
    secondary: "var(--secondary)",
    secondaryHover: "var(--secondary-hover)",
    accent: "var(--accent)",
    background: "var(--background)",
    surface: "var(--surface)",
    surfaceSecondary: "var(--surface-secondary)",
    card: "var(--card)",
    border: "var(--border)",
    borderStrong: "var(--border-strong)",
    textPrimary: "var(--text-primary)",
    textSecondary: "var(--text-secondary)",
    textMuted: "var(--text-muted)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    info: "var(--info)",
    disabled: "var(--disabled)",
    overlay: "var(--overlay)",
    focusRing: "var(--focus-ring)",
    
    // Map specific colors
    mapWater: "var(--map-water)",
    mapRoads: "var(--map-roads)",
    mapParks: "var(--map-parks)",
    mapBuildings: "var(--map-buildings)",

    // Route colors (16 distinct colors for transit mapping)
    routes: {
      route1: "var(--route-1)",
      route2: "var(--route-2)",
      route3: "var(--route-3)",
      route4: "var(--route-4)",
      route5: "var(--route-5)",
      route6: "var(--route-6)",
      route7: "var(--route-7)",
      route8: "var(--route-8)",
      route9: "var(--route-9)",
      route10: "var(--route-10)",
      route11: "var(--route-11)",
      route12: "var(--route-12)",
      route13: "var(--route-13)",
      route14: "var(--route-14)",
      route15: "var(--route-15)",
      route16: "var(--route-16)",
    }
  },

  // Tailwind theme utility class helper maps (convenient for component design)
  bg: {
    primary: "bg-primary text-primary-foreground",
    primaryHover: "hover:bg-primary-hover",
    primaryActive: "active:bg-primary-active",
    secondary: "bg-secondary text-secondary-foreground",
    secondaryHover: "hover:bg-secondary-hover",
    accent: "bg-accent text-accent-foreground",
    background: "bg-background text-foreground",
    surface: "bg-surface text-foreground",
    surfaceSecondary: "bg-surface-secondary text-foreground",
    card: "bg-card text-card-foreground border border-border",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-info text-info-foreground",
    disabled: "bg-disabled text-disabled-foreground cursor-not-allowed",
    overlay: "bg-overlay",
    mapWater: "bg-map-water",
    mapRoads: "bg-map-roads",
    mapParks: "bg-map-parks",
    mapBuildings: "bg-map-buildings",
  },
  
  text: {
    primary: "text-text-primary",
    secondary: "text-text-secondary",
    muted: "text-text-muted",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
    disabled: "text-disabled-foreground",
  },

  border: {
    default: "border-border",
    strong: "border-border-strong",
    primary: "border-primary",
    secondary: "border-secondary",
    success: "border-success",
    warning: "border-warning",
    danger: "border-danger",
    focus: "focus:border-primary focus:ring-1 focus:ring-ring",
  },

  ring: {
    default: "ring-1 ring-ring",
    focus: "focus:ring-2 focus:ring-ring focus:ring-offset-2",
  }
};
