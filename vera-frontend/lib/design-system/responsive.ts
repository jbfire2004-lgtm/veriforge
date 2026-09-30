import { breakpoints } from "./breakpoints";

/**
 * Responsive layout rules (§6).
 */
export const responsiveRules = {
  breakpoints,
  mobile: {
    maxWidth: breakpoints.sm - 1,
    sidebar: "drawer",
    tables: "cards",
    dashboard: "stacked",
    quickActions: "fab",
  },
  tablet: {
    minWidth: breakpoints.sm,
    maxWidth: breakpoints.lg - 1,
    sidebar: "collapsible",
    layout: "two-column",
  },
  desktop: {
    minWidth: breakpoints.lg,
    sidebar: "fixed",
    dashboard: "grid",
    layout: "multi-column",
  },
} as const;
