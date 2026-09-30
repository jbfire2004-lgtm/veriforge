import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardList,
  CreditCard,
  HardHat,
  Home,
  LayoutDashboard,
  LayoutGrid,
  Map,
  MessageCircleQuestion,
  QrCode,
  ScanSearch,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  canAccessAdminShell,
  canAccessCoreTools,
  canAccessPmWorkspace,
  canAccessSupervisorShell,
  Phase1Role,
} from "@/lib/phase1-roles";
import { canAccessVeraIntelligenceStack } from "@/lib/navigation/vera-intelligence-access";

export type AccountMenuEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Section heading shown above this item (and following until next section). */
  section?: string;
  description?: string;
};

/**
 * Role-aware links for the topbar account menu — single source of truth for
 * cross-surface navigation (Home, Hub, Core, PM, Supervisor, Admin).
 */
export function buildAccountMenuLinks(role: string | null): AccountMenuEntry[] {
  const entries: AccountMenuEntry[] = [
    {
      section: "VERA",
      href: "/welcome",
      label: "My workspace",
      icon: LayoutDashboard,
      description: "Your subscribed surfaces — Hub, Core & PM",
    },
    {
      href: "/hub",
      label: "Vera Hub",
      icon: LayoutGrid,
      description: "Your company dashboard, feed & awards",
    },
    {
      href: "/hub/settings",
      label: "Hub settings",
      icon: Settings,
      description: "Weather alerts and personal preferences",
    },
    {
      href: "/subscriptions",
      label: "Pricing & plans",
      icon: CreditCard,
      description: "Compare Hub, Core, and PM tiers",
    },
    {
      href: "/home",
      label: "Industry home",
      icon: Home,
      description: "Public weather, jobs & safety news",
    },
  ];

  if (role === Phase1Role.SUPER_ADMIN || role === Phase1Role.ADMIN) {
    entries.push({
      section: "Platform admin",
      href: "/admin/subscriptions",
      label: "User tracking map",
      icon: Map,
      description: "Subscription map — companies, tiers, and seats",
    });
  }

  if (canAccessSupervisorShell(role)) {
    entries.push(
      {
        section: "Supervisor",
        href: "/supervisor",
        label: "Supervisor workspace",
        icon: HardHat,
        description: "Field tools, scans & sign-offs",
      },
      {
        href: "/supervisor/worker-lookup",
        label: "Worker lookup",
        icon: Users,
      },
      {
        href: "/supervisor/training/review",
        label: "Training review",
        icon: ShieldCheck,
      },
      {
        href: "/supervisor/scan",
        label: "QR scan",
        icon: QrCode,
      },
      {
        href: "/supervisor/incidents/new",
        label: "Report incident",
        icon: ScanSearch,
      },
    );
  }

  if (canAccessPmWorkspace(role)) {
    entries.push({
      section: "Project management",
      href: "/pm",
      label: "Vera PM",
      icon: ClipboardList,
      description: "Safety forms, JHA/FLHA & site execution",
    });
  }

  if (canAccessCoreTools(role)) {
    entries.push({
      section: "Core",
      href: "/core/training-ingest",
      label: "Vera Core",
      icon: ShieldCheck,
      description: "Training ingest, verification & records",
    });
  }

  if (canAccessAdminShell(role)) {
    entries.push({
      section: "Administration",
      href: "/admin",
      label: "Admin console",
      icon: ShieldCheck,
    });
  }

  if (canAccessVeraIntelligenceStack(role)) {
    entries.push({
      section: "Future ecosystem",
      href: "/dashboard/vera-intelligence",
      label: "Vera intelligence stack",
      icon: Sparkles,
      description:
        "AI command layers, civilization, interstellar & interplanetary engines (preview)",
    });
  }

  if (role === Phase1Role.PROJECT_MANAGER) {
    entries.push({
      href: "/dashboard",
      label: "Operations dashboard",
      icon: LayoutDashboard,
    });
  }

  entries.push(
    {
      section: "Community",
      href: "/jobs",
      label: "Job board",
      icon: Briefcase,
    },
    {
      href: "/experts",
      label: "Ask an expert",
      icon: MessageCircleQuestion,
    },
    {
      href: "/safety",
      label: "Safety blog",
      icon: ShieldCheck,
    },
    {
      href: "/safety-recalls",
      label: "Safety recalls",
      icon: ShieldCheck,
    },
    {
      href: "/safety-bulletins",
      label: "Bulletins & legislation",
      icon: ShieldCheck,
    },
  );

  return entries;
}
