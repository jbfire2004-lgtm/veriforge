/**
 * VeriForge Safety Platform Design System v3
 * Regenerated industrial UI kit — trust, safety, professional compliance.
 *
 * Visual language
 * - Industrial, structured, modern
 * - Inspired by inspection tags, safety signage, ISO iconography
 * - Muted palette with controlled accents
 * - No glossy, saturated, or danger-button styles
 *
 * Palette
 * - Primary: deep slate #2A2E33 · graphite #3B3F45
 * - Secondary: safety blue #1E6FB8 · inspection teal #2F8F8C
 * - Status: muted amber #C89F3D · soft green #4FAF6F
 * - Critical alerts only: #B33A3A
 *
 * Geometry: 3px radius · 1px borders · matte · no glossy gradients
 * Type: Inter / Roboto · medium weight · high legibility
 */

export {
  COLORS,
  GEOMETRY,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDERS,
} from "@/src/theme/veriforge-tokens";
/** Token objects live in `./tokens` — avoid re-export clash on the barrel. */

export {
  vfSurface,
  vfHeader,
  vfTable,
  vfForm,
  vfNav,
} from "./surfaces";

export {
  VERIFORGE_VISUAL_LANGUAGE,
  VERIFORGE_LOGO_DIRECTION,
  VERIFORGE_IMAGERY_RULES,
  VERIFORGE_BRAND_POSITIONING,
} from "./brand-identity-spec";

export { VERIFORGE_UI_KIT, VERIFORGE_UI_KIT_MODULES } from "./ui-kit";

export const VERIFORGE_DESIGN_SYSTEM = {
  name: "VeriForge Safety Platform",
  version: "3.0.0",
  positioning: "Professional safety compliance platform",
  kit: "industrial-safety-platform",
  principles: [
    "Industrial, structured, and audit-ready",
    "Slate/graphite primary surfaces — never black-heavy danger motifs",
    "Safety blue/teal for emphasis and verification cues",
    "Amber and green for status; red only for critical alerts",
    "Matte controls with thin borders and accessible focus rings",
    "ISO-inspired line iconography — no consumer illustration styles",
    "Logo = geometric verification / inspection-tag motif",
    "Imagery = clean line icons and minimalist diagrams only",
  ],
  components: [
    "buttons",
    "inputs",
    "dropdowns",
    "tables",
    "cards",
    "panels",
    "navigation",
    "alerts",
    "modals",
    "iconography",
    "logo",
    "progress",
  ],
} as const;

export type VeriForgeDesignSystem = typeof VERIFORGE_DESIGN_SYSTEM;
