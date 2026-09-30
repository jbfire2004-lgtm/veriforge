"use client";

import { useState } from "react";
import { CloudOff, Loader2 } from "lucide-react";
import { InspectionPhotoFindingViewer } from "@/components/inspection/InspectionPhotoFindingViewer";
import {
  syncStateLabel,
  type InspectionPhotoDisplayItem,
} from "@/lib/inspection-photo-findings";
import { cn } from "@/src/lib/utils";

function severityClass(severity?: string): string {
  switch ((severity ?? "").toLowerCase()) {
    case "critical":
    case "high":
      return "ring-red-300";
    case "medium":
      return "ring-amber-300";
    default:
      return "ring-slate-200";
  }
}

function SyncBadge({ state }: { state: InspectionPhotoDisplayItem["syncState"] }) {
  if (state === "synced") return null;

  const className =
    state === "failed"
      ? "bg-red-100 text-red-900"
      : state === "syncing"
        ? "bg-sky-100 text-sky-900"
        : "bg-amber-100 text-amber-950";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        className,
      )}
      data-testid={`photo-sync-badge-${state}`}
    >
      {state === "syncing" ? (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
      ) : state === "pending" ? (
        <CloudOff className="h-3 w-3" aria-hidden />
      ) : null}
      {syncStateLabel(state)}
    </span>
  );
}

export function InspectionItemPhotoFindings({
  displays,
}: {
  displays: InspectionPhotoDisplayItem[];
}) {
  const [active, setActive] = useState<InspectionPhotoDisplayItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  if (!displays.length) return null;

  function openDisplay(display: InspectionPhotoDisplayItem) {
    setActive(display);
    setViewerOpen(true);
  }

  return (
    <div
      className="mt-3 space-y-2 rounded-lg border border-dashed border-[var(--sf-border)] bg-[var(--sf-surface-muted,#f8fafc)] p-3"
      data-testid="inspection-item-photo-findings"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--sf-text-muted)]">
        Photo findings ({displays.length})
      </p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {displays.map((display) => {
          const tags = display.hazardTags.slice(0, 3);
          return (
            <li key={display.id}>
              <button
                type="button"
                className={cn(
                  "relative w-full overflow-hidden rounded-md bg-white text-left ring-1 transition hover:ring-2 hover:ring-[var(--sf-primary)]",
                  severityClass(display.severity),
                )}
                onClick={() => openDisplay(display)}
                data-testid={`photo-thumbnail-${display.id}`}
              >
                <div className="aspect-[4/3] w-full bg-slate-100">
                  {display.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={display.imageUrl}
                      alt={display.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-[var(--sf-text-muted)]">
                      {display.title}
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <p className="line-clamp-2 flex-1 text-xs font-medium">
                      {display.title}
                    </p>
                    <SyncBadge state={display.syncState} />
                  </div>
                  {display.ocrText ? (
                    <p
                      className="line-clamp-2 text-[10px] leading-snug text-[var(--sf-text-muted)]"
                      data-testid={`photo-ocr-${display.id}`}
                    >
                      {display.ocrText}
                    </p>
                  ) : null}
                  {tags.length ? (
                    <div
                      className="flex flex-wrap gap-1"
                      data-testid={`photo-tags-${display.id}`}
                    >
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-amber-50 px-1 py-0.5 text-[10px] text-amber-900"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <InspectionPhotoFindingViewer
        display={active}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </div>
  );
}
