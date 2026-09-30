"use client";

import { useCallback, useState } from "react";
import { Building2, FolderKanban, Link2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { linkWorkerToCompany } from "@/lib/api/vera-core";
import { useOptionalVeraCoreUI } from "@/lib/vera-core-ui/store";
import { WorkerChip, type WorkerChipData } from "./WorkerChip";
import { CoreSection } from "./CoreSection";
import { SyncPulse } from "./SyncPulse";

type DropTarget = {
  id: string;
  label: string;
  kind: "company" | "project";
  companyId: number;
  projectId?: number;
};

type Props = {
  workers: WorkerChipData[];
  targets: DropTarget[];
  onLinked?: (workerId: number, targetId: string) => void;
  className?: string;
};

export function WorkerLinkBoard({ workers, targets, onLinked, className }: Props) {
  const store = useOptionalVeraCoreUI();
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = workers.filter(
    (w) => !store?.linkedWorkerIds.includes(w.id),
  );

  const handleDrop = useCallback(
    async (target: DropTarget, workerId: number) => {
      setLinking(true);
      setError(null);
      store?.setSyncStatus("syncing");
      try {
        await linkWorkerToCompany({
          workerId,
          companyId: target.companyId,
        });
        store?.linkWorker(workerId);
        store?.markSynced();
        onLinked?.(workerId, target.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not link worker";
        setError(msg);
        store?.setSyncStatus("error");
      } finally {
        setLinking(false);
        setActiveTarget(null);
        setDraggingId(null);
      }
    },
    [store, onLinked],
  );

  return (
    <CoreSection
      title="Link workers"
      description="Drag workers into a company or project slot. Links sync automatically."
      action={<SyncPulse status={linking ? "syncing" : store?.syncStatus} />}
      className={className}
    >
      {error ? (
        <p className="rounded-lg border border-[var(--compliance-bad)]/30 bg-[var(--compliance-bad-bg)] px-3 py-2 text-sm text-[var(--compliance-bad-fg)]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Available workers
          </p>
          <div className="space-y-2">
            {available.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                All workers linked
              </p>
            ) : (
              available.map((worker) => (
                <WorkerChip
                  key={worker.id}
                  worker={worker}
                  onDragStart={setDraggingId}
                  onDragEnd={() => setDraggingId(null)}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Drop targets
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {targets.map((target) => {
              const Icon = target.kind === "company" ? Building2 : FolderKanban;
              const isActive = activeTarget === target.id;
              return (
                <div
                  key={target.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setActiveTarget(target.id);
                  }}
                  onDragLeave={() => setActiveTarget((t) => (t === target.id ? null : t))}
                  onDrop={(e) => {
                    e.preventDefault();
                    const raw =
                      e.dataTransfer.getData("application/vera-worker-id") ||
                      String(draggingId ?? "");
                    const workerId = Number(raw);
                    if (Number.isFinite(workerId) && workerId > 0) {
                      void handleDrop(target, workerId);
                    }
                  }}
                  className={cn(
                    "flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200",
                    isActive
                      ? "border-[var(--compliance-ok)] bg-[var(--compliance-ok-bg)]/50 scale-[1.02]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--compliance-ok)]/40",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      isActive ? "text-[var(--compliance-ok)]" : "text-[var(--muted-foreground)]",
                    )}
                    aria-hidden
                  />
                  <p className="text-sm font-medium text-[var(--foreground)]">{target.label}</p>
                  <p className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                    <Link2 className="h-3 w-3" aria-hidden />
                    Drop to link
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CoreSection>
  );
}
