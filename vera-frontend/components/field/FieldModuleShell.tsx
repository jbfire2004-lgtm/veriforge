"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { SyncStatusBar } from "./SyncStatusBar";
import { useFieldMode } from "./FieldModeProvider";
import { Button } from "@/components/ui/button";
import { VeraPageLayout } from "@/src/components/navigation";
import { cn } from "@/src/lib/utils";
import { binderQuery } from "@/lib/field/binder-sections";
import {
  getFieldOsModule,
  type FieldOsModuleId,
} from "@/lib/field/modules";

export type FieldModuleAction = {
  label: string;
  href: string;
  primary?: boolean;
};

type Props = {
  moduleId: FieldOsModuleId;
  projectId?: number;
  companyId?: number;
  icon: ComponentType<{ className?: string }>;
  statusLabel: string;
  statusTone?: "ok" | "warn" | "neutral";
  kpis?: Array<{ label: string; value: string; hint?: string }>;
  actions: FieldModuleAction[];
  children?: ReactNode;
};

export function FieldModuleShell({
  moduleId,
  projectId,
  companyId,
  icon: Icon,
  statusLabel,
  statusTone = "neutral",
  kpis,
  actions,
  children,
}: Props) {
  const mod = getFieldOsModule(moduleId);
  const { syncNow, syncing, isOnline } = useFieldMode();
  const qs = binderQuery(projectId, companyId);

  return (
    <VeraPageLayout
      title={mod.label}
      description={mod.description}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <SyncStatusBar />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={syncing}
            onClick={() => void syncNow()}
          >
            <RefreshCw
              className={cn("mr-1 h-4 w-4", syncing && "animate-spin")}
              aria-hidden
            />
            Sync
          </Button>
          <Link href={`/field${qs}`}>
            <Button variant="ghost" size="sm">
              Binder
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 rounded-xl border-2 px-4 py-3",
            statusTone === "warn"
              ? "border-amber-500/50 bg-amber-50/40"
              : statusTone === "ok"
                ? "border-teal-800/25 bg-teal-50/30"
                : "border-[var(--border)] bg-[var(--muted)]/30",
          )}
          role="status"
        >
          <Icon className="h-6 w-6 shrink-0 text-teal-800" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mod.eyebrow} · FieldOS
            </p>
            <p className="font-semibold text-[var(--foreground)]">{statusLabel}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {isOnline ? "Online" : "Offline"}
              {mod.offlineCapable
                ? " · offline capable"
                : " · requires connectivity for full view"}
            </p>
          </div>
        </div>

        {kpis && kpis.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {k.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                  {k.value}
                </p>
                {k.hint ? (
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {k.hint}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <Link key={`${a.href}-${a.label}`} href={a.href}>
              <Button
                variant={a.primary ? "primary" : "outline"}
                size="sm"
              >
                {a.label}
              </Button>
            </Link>
          ))}
        </div>

        {children}
      </div>
    </VeraPageLayout>
  );
}
