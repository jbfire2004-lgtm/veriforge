/**
 * Elevation / shadow tokens (§4).
 */

export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.15)",
  card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
} as const;

export const cssShadowVars = {
  sm: "--shadow-sm",
  md: "--shadow-md",
  lg: "--shadow-lg",
  card: "--shadow-card",
} as const;
