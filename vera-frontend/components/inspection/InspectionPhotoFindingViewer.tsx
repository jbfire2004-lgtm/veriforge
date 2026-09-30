"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import {
  photoFindingToDisplayItem,
  syncStateLabel,
  type InspectionPhotoDisplayItem,
} from "@/lib/inspection-photo-findings";
import type { PmInspectionPhotoFinding } from "@/lib/pm-inspections";

type ViewerTarget =
  | InspectionPhotoDisplayItem
  | PmInspectionPhotoFinding
  | null;

function toDisplayItem(target: ViewerTarget): InspectionPhotoDisplayItem | null {
  if (!target) return null;
  if ("syncState" in target) return target;
  return photoFindingToDisplayItem(target);
}

export function InspectionPhotoFindingViewer({
  finding,
  display,
  open,
  onOpenChange,
}: {
  finding?: PmInspectionPhotoFinding | null;
  display?: InspectionPhotoDisplayItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const item = display ?? toDisplayItem(finding ?? null);

  useEffect(() => {
    if (!open || !item) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, item, onOpenChange]);

  if (!item || !open) return null;

  const imageUrl = item.imageUrl;
  const ocr = item.ocrText;
  const tags = item.hazardTags;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      data-testid="inspection-photo-viewer"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold sm:text-lg">{item.title}</h2>
          {item.description ? (
            <p className="mt-1 text-sm text-white/70">{item.description}</p>
          ) : null}
          <p className="mt-1 text-xs text-white/60">{syncStateLabel(item.syncState)}</p>
        </div>
        <button
          type="button"
          className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Close viewer"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {imageUrl ? (
          <div className="mb-4 flex min-h-[40dvh] items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={item.title}
              className="max-h-[min(72dvh,900px)] w-full object-contain"
            />
          </div>
        ) : (
          <p className="mb-4 text-sm text-white/60">No image preview available.</p>
        )}

        {ocr ? (
          <section className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">
              OCR / caption
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-white/90">{ocr}</p>
          </section>
        ) : null}

        {tags.length ? (
          <section className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">
              Hazard tags
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-medium text-amber-100"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {item.severity ? (
          <p className="text-xs text-white/50">
            {item.severity}
            {item.correctiveActionTitle
              ? ` · CAPA: ${item.correctiveActionTitle}`
              : ""}
          </p>
        ) : null}

        {item.lastError ? (
          <p className="mt-2 text-sm text-red-300" role="alert">
            {item.lastError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
