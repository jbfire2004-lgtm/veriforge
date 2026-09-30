"use client";

import { useEffect } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  useOptionalVeraCoreUI,
  type SyncVisualStatus,
} from "@/lib/vera-core-ui/store";

type Props = {
  status?: SyncVisualStatus;
  lastSyncedAt?: string | null;
  className?: string;
  onSync?: () => void;
};

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function SyncPulse({ status, lastSyncedAt, className, onSync }: Props) {
  const store = useOptionalVeraCoreUI();
  const resolvedStatus = status ?? store?.syncStatus ?? "idle";
  const syncedAt = lastSyncedAt ?? store?.lastSyncedAt ?? null;

  useEffect(() => {
    // Avoid background retry loops while already syncing or in hard-error state.
    // Error retry should be user-initiated via click.
    if (resolvedStatus === "syncing" || resolvedStatus === "error") return;
    const id = setInterval(() => {
      if (typeof navigator !== "undefined" && navigator.onLine && onSync) {
        onSync();
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [resolvedStatus, onSync]);

  const Icon =
    resolvedStatus === "offline" || resolvedStatus === "error"
      ? CloudOff
      : resolvedStatus === "syncing"
        ? RefreshCw
        : Cloud;

  const label =
    resolvedStatus === "syncing"
      ? "Syncing…"
      : resolvedStatus === "offline"
        ? "Offline"
        : resolvedStatus === "error"
          ? "Sync error"
          : syncedAt
            ? `Synced ${formatTime(syncedAt)}`
            : "Live";

  return (
    <button
      type="button"
      onClick={onSync}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5",
        "text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]",
        className,
      )}
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {resolvedStatus === "syncing" ? (
          <span className="absolute inset-0 rounded-full bg-[var(--color-info)] vera-sync-ring" />
        ) : null}
        <span
          className={cn(
            "relative h-2 w-2 rounded-full",
            resolvedStatus === "offline" || resolvedStatus === "error"
              ? "bg-[var(--color-warning)]"
              : resolvedStatus === "syncing"
                ? "bg-[var(--color-info)] vera-sync-pulse"
                : "bg-[var(--compliance-ok)]",
          )}
        />
      </span>
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          resolvedStatus === "syncing" ? "animate-spin text-[var(--color-info)]" : "",
        )}
        aria-hidden
      />
      {label}
    </button>
  );
}
