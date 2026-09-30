/**
 * Typography tokens (§2).
 */

export const fontFamily = {
  sans: 'var(--font-sans), "Inter", system-ui, sans-serif',
  mono: 'var(--font-mono), "JetBrains Mono", monospace',
} as const;

export const fontSize = {
  xs: "12px",
  sm: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const cssTypographyVars = {
  fontSans: "--font-sans",
  fontMono: "--font-mono",
  textXs: "--text-xs",
  textSm: "--text-sm",
  textMd: "--text-md",
  textLg: "--text-lg",
  textXl: "--text-xl",
  text2xl: "--text-2xl",
  text3xl: "--text-3xl",
  weightRegular: "--weight-regular",
  weightMedium: "--weight-medium",
  weightSemibold: "--weight-semibold",
  weightBold: "--weight-bold",
  leadingTight: "--leading-tight",
  leadingNormal: "--leading-normal",
  leadingRelaxed: "--leading-relaxed",
} as const;
