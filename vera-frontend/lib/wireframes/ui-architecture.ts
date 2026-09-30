/**
 * VERA Core UI architecture — consolidates design system + wireframe contracts.
 * Use for docs, Storybook, and runtime introspection.
 */

export {
  colors,
  spacing,
  radius,
  shadows,
  typography,
  palette,
  buttonTokens,
  cardTokens,
  tableTokens,
  badgeTokens,
} from "@/lib/design-system";
export { breakpoints, breakpoints as screens, media } from "@/lib/design-system/breakpoints";
export { a11y, minTouchTarget, a11yRules } from "@/lib/design-system/accessibility";
export { interactionRules } from "@/lib/design-system/interaction";
export { responsiveRules } from "@/lib/design-system/responsive";
export type { ThemeMode, ResolvedTheme } from "@/lib/design-system/theme-types";
export { MODULE_WIREFRAMES, getModuleWireframe } from "./module-registry";
export { WORKFLOW_WIREFRAMES } from "./workflows";

export const uiConsistencyRules = {
  primaryAction: "top-right",
  iconSet: "lucide-react (Heroicons-compatible stroke)",
  cornerRadius: "8px (rounded-lg)",
  cardShadow: "subtle soft shadow",
  spacingGrid: "4px base — 8, 12, 16, 24, 32",
  visualHierarchy: [
    "Page title (h1 via PageHeader)",
    "Section title (h2/h3)",
    "Body copy",
    "Labels and metadata",
  ],
} as const;
