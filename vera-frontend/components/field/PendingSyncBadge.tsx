"use client";

import { Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function PendingSyncBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--badge-warning-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--badge-warning-fg)]",
        className
      )}
    >
      <Clock className="h-3 w-3" aria-hidden />
      Pending sync
    </span>
  );
}
