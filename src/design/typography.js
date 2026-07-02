export const typography = {
  // Font Stack Tokens
  fonts: {
    sans: "font-sans",
    mono: "font-mono",
  },

  // Complete Typography Scale (Tailwind utility combination classes)
  display: "text-4xl font-extrabold tracking-tight leading-none",
  h1: "text-3xl font-bold tracking-tight leading-tight",
  h2: "text-2xl font-semibold tracking-tight leading-snug",
  h3: "text-xl font-semibold tracking-tight leading-snug",
  title: "text-lg font-semibold tracking-normal leading-normal",
  subtitle: "text-base font-medium tracking-normal text-text-secondary leading-relaxed",
  bodyLarge: "text-base font-normal leading-relaxed text-text-primary",
  body: "text-sm font-normal leading-normal text-text-primary",
  bodySmall: "text-xs font-normal leading-normal text-text-secondary",
  caption: "text-xs font-normal text-text-muted leading-none",
  overline: "text-[11px] font-bold uppercase tracking-wider text-text-muted",
  code: "font-mono text-xs bg-secondary px-1.5 py-0.5 rounded border border-border text-foreground",

  // Raw Font Weights
  weights: {
    light: "font-light",      // 300
    normal: "font-normal",    // 400
    medium: "font-medium",    // 500
    semibold: "font-semibold",// 600
    bold: "font-bold",        // 700
    extrabold: "font-extrabold",// 800
  },

  // Raw Line Heights
  leading: {
    none: "leading-none",       // 1
    tight: "leading-tight",     // 1.25
    snug: "leading-snug",       // 1.375
    normal: "leading-normal",   // 1.5
    relaxed: "leading-relaxed", // 1.625
    loose: "leading-loose",     // 2
  },

  // Raw Letter Spacing
  tracking: {
    tighter: "tracking-tighter", // -0.05em
    tight: "tracking-tight",     // -0.025em
    normal: "tracking-normal",   // 0em
    wide: "tracking-wide",       // 0.025em
    wider: "tracking-wider",     // 0.05em
    widest: "tracking-widest",   // 0.1em
  }
};
