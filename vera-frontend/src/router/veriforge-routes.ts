/**
 * VeriForge forged-metal route registry
 * Metadata + critical flags for the entire VeriForge surface.
 */

import type { VeriForgeIconCategory } from "@/src/icons/veriforge-icons";

export type VeriForgeRouteSection =
  | "brand"
  | "operations"
  | "intelligence"
  | "enterprise"
  | "system"
  | "external";

/** Logical permission keys — mapped to UI permission strings by the shell */
export type VeriForgeRoutePermissionKey =
  | "TRAINING_VIEW"
  | "USER_READ"
  | "VERIFICATION_VIEW"
  | "COMPLIANCE_VIEW"
  | "AUDIT_VIEW"
  | "NOTIFICATIONS_MANAGE"
  | "SETTINGS_UPDATE";

export type VeriForgeRouteMeta = {
  path: string;
  title: string;
  section: VeriForgeRouteSection;
  icon: VeriForgeIconCategory;
  /** Activates redGlowPulse on route chrome / transitions */
  critical: boolean;
  permission?: VeriForgeRoutePermissionKey;
  description?: string;
};

export const VERIFORGE_ROUTES: VeriForgeRouteMeta[] = [
  // Brand
  {
    path: "/veriforge/homepage",
    title: "Homepage",
    section: "brand",
    icon: "verification",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/brand",
    title: "Brand",
    section: "brand",
    icon: "culture",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/brand-expansion",
    title: "Brand Expand",
    section: "brand",
    icon: "culture",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/motion",
    title: "Motion",
    section: "brand",
    icon: "verification",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/animations",
    title: "Animations",
    section: "brand",
    icon: "verification",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/sounds",
    title: "Sounds",
    section: "brand",
    icon: "emergency",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/iconography",
    title: "Icons",
    section: "brand",
    icon: "audit",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/onboarding",
    title: "Onboarding",
    section: "brand",
    icon: "training",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/pricing",
    title: "Pricing",
    section: "brand",
    icon: "compliance",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/marketing",
    title: "Marketing",
    section: "brand",
    icon: "culture",
    critical: false,
    permission: "TRAINING_VIEW",
  },

  // Operations
  {
    path: "/veriforge/dashboard",
    title: "Dashboard",
    section: "operations",
    icon: "verification",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/users",
    title: "Users",
    section: "operations",
    icon: "contractor",
    critical: false,
    permission: "USER_READ",
  },
  {
    path: "/veriforge/training",
    title: "Training",
    section: "operations",
    icon: "training",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/verification",
    title: "Verification",
    section: "operations",
    icon: "verification",
    critical: false,
    permission: "VERIFICATION_VIEW",
  },
  {
    path: "/veriforge/compliance",
    title: "Compliance",
    section: "operations",
    icon: "compliance",
    critical: true,
    permission: "COMPLIANCE_VIEW",
    description: "Critical compliance surface",
  },
  {
    path: "/veriforge/incidents",
    title: "Incidents",
    section: "operations",
    icon: "incidents",
    critical: true,
    permission: "COMPLIANCE_VIEW",
    description: "Critical incident chain",
  },
  {
    path: "/veriforge/risk",
    title: "Risk",
    section: "operations",
    icon: "risk",
    critical: true,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/badges",
    title: "Badges",
    section: "operations",
    icon: "contractor",
    critical: false,
    permission: "VERIFICATION_VIEW",
  },
  {
    path: "/veriforge/culture",
    title: "Culture",
    section: "operations",
    icon: "culture",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/emergency",
    title: "Emergency",
    section: "operations",
    icon: "emergency",
    critical: true,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/inspections",
    title: "Inspections",
    section: "operations",
    icon: "equipment",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/site-safety",
    title: "Site Safety",
    section: "operations",
    icon: "fieldOps",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/audit",
    title: "Audit",
    section: "operations",
    icon: "audit",
    critical: false,
    permission: "AUDIT_VIEW",
  },
  {
    path: "/veriforge/workflows",
    title: "Workflows",
    section: "operations",
    icon: "verification",
    critical: false,
    permission: "VERIFICATION_VIEW",
  },
  {
    path: "/veriforge/contractors",
    title: "Contractors",
    section: "operations",
    icon: "contractor",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/contractor-onboarding",
    title: "Ctr Onboarding",
    section: "operations",
    icon: "contractor",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/field-operations",
    title: "Field Ops",
    section: "operations",
    icon: "fieldOps",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },

  // Intelligence
  {
    path: "/veriforge/safety-kpis",
    title: "Safety KPIs",
    section: "intelligence",
    icon: "risk",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/reports",
    title: "Reports",
    section: "intelligence",
    icon: "audit",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/digital-twin",
    title: "Digital Twin",
    section: "intelligence",
    icon: "fieldOps",
    critical: false,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/command-center",
    title: "Command",
    section: "intelligence",
    icon: "emergency",
    critical: true,
    permission: "COMPLIANCE_VIEW",
  },
  {
    path: "/veriforge/ledger",
    title: "Ledger",
    section: "intelligence",
    icon: "audit",
    critical: false,
    permission: "AUDIT_VIEW",
  },
  {
    path: "/veriforge/predictive",
    title: "Predictive AI",
    section: "intelligence",
    icon: "risk",
    critical: true,
    permission: "COMPLIANCE_VIEW",
  },

  // Enterprise
  {
    path: "/veriforge/deployment",
    title: "Deployment",
    section: "enterprise",
    icon: "equipment",
    critical: false,
    permission: "SETTINGS_UPDATE",
  },
  {
    path: "/veriforge/enterprise-architecture",
    title: "Architecture",
    section: "enterprise",
    icon: "audit",
    critical: false,
    permission: "SETTINGS_UPDATE",
  },

  // System
  {
    path: "/veriforge/assistant",
    title: "AI Assistant",
    section: "system",
    icon: "verification",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/notifications",
    title: "Notifications",
    section: "system",
    icon: "emergency",
    critical: false,
    permission: "NOTIFICATIONS_MANAGE",
  },
  {
    path: "/veriforge/settings",
    title: "Settings",
    section: "system",
    icon: "equipment",
    critical: false,
    permission: "SETTINGS_UPDATE",
  },
  {
    path: "/veriforge/mobile/splash",
    title: "Mobile",
    section: "system",
    icon: "fieldOps",
    critical: false,
  },
  {
    path: "/veriforge/tenant",
    title: "Tenants",
    section: "system",
    icon: "contractor",
    critical: false,
    permission: "USER_READ",
  },
  {
    path: "/veriforge/auth/login",
    title: "Auth",
    section: "system",
    icon: "verification",
    critical: false,
  },

  // External
  {
    path: "/sales-playbook/positioning",
    title: "Sales Playbook",
    section: "external",
    icon: "culture",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/support/overview",
    title: "Support Center",
    section: "external",
    icon: "compliance",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/partners/overview",
    title: "Partners",
    section: "external",
    icon: "contractor",
    critical: false,
    permission: "TRAINING_VIEW",
  },
  {
    path: "/veriforge/docs",
    title: "Docs",
    section: "system",
    icon: "audit",
    critical: false,
    permission: "SETTINGS_UPDATE",
  },
];

