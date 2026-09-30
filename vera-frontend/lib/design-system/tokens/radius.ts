/**
 * Border radius tokens (§4).
 */

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const cssRadiusVars = {
  sm: "--radius-sm",
  md: "--radius-md",
  lg: "--radius-lg",
  full: "--radius-full",
} as const;
