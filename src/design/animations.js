export const animations = {
  // Duration class helpers
  durations: {
    veryFast: "duration-75",    // 75ms  - active clicks, micro-interactions
    fast: "duration-150",       // 150ms - hover states, fade ins
    medium: "duration-300",     // 300ms - collapsibles, drawers, sidebars
    slow: "duration-500",       // 500ms - large page transitions, map loaders
    verySlow: "duration-700",   // 700ms - slower background fades
  },

  // Easing class helpers
  easings: {
    default: "ease-in-out",
    in: "ease-in",
    out: "ease-out",
    premium: "ease-[cubic-bezier(0.16,1,0.3,1)]", // Custom elegant ease-out for panel animations
  },

  // Transition target helpers
  transitions: {
    all: "transition-all",
    colors: "transition-colors",
    opacity: "transition-opacity",
    transform: "transition-transform",
    shadow: "transition-shadow",
    none: "transition-none",
  },

  // Interactive micro-motions
  hoverLift: "transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0",
  hoverScale: "transition-all duration-150 ease-out hover:scale-[1.01] active:scale-[0.99]",
  fade: "transition-opacity duration-150 ease-in-out",
  slide: "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",

  // Component structural movements
  drawer: "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  dialog: "transition-all duration-200 ease-out",
  sidebar: "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",

  // Raw CSS Custom Property tokens
  tokens: {
    durationVeryFast: "75ms",
    durationFast: "150ms",
    durationMedium: "300ms",
    durationSlow: "500ms",
    durationVerySlow: "700ms",
    easePremium: "cubic-bezier(0.16, 1, 0.3, 1)",
  }
};
