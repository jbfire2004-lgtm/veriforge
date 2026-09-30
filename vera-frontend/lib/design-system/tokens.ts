/**
 * Backward-compatible re-exports for early vera-core / wireframe imports.
 */
import { palette } from "./tokens/colors";
import { space } from "./tokens/spacing";
import { radius } from "./tokens/radius";
import { shadows } from "./tokens/shadows";

export const colors = {
  primary: palette.primary,
  primaryHover: palette.primaryDark,
  secondary: palette.gray500,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  background: palette.gray50,
  surface: palette.surface,
  border: palette.border,
  muted: palette.gray500,
  foreground: palette.gray900,
} as const;

export const spacing = {
  1: space[1],
  2: space[2],
  3: space[3],
  4: space[4],
  5: space[6],
  6: space[8],
} as const;

export { radius, shadows };

export const typography = {
  fontSans: 'var(--font-sans), "Inter", system-ui, sans-serif',
  fontMono: 'var(--font-mono), "JetBrains Mono", monospace',
  headingWeight: 700,
  bodyWeight: 400,
  labelWeight: 500,
} as const;

export const complianceStatusColors = {
  compliant: palette.success,
  expiring: palette.warning,
  nonCompliant: palette.danger,
  inactive: palette.gray500,
} as const;
