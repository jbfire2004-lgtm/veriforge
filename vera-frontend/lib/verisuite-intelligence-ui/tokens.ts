/**
 * VeriSuite Intelligence UI — LOCKED design tokens (Step 1 authoritative).
 * Do not introduce alternate palettes, radii, or typefaces in SMS hubs.
 * Source of truth: /pm/sms-mockups + this file + tokens.css
 */

export const VS_COLORS = {
  navy: "#0D1B2A",
  slate: "#1B263B",
  panel: "#152033",
  border: "#2A3A52",
  blue: "#00A3FF",
  orange: "#FF7A00",
  emerald: "#00C98D",
  white: "#F5F7FA",
  muted: "#8B9BB4",
  critical: "#FF4D6A",
  heatLow: "#0D1B2A",
  heatMid: "#00A3FF",
  heatHigh: "#FF7A00",
} as const;

export type VsTone = "neutral" | "info" | "positive" | "caution" | "critical";

export function toneColor(tone: VsTone): string {
  switch (tone) {
    case "positive":
      return VS_COLORS.emerald;
    case "caution":
      return VS_COLORS.orange;
    case "critical":
      return VS_COLORS.critical;
    case "info":
      return VS_COLORS.blue;
    default:
      return VS_COLORS.white;
  }
}

/** Panel / card radius — platform --vera-card-radius (6px); badges use --vera-badge-radius */
export const VS_RADIUS = "var(--vera-card-radius, 6px)";

export const VS_FONT =
  'var(--font-sans), var(--font-ibm-plex-sans), "IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
export const VS_MONO =
  'var(--font-mono), var(--font-ibm-plex-mono), "IBM Plex Mono", "SF Mono", ui-monospace, monospace';

/** Spacing scale (px) — mirrors platform --space-* */
export const VS_SPACE = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Typography scale — desktop; tablet may step title down one */
export const VS_TYPE = {
  display: { size: 28, weight: 600, lineHeight: 1.2, tracking: "-0.02em" },
  title: { size: 22, weight: 600, lineHeight: 1.25, tracking: "-0.01em" },
  subtitle: { size: 16, weight: 600, lineHeight: 1.35, tracking: "0" },
  body: { size: 14, weight: 400, lineHeight: 1.5, tracking: "0" },
  bodySm: { size: 13, weight: 400, lineHeight: 1.45, tracking: "0" },
  label: { size: 11, weight: 600, lineHeight: 1.3, tracking: "0.08em" },
  meta: { size: 10, weight: 700, lineHeight: 1.3, tracking: "0.12em" },
  kpi: { size: 30, weight: 600, lineHeight: 1.1, tracking: "-0.02em" },
} as const;

export const VS_MOTION = {
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  fast: "140ms",
  normal: "180ms",
  band: "320ms",
  hoverLift: "-1px",
} as const;

export const VS_LAYOUT = {
  shellMaxDesktop: "72rem",
  shellMaxTablet: "48rem",
  bandGap: 32,
  kpiMinWidth: 140,
  touchTargetMin: 44,
} as const;

/** Design system lock metadata for engineering handoff */
export const VS_DESIGN_LOCK = {
  version: "1.1.0-final",
  status: "FINALIZED" as const,
  authoritativeRoute: "/pm/sms-mockups",
  palette: {
    navy: "#0D1B2A",
    slate: "#1B263B",
    electricBlue: "#00A3FF",
  },
  forbidden: [
    "purple / indigo gradient themes",
    "cream warm backgrounds",
    "Inter / Roboto / Arial as primary in SMS hubs",
    "rounded-full pills in hubs",
    "multi-layer drop shadows",
    "glow neon stacks beyond electric blue accents",
    "sidebars for module switching",
  ],
} as const;
