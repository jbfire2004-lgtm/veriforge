"use client";

import { useMemo, useRef, useState } from "react";
import { InspectionItemPhotoFindings } from "@/components/inspection/InspectionItemPhotoFindings";
import { InspectionVisibilityNotice } from "@/components/inspection/InspectionVisibilityNotice";
import {
  describeShowIfConditionForItems,
  pruneHiddenInspectionAnswers,
  visibleInspectionItems,
} from "@/lib/inspection-visible-items";
import { displaysForChecklistItem } from "@/lib/inspection-photo-findings";
import { capturePmInspectionPhotoOffline } from "@/lib/field/workflows/pm-inspection-photo";
import { useFieldMode } from "@/components/field/FieldModeProvider";
import { useInspectionVisibilityChanges } from "@/lib/use-inspection-visibility-changes";
import { useInspectionPhotoFindings } from "@/lib/use-inspection-photo-findings";
import type { PmInspectionPhotoFinding } from "@/lib/pm-inspections";
import type { PmInspectionTemplate } from "@/lib/pm-inspections";
import { captureInspectionPhoto } from "@/lib/pm-inspection-v2";
import { cn } from "@/src/lib/utils";
import { Camera, CloudOff, Loader2 } from "lucide-react";

type Item = PmInspectionTemplate["items"][number];

export function InspectionChecklistFields({
  items,
  answers,
  editable,
  onAnswersChange,
  photoFindings = [],
  inspectionId,
  companyId,
  projectId,
  onPhotoCaptured,
}: {
  items: Item[];
  answers: Record<string, unknown>;
  editable: boolean;
  onAnswersChange: (next: Record<string, unknown>) => void;
  photoFindings?: PmInspectionPhotoFinding[];
  inspectionId?: string;
  companyId?: number;
  projectId?: number;
  onPhotoCaptured?: () => void;
}) {
  const { cache, queue, fieldModeActive, isOnline } = useFieldMode();
  const useOfflineCapture = fieldModeActive && !isOnline && !!cache && !!queue;
  const { grouped, pendingCount, syncing, refreshPending } =
    useInspectionPhotoFindings(inspectionId, photoFindings, items);
  const visible = useMemo(
    () => visibleInspectionItems(items, answers),
    [items, answers],
  );
  const conditionalCount = items.filter((item) => item.showIf).length;
  const hiddenCount = items.length - visible.length;
  const visibilityNotice = useInspectionVisibilityChanges(items, answers);
  const fileRef = useRef<HTMLInputElement>(null);
  const [captureItemId, setCaptureItemId] = useState<string | null>(null);
  const [captureBusy, setCaptureBusy] = useState(false);

  function updateAnswers(patch: Record<string, unknown>) {
    const merged = { ...answers, ...patch };
    onAnswersChange(pruneHiddenInspectionAnswers(items, merged));
  }

  async function handlePhotoFile(file: File, itemId: string) {
    if (!inspectionId) return;
    setCaptureBusy(true);
    try {
      if (useOfflineCapture && companyId != null && projectId != null) {
        await capturePmInspectionPhotoOffline(cache!, queue!, {
          inspectionId,
          companyId,
          projectId,
          photo: file,
          caption: file.name,
          checklistItemId: itemId,
        });
        await refreshPending();
      } else {
        const dataUrl = await readAsDataUrl(file);
        await captureInspectionPhoto(inspectionId, {
          dataUrl,
          fileName: file.name,
          caption: file.name,
          clientSyncId: `photo-${itemId}-${Date.now()}`,
          checklistItemId: itemId,
        });
      }
      onPhotoCaptured?.();
    } finally {
      setCaptureBusy(false);
      setCaptureItemId(null);
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const itemId = captureItemId;
          e.target.value = "";
          if (file && itemId) void handlePhotoFile(file, itemId);
        }}
      />

      {visibilityNotice ? (
        <InspectionVisibilityNotice notice={visibilityNotice} />
      ) : null}

      {pendingCount > 0 || syncing ? (
        <p className="text-xs text-amber-800" role="status">
          {syncing
            ? "Syncing photos — findings update when analysis completes."
            : `${pendingCount} photo${pendingCount === 1 ? "" : "s"} queued for sync.`}
        </p>
      ) : null}

      {visible.map((item) => {
        const itemDisplays = displaysForChecklistItem(item.id, grouped);
        const justRevealed = visibilityNotice?.revealedIds.has(item.id) ?? false;
        return (
          <div
            key={item.id}
            data-visible="true"
            data-item-id={item.id}
            className={cn(
              "rounded-lg border border-transparent p-1 transition-all duration-300",
              justRevealed &&
                "border-sky-300 bg-sky-50/60 shadow-sm ring-1 ring-sky-200",
            )}
          >
            {item.showIf ? (
              <p className="mb-1 text-xs text-[var(--sf-text-muted)]">
                Shown when {describeShowIfConditionForItems(item.showIf, items)}
              </p>
            ) : null}
            <label className="block text-sm font-medium">
              {item.label}
              {item.required ? " *" : ""}
            </label>
            {item.type === "pass_fail" ? (
              <select
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                disabled={!editable}
                value={
                  answers[item.id] === true || answers[item.id] === "pass"
                    ? "pass"
                    : answers[item.id] === false || answers[item.id] === "fail"
                      ? "fail"
                      : ""
                }
                onChange={(e) =>
                  updateAnswers({
                    [item.id]:
                      e.target.value === "pass"
                        ? true
                        : e.target.value === "fail"
                          ? false
                          : e.target.value,
                  })
                }
              >
                <option value="">—</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            ) : item.type === "text" ? (
              <textarea
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                disabled={!editable}
                value={String(answers[item.id] ?? "")}
                onChange={(e) => updateAnswers({ [item.id]: e.target.value })}
              />
            ) : item.type === "select" && item.options?.length ? (
              <select
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                disabled={!editable}
                value={String(answers[item.id] ?? "")}
                onChange={(e) => updateAnswers({ [item.id]: e.target.value })}
              >
                <option value="">—</option>
                {item.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : item.type === "photo" && editable && inspectionId ? (
              <button
                type="button"
                className="mt-1 inline-flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                disabled={captureBusy}
                onClick={() => {
                  setCaptureItemId(item.id);
                  fileRef.current?.click();
                }}
              >
                {captureBusy && captureItemId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : useOfflineCapture ? (
                  <CloudOff className="h-4 w-4" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {useOfflineCapture ? "Add photo (offline queue)" : "Add photo for this item"}
              </button>
            ) : (
              <input
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
                disabled={!editable}
                value={String(answers[item.id] ?? "")}
                onChange={(e) => updateAnswers({ [item.id]: e.target.value })}
              />
            )}
            <InspectionItemPhotoFindings displays={itemDisplays} />
          </div>
        );
      })}

      {grouped.unassigned.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <p className="mb-2 text-sm font-medium text-amber-950">
            General photo findings
          </p>
          <InspectionItemPhotoFindings displays={grouped.unassigned} />
        </div>
      ) : null}

      {conditionalCount > 0 && hiddenCount > 0 ? (
        <p
          className="text-xs text-[var(--sf-text-muted)]"
          data-testid="inspection-hidden-count"
        >
          {hiddenCount} conditional question{hiddenCount === 1 ? "" : "s"} hidden
          until prior answers match.
        </p>
      ) : null}
    </>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
