/**
 * Responsive breakpoints (§7).
 */

export const screens = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const cssScreenVars = {
  sm: "--screen-sm",
  md: "--screen-md",
  lg: "--screen-lg",
  xl: "--screen-xl",
} as const;

export const media = {
  mobile: `(max-width: ${screens.sm - 1}px)`,
  tablet: `(min-width: ${screens.sm}px) and (max-width: ${screens.lg - 1}px)`,
  desktop: `(min-width: ${screens.lg}px)`,
} as const;
