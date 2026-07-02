export const radius = {
  // Border radius utility class mapping
  sm: "rounded-sm",       // 4px / 0.25rem - for small inputs, badges, checkboxes
  md: "rounded-md",       // 6px / 0.375rem - for standard buttons, inner containers
  lg: "rounded-lg",       // 8px / 0.5rem - for cards, sidebars, main controls
  xl: "rounded-xl",       // 12px / 0.75rem - for large modals, sheets
  "2xl": "rounded-2xl",   // 16px / 1rem - for outer containers, hero cards
  pill: "rounded-full",   // 9999px - for chips, pill buttons, tags
  circle: "rounded-full aspect-square", // for avatar shapes, circular buttons

  // Raw CSS Custom Property tokens
  tokens: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    "2xl": "var(--radius-2xl)",
    pill: "9999px",
  }
};
