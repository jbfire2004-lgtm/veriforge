"use client";

import { CheckCircle2, Cloud, Loader2, AlertTriangle } from "lucide-react";
import { useFieldMode } from "./FieldModeProvider";
import { cn } from "@/src/lib/utils";

export function SyncStatusBar({ className }: { className?: string }) {
  const { isOnline, pendingCount, failedCount, syncStatus, lastSyncAt } = useFieldMode();

  const tone =
    syncStatus === "ERROR"
      ? "danger"
      : syncStatus === "SYNCING"
        ? "warning"
        : pendingCount > 0
          ? "warning"
          : "success";
  const Icon =
    syncStatus === "SYNCING"
      ? Loader2
      : syncStatus === "ERROR"
        ? AlertTriangle
        : pendingCount > 0
          ? Cloud
          : CheckCircle2;

  const label =
    syncStatus === "SYNCING"
      ? "Syncing…"
      : syncStatus === "ERROR"
        ? `${failedCount} failed`
        : pendingCount > 0
          ? `${pendingCount} pending`
          : isOnline
            ? "Synced"
            : "Offline";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1 text-xs font-medium",
        tone === "success" && "bg-[var(--badge-success-bg)] text-[var(--badge-success-fg)]",
        tone === "warning" && "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-fg)]",
        tone === "danger" && "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-fg)]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className={cn("h-3.5 w-3.5", syncStatus === "SYNCING" && "animate-spin")} aria-hidden />
      <span>{label}</span>
      {lastSyncAt && syncStatus === "IDLE" && pendingCount === 0 ? (
        <span className="opacity-70">
          · {new Date(lastSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : null}
    </div>
  );
}
