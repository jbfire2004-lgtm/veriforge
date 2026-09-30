import type { LucideIcon } from "lucide-react";
import {
  Building2,
  GraduationCap,
  HardHat,
  Plus,
  QrCode,
  Upload,
  Users,
} from "lucide-react";
import { canSeeDashboardWidget, canSeeQuickAction } from "./role-access";
import { resolveNavHref } from "./sidebar-config";
import type { DashboardWidgetId, QuickActionId } from "./types";

export type QuickActionConfig = {
  id: QuickActionId;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function buildQuickActions(role: string | null): QuickActionConfig[] {
  const candidates: Array<{
    id: QuickActionId;
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
  }> = [
    {
      id: "addWorker",
      label: "Add worker",
      description: "Create a worker profile",
      href: "/admin/workers/new",
      icon: Users,
    },
    {
      id: "addEquipment",
      label: "Add equipment",
      description: "Register a new asset",
      href: "/admin/equipment/new",
      icon: HardHat,
    },
    {
      id: "uploadTraining",
      label: "Upload training",
      description: "Upload certificates or add a record",
      href: "/admin/training/dashboard?tab=upload",
      icon: Upload,
    },
    {
      id: "assignProject",
      label: "Assign to project",
      description: "Roster workers or equipment",
      href: resolveNavHref("projects", role),
      icon: Building2,
    },
    {
      id: "scanQr",
      label: "Scan QR",
      description: "Field verification",
      href: "/supervisor/scan",
      icon: QrCode,
    },
  ];

  return candidates.filter((c) => canSeeQuickAction(role, c.id));
}

export type DashboardWidgetConfig = {
  id: DashboardWidgetId;
  title: string;
  description: string;
  href?: string;
};

export function buildDashboardWidgets(role: string | null): DashboardWidgetConfig[] {
  const all: DashboardWidgetConfig[] = [
    {
      id: "workerCompliance",
      title: "Worker compliance",
      description: "Verified, pending, and flagged workers",
      href: resolveNavHref("workers", role),
    },
    {
      id: "equipmentCompliance",
      title: "Equipment compliance",
      description: "Inspections, maintenance, and lockouts",
      href: resolveNavHref("equipment", role),
    },
    {
      id: "projectReadiness",
      title: "Project readiness",
      description: "Sites, assignments, and gaps",
      href: resolveNavHref("projects", role),
    },
    {
      id: "trainingExpiry",
      title: "Training expiry",
      description: "Expiring and expired credentials",
      href: resolveNavHref("training", role),
    },
    {
      id: "unionDispatch",
      title: "Union dispatch",
      description: "Active dispatches and recalls",
      href: resolveNavHref("unionHalls", role),
    },
    {
      id: "providerApprovals",
      title: "Provider approvals",
      description: "Pending training provider sign-off",
      href: "/provider-portal/approval",
    },
    {
      id: "systemHealth",
      title: "System health",
      description: "Platform status and incident load",
    },
    {
      id: "assignments",
      title: "Today's assignments",
      description: "Active field assignments and risk flags",
      href: "/supervisor",
    },
  ];

  return all.filter((w) => canSeeDashboardWidget(role, w.id));
}

export function shouldShowMetrics(role: string | null): boolean {
  return canSeeDashboardWidget(role, "metrics");
}

export function shouldShowRecentActivity(role: string | null): boolean {
  return canSeeDashboardWidget(role, "recentActivity");
}
