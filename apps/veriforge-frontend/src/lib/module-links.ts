import type { ModuleCode } from "../types/api";

/** Same-origin path prefix; Vite on :5175 proxies /vera → Next, /nest → Nest, /api → SaaS. */
export const VERA_PROXY_PREFIX = "/vera";

/** Base URL for workspace module links. Unset VITE_VERA_APP_URL = /vera on this host (SPA :5175 in dev). */
export function veraAppBaseUrl(): string {
  const configured = import.meta.env.VITE_VERA_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return VERA_PROXY_PREFIX;
}

export function veraAppUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${veraAppBaseUrl()}${normalized}`;
}

/** Human-readable target for UI hints (e.g. http://localhost:5175/vera). */
export function veraAppTargetLabel(): string {
  const base = veraAppBaseUrl();
  if (base.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${base}`;
    }
    return `http://localhost:5175${base}`;
  }
  return base;
}

export function veraLinksUseSameOrigin(): boolean {
  return veraAppBaseUrl().startsWith("/");
}

export type ModuleFeatureLink = {
  title: string;
  description: string;
  path: string;
};

export type PublicHubFeature = ModuleFeatureLink & {
  tier: "free" | "subscriber";
};

export type ModuleLaunchConfig = {
  homePath: string;
  homeLabel: string;
  features: ModuleFeatureLink[];
};

/** VeriHub surfaces available without a VeriForge subscription (Vera public routes). */
export const PUBLIC_VERIHUB_FEATURES: PublicHubFeature[] = [
  {
    tier: "free",
    title: "Hub home",
    description: "Public feed preview, quick actions, weather, and industry panels.",
    path: "/hub",
  },
  {
    tier: "free",
    title: "Industry safety (VISI)",
    description: "Explore public industry safety benchmarks and cohort comparisons.",
    path: "/hub/industry-safety",
  },
  {
    tier: "free",
    title: "Industry intelligence",
    description: "Mining, construction, and manufacturing peer intelligence previews.",
    path: "/hub/industry-intelligence",
  },
  {
    tier: "free",
    title: "Job board",
    description: "Browse trades and workforce opportunities.",
    path: "/jobs",
  },
  {
    tier: "free",
    title: "Safety recalls",
    description: "Industry-wide equipment and product recall notices.",
    path: "/safety-recalls",
  },
  {
    tier: "free",
    title: "Safety bulletins",
    description: "Standards updates, legislation, and public safety bulletins.",
    path: "/safety-bulletins",
  },
  {
    tier: "free",
    title: "Expert Q&A",
    description: "Ask safety experts and browse community answers.",
    path: "/experts",
  },
  {
    tier: "subscriber",
    title: "VeriForge dashboards",
    description: "Cross-module analytics for VERICore and VERIPM.",
    path: "/hub/veriforge-dashboards",
  },
  {
    tier: "subscriber",
    title: "Company readiness",
    description: "Org-wide readiness signals tied to your workspace.",
    path: "/hub/readiness",
  },
  {
    tier: "subscriber",
    title: "Activity feed",
    description: "Recent workspace activity and team notifications.",
    path: "/hub/activity",
  },
  {
    tier: "subscriber",
    title: "Hub network",
    description: "Company profiles, people, and provider connections.",
    path: "/hub/network",
  },
  {
    tier: "subscriber",
    title: "Hub settings",
    description: "Configure modules, integrations, and org preferences.",
    path: "/hub/settings",
  },
];

export const PUBLIC_VERIHUB_FREE = PUBLIC_VERIHUB_FEATURES.filter((f) => f.tier === "free");
export const PUBLIC_VERIHUB_SUBSCRIBER = PUBLIC_VERIHUB_FEATURES.filter(
  (f) => f.tier === "subscriber",
);

/** Maps VeriForge module codes to Vera workspace routes.
 * @see docs/NAMING-CONVENTION.md — `verihub` → `/hub` (worker hub); org admin is `/verihub`. */
export const MODULE_LAUNCH: Record<ModuleCode, ModuleLaunchConfig> = {
  vericore: {
    homePath: "/core/dashboard",
    homeLabel: "Open VeriCore Dashboard",
    features: [
      {
        title: "Training & competency",
        description: "Completion, gaps, expiry, and workforce risk.",
        path: "/core/training-competency",
      },
      {
        title: "Contractor scores",
        description: "Program assessments and contractor safety profiles.",
        path: "/core/contractor-scores",
      },
      {
        title: "Worker profiles",
        description: "Credentials, roles, and workforce records.",
        path: "/core/workers",
      },
      {
        title: "Readiness engine",
        description: "Site and worker readiness checks.",
        path: "/core/readiness",
      },
    ],
  },
  veripm: {
    homePath: "/pm/dashboard",
    homeLabel: "Open VeriPM Dashboard",
    features: [
      {
        title: "SMS Core",
        description: "Safety management system indicators and controls.",
        path: "/pm/sms",
      },
      {
        title: "Safety Hub",
        description: "Unified safety program home across projects.",
        path: "/pm/safety-hub",
      },
      {
        title: "Projects",
        description: "Sites, packages, and project safety ownership.",
        path: "/pm/projects",
      },
      {
        title: "Equipment safety",
        description: "Asset inspections and field equipment profiles.",
        path: "/pm/equipment-safety",
      },
    ],
  },
  verihub: {
    homePath: "/hub",
    homeLabel: "Open Worker Hub",
    features: [
      {
        title: "VeriForge dashboards",
        description: "Cross-module analytics for VERICore and VERIPM.",
        path: "/hub/veriforge-dashboards",
      },
      {
        title: "Readiness",
        description: "Company readiness overview and signals.",
        path: "/hub/readiness",
      },
      {
        title: "Industry safety (VISI)",
        description: "Benchmark safety metrics against industry cohorts.",
        path: "/hub/industry-safety",
      },
      {
        title: "Activity",
        description: "Recent workspace activity and notifications.",
        path: "/hub/activity",
      },
    ],
  },
};
