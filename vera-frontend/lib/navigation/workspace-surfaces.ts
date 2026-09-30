import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  HardHat,
  LayoutDashboard,
  LayoutGrid,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  canAccessAdminShell,
  canAccessCoreTools,
  canAccessPmWorkspace,
  canAccessSupervisorShell,
  isWorker,
  Phase1Role,
} from "@/lib/phase1-roles";

export type WorkspaceSurface = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  /** Tailwind gradient for icon tile */
  iconGradient: string;
  /** Card surface gradient */
  surface: string;
  ring: string;
};

const HUB: WorkspaceSurface = {
  id: "hub",
  name: "Vera Hub",
  tagline: "Your company pulse",
  description:
    "Feed, safety champions, announcements, and employer-specific updates — the home base for your roster.",
  href: "/hub",
  cta: "Open Vera Hub",
  icon: LayoutGrid,
  iconGradient: "from-[#2F8F8C] to-[#2dd4bf]",
  surface: "from-[#E4F3F2]/90 via-[#E4F3F2] to-white",
  ring: "ring-[#2F8F8C]/25",
};

const CORE: WorkspaceSurface = {
  id: "core",
  name: "Vera Core",
  tagline: "Records & verification",
  description:
    "Training ingest, credential verification, workers, equipment, and compliance records for your organization.",
  href: "/core",
  cta: "Open Vera Core",
  icon: ShieldCheck,
  iconGradient: "from-[#1e4a7a] to-[#2A2E33]",
  surface: "from-[#dbeafe]/80 via-[#f0f6fc] to-white",
  ring: "ring-[#1e4a7a]/20",
};

const PM: WorkspaceSurface = {
  id: "pm",
  name: "Vera PM",
  tagline: "Project safety",
  description:
    "Safety forms, JHA/FLHA, inspections, hazard intelligence, and corrective actions on active projects.",
  href: "/pm",
  cta: "Open Vera PM",
  icon: ClipboardList,
  iconGradient: "from-[#d97706] to-[#C89F3D]",
  surface: "from-[#fef3c7]/90 via-[#fffbeb] to-white",
  ring: "ring-amber-400/30",
};

export function roleDisplayLabel(role: string | null): string {
  switch (role) {
    case Phase1Role.SUPER_ADMIN:
    case Phase1Role.ADMIN:
      return "Platform administrator";
    case Phase1Role.COMPANY_ADMIN:
      return "Company administrator";
    case Phase1Role.PROJECT_MANAGER:
      return "Project manager";
    case Phase1Role.SUPERVISOR:
      return "Supervisor";
    case Phase1Role.UNION_HALL_ADMIN:
      return "Union hall administrator";
    case Phase1Role.WORKER:
      return "Field worker";
    case Phase1Role.TRAINING_PROVIDER_ADMIN:
      return "Training provider admin";
    case Phase1Role.TRAINING_INSTRUCTOR:
      return "Training instructor";
    default:
      return "Signed in";
  }
}

/** Products the user is subscribed to — Hub for all signed-in users, plus role-gated surfaces. */
export function buildSubscribedSurfaces(role: string | null): WorkspaceSurface[] {
  const surfaces: WorkspaceSurface[] = [HUB];
  if (canAccessCoreTools(role)) surfaces.push(CORE);
  if (canAccessPmWorkspace(role)) surfaces.push(PM);
  return surfaces;
}

export type QuickTool = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function buildQuickTools(role: string | null): QuickTool[] {
  const tools: QuickTool[] = [];

  if (isWorker(role)) {
    tools.push({
      label: "VeriWallet",
      description: "Credits, identity, and staff credentials",
      href: "/wallet",
      icon: Wallet,
    });
  }

  if (canAccessSupervisorShell(role)) {
    tools.push({
      label: "Supervisor workspace",
      description: "Scans, sign-offs, and field tools",
      href: role === Phase1Role.SUPERVISOR ? "/supervisor" : "/supervisor",
      icon: HardHat,
    });
  }

  if (canAccessAdminShell(role)) {
    tools.push({
      label: "Admin console",
      description: "Companies, workers, and platform settings",
      href: "/admin",
      icon: LayoutDashboard,
    });
  }

  if (role === Phase1Role.PROJECT_MANAGER) {
    tools.push({
      label: "Operations dashboard",
      description: "Compliance widgets and quick actions",
      href: "/dashboard",
      icon: LayoutDashboard,
    });
  }

  return tools;
}
