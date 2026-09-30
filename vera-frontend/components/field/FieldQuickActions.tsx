"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CloudOff,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import { useFieldMode } from "./FieldModeProvider";
import { cn } from "@/src/lib/utils";
import { binderQuery } from "@/lib/field/binder-sections";
import { FIELD_OS_MODULES } from "@/lib/field/modules";

type Props = {
  role: string | null;
  companyId?: number;
  projectId?: number;
  className?: string;
};

const ICONS = {
  equipment_readiness: Wrench,
  crew_readiness: Users,
  safety_pulse: Activity,
  task_sync: RefreshCw,
  incident_capture: AlertTriangle,
  offline_mode: CloudOff,
  analytics_snapshot: BarChart3,
} as const;

/** Compact FieldOS module strip — used when a full binder layout isn't mounted. */
export function FieldQuickActions({
  companyId,
  projectId,
  className,
}: Props) {
  const { pendingCount, fieldModeActive, failedCount, isOnline } = useFieldMode();
  const qs = binderQuery(projectId, companyId);

  const packets = FIELD_OS_MODULES.map((mod) => {
    let desc = mod.eyebrow;
    if (mod.id === "task_sync") {
      desc = pendingCount
        ? `${pendingCount} pending`
        : failedCount
          ? `${failedCount} failed`
          : "Queue";
    } else if (mod.id === "offline_mode") {
      desc = isOnline ? "Online" : "Offline";
    }
    return {
      href: `${mod.href}${qs}`,
      label: mod.label,
      icon: ICONS[mod.id],
      desc,
    };
  });

  return (
    <section
      className={cn("grid gap-3 sm:grid-cols-2", className)}
      aria-label="FieldOS modules"
    >
      {packets.map((action) => (
        <Link
          key={`${action.href}-${action.label}`}
          href={action.href}
          className="flex min-h-[72px] items-center gap-3 rounded-xl border-2 border-teal-800/20 bg-teal-50/50 p-4 dark:bg-teal-950/30"
        >
          <action.icon className="h-8 w-8 shrink-0 text-teal-800" aria-hidden />
          <span>
            <span className="block text-base font-semibold">{action.label}</span>
            <span className="text-xs text-muted-foreground">{action.desc}</span>
          </span>
        </Link>
      ))}
      {fieldModeActive && pendingCount > 0 && (
        <p className="col-span-full text-center text-sm font-medium text-amber-800">
          {pendingCount} action(s) waiting to sync — open Task Sync
        </p>
      )}
    </section>
  );
}