const FALLBACK_ROUTE: VeriForgeRouteMeta = {
  path: "/veriforge",
  title: "VeriForge",
  section: "system",
  icon: "verification",
  critical: false,
  description: "Forged-metal control surface",
};

/** Longest-prefix match for nested paths */
export function resolveVeriForgeRoute(
  pathname: string | null | undefined,
): VeriForgeRouteMeta {
  if (!pathname) return FALLBACK_ROUTE;
  const exact = VERIFORGE_ROUTES.find((r) => r.path === pathname);
  if (exact) return exact;

  const ranked = VERIFORGE_ROUTES.filter(
    (r) => pathname === r.path || pathname.startsWith(`${r.path}/`),
  ).sort((a, b) => b.path.length - a.path.length);

  return ranked[0] ?? FALLBACK_ROUTE;
}

export function isVeriForgeCriticalRoute(
  pathname: string | null | undefined,
): boolean {
  return resolveVeriForgeRoute(pathname).critical;
}

export function getVeriForgeRoutesBySection(
  section: VeriForgeRouteSection,
): VeriForgeRouteMeta[] {
  return VERIFORGE_ROUTES.filter((r) => r.section === section);
}

export function toVFNavItems(
  routes: VeriForgeRouteMeta[] = VERIFORGE_ROUTES,
): Array<{
  label: string;
  href: string;
  permission?: string;
  critical?: boolean;
  icon?: VeriForgeIconCategory;
  section?: VeriForgeRouteSection;
}> {
  return routes.map((r) => ({
    label: r.title,
    href: r.path,
    permission: r.permission,
    critical: r.critical,
    icon: r.icon,
    section: r.section,
  }));
}

export const VERIFORGE_ROUTE_SECTIONS: VeriForgeRouteSection[] = [
  "brand",
  "operations",
  "intelligence",
  "enterprise",
  "system",
  "external",
];
