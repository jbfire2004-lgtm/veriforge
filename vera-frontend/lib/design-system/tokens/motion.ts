/**
 * Motion / animation tokens (§9).
 */

export const transition = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
} as const;

export const easing = {
  default: "cubic-bezier(0.22, 1, 0.36, 1)",
  out: "ease-out",
} as const;

export const cssMotionVars = {
  transitionFast: "--transition-fast",
  transitionNormal: "--transition-normal",
  transitionSlow: "--transition-slow",
} as const;

/** Use on interactive elements */
export const motionClass = {
  base: "transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-[var(--transition-fast)] ease-out",
  normal: "transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-[var(--transition-normal)] ease-out",
} as const;
