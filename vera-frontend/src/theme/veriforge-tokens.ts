/**
 * VeriForge industrial safety design tokens — single source of truth.
 * Calm, authoritative compliance aesthetic: steel, graphite, safety blue.
 * Pure red is reserved for critical alerts only — never primary actions.
 */

export const COLORS = {
  /** @deprecated Prefer safetyBlue for brand; kept as alias for migration */
  forgeRed: "#1E6FB8",
  safetyBlue: "#1E6FB8",
  inspectionTeal: "#2F8F8C",
  deepSlate: "#2A2E33",
  graphite: "#3B3F45",
  ironBlack: "#1C1F24",
  steelGrey: "#5A6169",
  safetyWhite: "#F4F6F8",
  mutedAmber: "#C89F3D",
  softGreen: "#4FAF6F",
  /** Critical alerts only — never primary CTAs or action buttons */
  criticalAlert: "#B33A3A",
  metallicGradient:
    "linear-gradient(145deg, #1C1F24 0%, #2A2E33 48%, #3B3F45 100%)",
  panelSurface: "#23272C",
  panelElevated: "#2A2E33",
} as const;

export const GEOMETRY = {
  angularRadius: "3px",
  bevelEdge: "4px",
  cardBevel: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
} as const;

export const TYPOGRAPHY = {
  headingFont: 'Inter, Roboto, "Segoe UI", system-ui, sans-serif',
  bodyFont: 'Inter, Roboto, "Segoe UI", system-ui, sans-serif',
  headingWeight: 600,
  bodyWeight: 500,
} as const;

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
} as const;

export const SHADOWS = {
  metallicShadow: "0 1px 2px rgba(28, 31, 36, 0.35)",
  steelShadow: "0 1px 2px rgba(28, 31, 36, 0.2)",
  focusRing: "0 0 0 2px rgba(30, 111, 184, 0.35)",
} as const;

export const BORDERS = {
  redAccentBorder: "1px solid #1E6FB8",
  accentBorder: "1px solid #1E6FB8",
  steelBorder: "1px solid #5A6169",
  criticalBorder: "1px solid #B33A3A",
} as const;

/** Canonical industrial safety token system */
export const veriforgeTokens = {
  colors: COLORS,
  geometry: GEOMETRY,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  shadows: SHADOWS,
  borders: BORDERS,
} as const;

export type VeriForgeColors = typeof COLORS;
export type VeriForgeGeometry = typeof GEOMETRY;
export type VeriForgeTypography = typeof TYPOGRAPHY;
export type VeriForgeSpacing = typeof SPACING;
export type VeriForgeShadows = typeof SHADOWS;
export type VeriForgeBorders = typeof BORDERS;
export type VeriForgeTokens = typeof veriforgeTokens;

/** Flat CSS custom properties derived from industrial safety tokens */
export const veriforgeCssVars = {
  "--vf-color-forge-red": COLORS.safetyBlue,
  "--vf-color-safety-blue": COLORS.safetyBlue,
  "--vf-color-inspection-teal": COLORS.inspectionTeal,
  "--vf-color-deep-slate": COLORS.deepSlate,
  "--vf-color-graphite": COLORS.graphite,
  "--vf-color-iron-black": COLORS.ironBlack,
  "--vf-color-steel-grey": COLORS.steelGrey,
  "--vf-color-safety-white": COLORS.safetyWhite,
  "--vf-color-muted-amber": COLORS.mutedAmber,
  "--vf-color-soft-green": COLORS.softGreen,
  "--vf-color-critical": COLORS.criticalAlert,
  "--vf-effect-metallic-gradient": COLORS.metallicGradient,

  "--vf-radius-none": GEOMETRY.angularRadius,
  "--vf-bevel-edge": GEOMETRY.bevelEdge,
  "--vf-card-bevel": GEOMETRY.cardBevel,

  "--vf-font-heading": TYPOGRAPHY.headingFont,
  "--vf-font-body": TYPOGRAPHY.bodyFont,
  "--vf-font-primary": TYPOGRAPHY.headingFont,
  "--vf-heading-weight": String(TYPOGRAPHY.headingWeight),
  "--vf-body-weight": String(TYPOGRAPHY.bodyWeight),
  "--vf-heading-transform": "none",
  "--vf-body-transform": "none",

  "--vf-spacing-xs": SPACING.xs,
  "--vf-spacing-sm": SPACING.sm,
  "--vf-spacing-md": SPACING.md,
  "--vf-spacing-lg": SPACING.lg,
  "--vf-spacing-xl": SPACING.xl,

  "--vf-shadow-metal": SHADOWS.metallicShadow,
  "--vf-shadow-steel": SHADOWS.steelShadow,

  "--vf-border-red": BORDERS.accentBorder,
  "--vf-border-steel": BORDERS.steelBorder,
  "--vf-border-critical": BORDERS.criticalBorder,
} as const;

export type VeriForgeTokenVarName = keyof typeof veriforgeCssVars;

export {
  COLORS as colors,
  GEOMETRY as geometry,
  TYPOGRAPHY as typography,
  SPACING as spacing,
  SHADOWS as shadows,
  BORDERS as borders,
};

export default veriforgeTokens;
