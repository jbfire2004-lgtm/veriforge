"use client";

import { AlertTriangle, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { useFieldMode } from "./FieldModeProvider";
import { cn } from "@/src/lib/utils";

export function OfflineBanner() {
  const {
    fieldModeActive,
    isOnline,
    pendingCount,
    syncing,
    syncStatus,
    lastSyncError,
    syncNow,
  } = useFieldMode();

  if (!fieldModeActive && isOnline && syncStatus !== "ERROR") return null;

  const offline = fieldModeActive || !isOnline;
  const tone = syncStatus === "ERROR" ? "error" : offline ? "offline" : "sync";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2 text-sm",
        tone === "offline" &&
          "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
        tone === "error" &&
          "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
        tone === "sync" &&
          "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]",
      )}
    >
      <span className="inline-flex items-center gap-2 font-medium">
        {syncStatus === "SYNCING" ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : syncStatus === "ERROR" ? (
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <CloudOff className="h-4 w-4 shrink-0" aria-hidden />
        )}
        {syncStatus === "SYNCING"
          ? "Syncing…"
          : syncStatus === "ERROR"
            ? lastSyncError ?? "Sync failed"
            : offline
              ? "Offline mode active"
              : "Back online"}
        {offline && pendingCount > 0 ? (
          <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-xs font-semibold dark:bg-amber-800">
            {pendingCount} pending sync
          </span>
        ) : null}
        {!offline && syncStatus === "IDLE" && pendingCount > 0 ? (
          <span className="rounded-full bg-[var(--badge-warning-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--badge-warning-fg)]">
            {pendingCount} queued
          </span>
        ) : null}
      </span>
      {isOnline && (pendingCount > 0 || syncStatus === "ERROR") ? (
        <button
          type="button"
          onClick={() => void syncNow()}
          disabled={syncing}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} aria-hidden />
          Sync now
        </button>
      ) : null}
    </div>
  );
}
