/**
 * VeriForge UI Kit — industrial safety platform design system (v3).
 *
 * Cohesive component surface for VeriForge · Hub · VeriCore · VeriPM.
 *
 * Palette
 * - Primary: slate #2A2E33 · graphite #3B3F45
 * - Secondary: safety blue #1E6FB8 · inspection teal #2F8F8C
 * - Status: muted amber #C89F3D · soft green #4FAF6F
 * - Critical alerts only: #B33A3A (never CTAs / brand fills)
 *
 * Constraints: matte · thin borders · 3px radius · no gloss · no danger-button red
 */

export const VERIFORGE_UI_KIT = {
  name: "VeriForge Industrial Safety UI Kit",
  version: "3.0.0",
  theme: "industrial-safety-platform",
  surfaces: [
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
  ],
  rules: [
    "Slate/graphite primary surfaces — never black-heavy danger motifs",
    "Safety blue/teal for emphasis, focus, and verification cues",
    "Amber/green for status; controlled red only for critical alerts",
    "Matte finish, 1px darker borders, 2–4px radius, accessible focus rings",
    "ISO line iconography — no consumer illustration styles",
    "Selected table rows: soft blue rail; critical rows: controlled red rail only",
  ],
} as const;

export type VeriForgeUiKit = typeof VERIFORGE_UI_KIT;

/** Kit entry map — import components from these modules */
export const VERIFORGE_UI_KIT_MODULES = {
  buttons: "./button",
  inputs: "./inputs",
  dropdowns: "./inputs",
  tables: "./table",
  cards: "./cards",
  panels: "./panels",
  navigation: "./navigation",
  alerts: "./alerts",
  modals: "./modal",
  iconography: "./icons",
  logo: "./logo",
  tokens: "@/src/theme/veriforge-tokens",
  surfaces: "./surfaces",
  showcase: "./showcase",
} as const;
