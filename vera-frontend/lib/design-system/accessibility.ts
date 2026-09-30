/**
 * Accessibility rules (§10).
 */

export const a11y = {
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]",
  srOnly: "sr-only",
  skipLink:
    "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:px-[var(--space-4)] focus:py-[var(--space-2)] focus:shadow-[var(--shadow-md)] focus:text-[var(--foreground)]",
} as const;

/** Minimum touch target (WCAG 2.5.5) */
export const minTouchTarget = "min-h-[44px] min-w-[44px]";

export const a11yRules = {
  contrast: "WCAG AA minimum for text and interactive elements",
  keyboard: "All interactive controls reachable via Tab; Escape closes overlays",
  focus: "Visible focus ring using --ring token",
  aria: "Labels on icon-only buttons; live regions for async errors",
  motion: "Respect prefers-reduced-motion (see globals.css)",
} as const;
