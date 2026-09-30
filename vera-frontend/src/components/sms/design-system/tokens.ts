/**
 * Vera SMS design system — programmatic tokens (mirror CSS vars in theme.css).
 * Use inside `.sf-theme` for field safety / SMS surfaces.
 */

export const smsColors = {
  primary: "var(--sf-primary)",
  primaryHover: "var(--sf-primary-hover)",
  primaryMuted: "var(--sf-primary-muted)",
  secondary: "var(--sms-secondary)",
  secondaryMuted: "var(--sms-secondary-muted)",
  success: "var(--sf-success)",
  warning: "var(--sf-warning)",
  danger: "var(--sf-danger)",
  background: "var(--sf-bg)",
  surface: "var(--sf-surface)",
  surfaceHover: "var(--sf-surface-hover)",
  border: "var(--sf-border)",
  borderStrong: "var(--sf-border-strong)",
  text: "var(--sf-text)",
  textMuted: "var(--sf-text-muted)",
  textSubtle: "var(--sf-text-subtle)",
} as const;

/** 4px base spacing scale */
export const smsSpacing = {
  0: "0",
  1: "var(--sms-space-1)",
  2: "var(--sms-space-2)",
  3: "var(--sms-space-3)",
  4: "var(--sms-space-4)",
  5: "var(--sms-space-5)",
  6: "var(--sms-space-6)",
  8: "var(--sms-space-8)",
  10: "var(--sms-space-10)",
} as const;

export const smsTypography = {
  display: "sms-text-display",
  h1: "sms-text-h1",
  h2: "sms-text-h2",
  h3: "sms-text-h3",
  body: "sms-text-body",
  bodyMuted: "sms-text-body-muted",
  label: "sms-text-label",
  caption: "sms-text-caption",
} as const;

/** Mobile-first breakpoints (match Tailwind defaults) */
export const smsBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const smsIconSizes = {
  sm: "vera-icon-sm h-4 w-4",
  md: "vera-icon-md h-5 w-5",
  lg: "vera-icon-lg h-6 w-6",
} as const;
