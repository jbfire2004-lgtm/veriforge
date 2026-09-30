import type { LucideIcon } from "lucide-react";

/** App shell sidebar item (Option C). */
export type ShellNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type ShellNavSection = {
  type: "section";
  label: string;
  items: ShellNavItem[];
};

export type ShellNavEntry = ShellNavItem | ShellNavSection;

export type VeraShellVariant = "admin" | "core" | "supervisor" | "workspace";

/** Sidebar group ordering per VERA Core Option C spec. */
export type NavGroupId = "operations" | "organizations" | "systems";

export const NAV_GROUP_LABELS: Record<NavGroupId, string> = {
  operations: "Operations",
  organizations: "Organizations",
  systems: "Systems",
};

export type NavModuleId =
  | "dashboard"
  | "workers"
  | "equipment"
  | "training"
  | "projects"
  | "safetyIntelligence"
  | "companies"
  | "unionHalls"
  | "trainingProviders"
  | "compliance"
  | "reports"
  | "settings"
  | "wallet"
  | "verification"
  | "scan";

export type NavItemConfig = {
  id: NavModuleId;
  label: string;
  icon: LucideIcon;
  /** Resolved per role in sidebar-config */
  href: string;
};

export type DashboardWidgetId =
  | "workerCompliance"
  | "equipmentCompliance"
  | "projectReadiness"
  | "trainingExpiry"
  | "unionDispatch"
  | "providerApprovals"
  | "systemHealth"
  | "assignments"
  | "quickActions"
  | "recentActivity"
  | "metrics";

export type QuickActionId =
  | "addWorker"
  | "addEquipment"
  | "uploadTraining"
  | "assignProject"
  | "scanQr";

export type ModuleTabId =
  | "overview"
  | "compliance"
  | "assignments"
  | "training"
  | "inspections"
  | "documents"
  | "history"
  | "settings";
