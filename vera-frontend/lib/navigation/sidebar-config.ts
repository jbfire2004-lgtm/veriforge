import {
  BarChart3,
  Building2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  QrCode,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { Phase1Role } from "@/lib/phase1-roles";
import { canAccessProviderPortal } from "@/lib/training-provider-permissions";
import type { ShellNavEntry, ShellNavItem } from "./types";
import { canSeeNavModule } from "./role-access";
import type { NavGroupId, NavModuleId } from "./types";
import { NAV_GROUP_LABELS } from "./types";

export type NavSurface = "workspace" | "admin";

function isAdminRole(role: string | null): boolean {
  return (
    role === Phase1Role.SUPER_ADMIN ||
    role === Phase1Role.ADMIN ||
    role === Phase1Role.COMPANY_ADMIN
  );
}

function isSupervisorRole(role: string | null): boolean {
  return (
    role === Phase1Role.SUPERVISOR ||
    role === Phase1Role.PROJECT_MANAGER
  );
}

/** Role-aware href resolution for each nav module. */
export function resolveNavHref(
  module: NavModuleId,
  role: string | null,
  surface: NavSurface = "workspace"
): string {
  const admin = isAdminRole(role);
  const useAdminPaths = surface === "admin" || admin;

  switch (module) {
    case "dashboard":
      if (role === Phase1Role.SUPERVISOR) return "/supervisor";
      return "/dashboard";
    case "workers":
      if (useAdminPaths) return "/admin/workers";
      if (isSupervisorRole(role)) return "/supervisor/worker-lookup";
      return "/admin/workers";
    case "equipment":
      return useAdminPaths ? "/admin/equipment" : "/equipment-assignments";
    case "training":
      if (canAccessProviderPortal(role)) return "/provider-portal";
      return useAdminPaths ? "/admin/training" : "/core/training-ingest";
    case "projects":
      return useAdminPaths ? "/admin/projects" : "/pm";
    case "safetyIntelligence":
      return "/pm/safety-intelligence";
    case "companies":
      return useAdminPaths ? "/admin/companies" : "/companies";
    case "unionHalls":
      return "/union-hall";
    case "trainingProviders":
      return "/provider-portal";
    case "compliance":
      return useAdminPaths ? "/training-provider" : "/training-provider";
    case "reports":
      return "/admin/reporting";
    case "settings":
      if (isSupervisorRole(role) && !admin) return "/supervisor/settings";
      return "/admin/settings";
    case "wallet":
      return "/wallet";
    case "verification":
      return "/core/verification";
    case "scan":
      return "/supervisor/scan";
    default:
      return "/dashboard";
  }
}

type ModuleMeta = {
  id: NavModuleId;
  label: string;
  icon: ShellNavItem["icon"];
  group: NavGroupId;
};

const MODULE_REGISTRY: ModuleMeta[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "operations" },
  { id: "workers", label: "Workers", icon: Users, group: "operations" },
  { id: "equipment", label: "Equipment", icon: Wrench, group: "operations" },
  { id: "training", label: "Training", icon: GraduationCap, group: "operations" },
  { id: "projects", label: "Project management", icon: ClipboardList, group: "operations" },
  {
    id: "safetyIntelligence",
    label: "Safety Intelligence",
    icon: ShieldAlert,
    group: "operations",
  },
  { id: "companies", label: "Companies", icon: Building2, group: "organizations" },
  { id: "unionHalls", label: "Union halls", icon: Building2, group: "organizations" },
  {
    id: "trainingProviders",
    label: "Training providers",
    icon: GraduationCap,
    group: "organizations",
  },
  { id: "compliance", label: "Compliance", icon: ShieldCheck, group: "systems" },
  { id: "reports", label: "Reports", icon: BarChart3, group: "systems" },
  { id: "settings", label: "Settings", icon: Settings, group: "systems" },
  { id: "wallet", label: "Worker wallet", icon: Wallet, group: "operations" },
  { id: "verification", label: "Verification", icon: ShieldCheck, group: "systems" },
  { id: "scan", label: "QR scan", icon: QrCode, group: "operations" },
];

const GROUP_ORDER: NavGroupId[] = ["operations", "organizations", "systems"];

/**
 * VERA Core Option C sidebar — grouped Operations / Organizations / Systems.
 */
export function buildVeraSidebarNav(
  role: string | null,
  surface: NavSurface = "workspace"
): ShellNavEntry[] {
  const itemsByGroup = new Map<NavGroupId, ShellNavItem[]>();

  for (const mod of MODULE_REGISTRY) {
    if (!canSeeNavModule(role, mod.id)) continue;
    const item: ShellNavItem = {
      href: resolveNavHref(mod.id, role, surface),
      label: mod.label,
      icon: mod.icon,
    };
    const list = itemsByGroup.get(mod.group) ?? [];
    list.push(item);
    itemsByGroup.set(mod.group, list);
  }

  const entries: ShellNavEntry[] = [];
  for (const groupId of GROUP_ORDER) {
    const items = itemsByGroup.get(groupId);
    if (!items?.length) continue;
    entries.push({
      type: "section",
      label: NAV_GROUP_LABELS[groupId],
      items,
    });
  }

  return entries;
}

/** Quick links for dashboard — mirrors sidebar without section headers. */
export function buildDashboardQuickLinks(
  role: string | null,
  surface: NavSurface = "workspace"
): ShellNavItem[] {
  const links: ShellNavItem[] = [];
  for (const mod of MODULE_REGISTRY) {
    if (mod.id === "dashboard" || mod.id === "settings") continue;
    if (!canSeeNavModule(role, mod.id)) continue;
    links.push({
      href: resolveNavHref(mod.id, role, surface),
      label: mod.label,
      icon: mod.icon,
    });
  }
  return links;
}
