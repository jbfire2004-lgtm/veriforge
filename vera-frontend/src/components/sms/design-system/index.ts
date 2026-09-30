/**
 * Vera SMS design system — tokens, theme, and UI primitives.
 *
 * Universal module template (preferred on all SMS / VeriPM workflow surfaces):
 *   SmsUniversalLayout
 *     → Header
 *     → Summary cards
 *     → Main content
 *     → Action buttons (header / mobile)
 *     → Footer
 *
 * `SmsModuleLayout` remains compatible (stats/sections API).
 * Use `SmsStatusBadge` / `SfBadge` for status · `SmsSectionHeader` for titled blocks.
 *
 * Cross-module contract (typography · spacing · cards · icons · badges):
 *   `app/vera-tokens.css` → `.vera-shell` / `.vera-status` / `--vera-*`
 *   SF/SMS alias platform vars; intelligence hubs use ModuleHubLayout +
 *   VsDashboardShell (`.vs-theme-auto` light/dark parity).
 *
 * Usage:
 * 1. Ensure parent has `.sf-theme` (PM layout applies globally).
 * 2. Import theme.css once in PM layout.
 * 3. Use `SmsUniversalLayout` (or `SmsModuleLayout` / `SmsPageLayout`) on pages.
 */

export * from "./tokens";
export * from "./primitives";
