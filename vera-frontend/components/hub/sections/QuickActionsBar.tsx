"use client";

import type { QuickActionDto } from "@vera/api-contract";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardList,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Settings,
  Shield,
  Truck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { HubPromoCard } from "../HubPromoCard";

type Props = { actions: QuickActionDto[] };

type ActionMeta = {
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  accentBar: string;
  iconGradient: string;
  surface: string;
  ring?: string;
};

const ACTION_META: Record<string, ActionMeta> = {
  wallet: {
    eyebrow: "Credentials",
    description: "Certs, licenses, and wallet cards.",
    icon: Wallet,
    accentBar: "from-[#1e4a7a] to-[#2F85CC]",
    iconGradient: "from-[#1e4a7a] to-[#1E6FB8]",
    surface: "from-[#dbeafe]/60 via-white to-white",
    ring: "ring-[#1e4a7a]/15",
  },
  training: {
    eyebrow: "Learning",
    description: "Courses, completions, and training records.",
    icon: GraduationCap,
    accentBar: "from-[#7c3aed] to-[#a78bfa]",
    iconGradient: "from-[#7c3aed] to-[#8b5cf6]",
    surface: "from-[#f5f3ff]/80 via-white to-white",
    ring: "ring-[#7c3aed]/15",
  },
  jobs: {
    eyebrow: "Careers",
    description: "Open roles matched to your trade.",
    icon: Briefcase,
    accentBar: "from-[#2F8F8C] to-[#3AA39F]",
    iconGradient: "from-[#2F8F8C] to-[#3AA39F]",
    surface: "from-[#E4F3F2]/80 via-white to-white",
    ring: "ring-[#2F8F8C]/20",
  },
  safety: {
    eyebrow: "Safety blog",
    description: "Articles, bulletins, and field guidance.",
    icon: Shield,
    accentBar: "from-[#B33A3A] to-[#f97316]",
    iconGradient: "from-[#B33A3A] to-[#ea580c]",
    surface: "from-[#fef2f2]/70 via-white to-white",
    ring: "ring-red-500/15",
  },
  "union-hall": {
    eyebrow: "Union hall",
    description: "Hall operations and member services.",
    icon: Users,
    accentBar: "from-[#1e4a7a] to-[#2F85CC]",
    iconGradient: "from-[#1e4a7a] to-[#1E6FB8]",
    surface: "from-[#dbeafe]/60 via-white to-white",
  },
  dispatch: {
    eyebrow: "Dispatch",
    description: "Assignments and hall dispatch board.",
    icon: Truck,
    accentBar: "from-[#2F8F8C] to-[#3AA39F]",
    iconGradient: "from-[#2F8F8C] to-[#3AA39F]",
    surface: "from-[#E4F3F2]/80 via-white to-white",
  },
  supervisor: {
    eyebrow: "Supervisor",
    description: "Field tools, scans, and sign-offs.",
    icon: ClipboardList,
    accentBar: "from-[#1e4a7a] to-[#2F85CC]",
    iconGradient: "from-[#1e4a7a] to-[#1E6FB8]",
    surface: "from-[#dbeafe]/60 via-white to-white",
  },
  core: {
    eyebrow: "Vera Core",
    description: "Training ingest, verification, and records.",
    icon: Layers,
    accentBar: "from-[#2F8F8C] to-[#3AA39F]",
    iconGradient: "from-[#2F8F8C] to-[#3AA39F]",
    surface: "from-[#E4F3F2]/80 via-white to-white",
  },
  equipment: {
    eyebrow: "Equipment",
    description: "Fleet profiles, inspections, and status.",
    icon: Wrench,
    accentBar: "from-[#64748b] to-[#94a3b8]",
    iconGradient: "from-[#475569] to-[#64748b]",
    surface: "from-[#f8fafc] via-white to-white",
  },
  admin: {
    eyebrow: "Administration",
    description: "Users, subscriptions, and system controls.",
    icon: Settings,
    accentBar: "from-[#1e4a7a] to-[#2F85CC]",
    iconGradient: "from-[#1e4a7a] to-[#1E6FB8]",
    surface: "from-[#dbeafe]/60 via-white to-white",
  },
  dashboard: {
    eyebrow: "Operations",
    description: "KPIs, adoption, and program health.",
    icon: LayoutDashboard,
    accentBar: "from-[#7c3aed] to-[#a78bfa]",
    iconGradient: "from-[#7c3aed] to-[#8b5cf6]",
    surface: "from-[#f5f3ff]/80 via-white to-white",
  },
};

const DEFAULT_META: ActionMeta = {
  eyebrow: "Quick action",
  description: "Open this Vera surface.",
  icon: Layers,
  accentBar: "from-[#2F8F8C] to-[#3AA39F]",
  iconGradient: "from-[#2F8F8C] to-[#3AA39F]",
  surface: "from-[#E4F3F2]/80 via-white to-white",
};

export function QuickActionsBar({ actions }: Props) {
  if (!actions.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => {
        const meta = ACTION_META[action.id] ?? DEFAULT_META;
        return (
          <HubPromoCard
            key={action.id}
            href={action.href}
            eyebrow={meta.eyebrow}
            title={action.label}
            description={meta.description}
            icon={meta.icon}
            accentBar={meta.accentBar}
            iconGradient={meta.iconGradient}
            surface={meta.surface}
            ring={meta.ring}
          />
        );
      })}
    </div>
  );
}
