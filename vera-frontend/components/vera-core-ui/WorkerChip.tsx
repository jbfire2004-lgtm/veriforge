"use client";

import { GripVertical, User } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ComplianceBadge } from "./ComplianceBadge";
import type { ComplianceState } from "@/lib/vera-core-ui/compliance";

export type WorkerChipData = {
  id: number;
  name: string;
  trade?: string | null;
  compliance?: ComplianceState;
};

type Props = {
  worker: WorkerChipData;
  draggable?: boolean;
  onDragStart?: (workerId: number) => void;
  onDragEnd?: () => void;
  className?: string;
};

export function WorkerChip({
  worker,
  draggable = true,
  onDragStart,
  onDragEnd,
  className,
}: Props) {
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/vera-worker-id", String(worker.id));
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(worker.id);
      }}
      onDragEnd={() => onDragEnd?.()}
      className={cn(
        "group flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2",
        "shadow-sm transition-all duration-200 hover:border-[var(--compliance-ok)]/30 hover:shadow-md",
        draggable ? "cursor-grab active:cursor-grabbing active:vera-drag-lift" : "",
        className,
      )}
    >
      {draggable ? (
        <GripVertical
          className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] opacity-50 group-hover:opacity-100"
          aria-hidden
        />
      ) : null}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)]">
        <User className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">{worker.name}</p>
        {worker.trade ? (
          <p className="truncate text-xs text-[var(--muted-foreground)]">{worker.trade}</p>
        ) : null}
      </div>
      {worker.compliance ? <ComplianceBadge state={worker.compliance} /> : null}
    </div>
  );
}
