/**
 * Canonical VERA (platform) vs VERI (product) identifier mappings.
 * @see docs/NAMING-CONVENTION.md
 */

/** SaaS entitlement module codes (lowercase; DB + API). */
export type SaasModuleCode = "vericore" | "veripm" | "verihub";

/** Navigation global module IDs (camelCase; React / vera-nav-config). */
export type VeraNavModuleId =
  | "veraHub"
  | "veraCore"
  | "veraPm"
  | "veriHubOrg"
  | "veriAgent"
  | "veriForge";

/** Nav module ID → SaaS module code (undefined = not a billable module). */
export const VERA_NAV_TO_SAAS_MODULE: Partial<
  Record<VeraNavModuleId, SaasModuleCode>
> = {
  veraHub: "verihub",
  veriHubOrg: "verihub",
  veraCore: "vericore",
  veraPm: "veripm",
};

/** SaaS module code → primary workspace home route. */
export const SAAS_MODULE_HOME_PATH: Record<SaasModuleCode, string> = {
  vericore: "/core/dashboard",
  veripm: "/pm/dashboard",
  verihub: "/hub",
};

/** Org admin console (same SaaS code `verihub`, different route). */
export const VERIHUB_ORG_CONSOLE_PATH = "/verihub";

/** Browser proxy prefix: Vite :5175 → Next workspace. */
export const VERA_WORKSPACE_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "/vera";
