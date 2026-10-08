"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  addInspectionItem,
  completeSafetyInspection,
  fetchSafetyInspection,
} from "@/lib/safety-intelligence";
import type { PhotoClassificationResult } from "@/lib/vsi-upload";
import { VsiPhotoUpload } from "@/src/components/safety-intelligence/VsiPhotoUpload";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
  SfFloatingTextarea,
} from "@/src/components/safety-forms/ui";

type Item = {
  id: string;
  polarity: string;
  caption?: string | null;
  photoPreviewUrl?: string | null;
  cailEntry?: { id: string; status: string; title: string } | null;
};

export default function WalkAroundDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [inspection, setInspection] = useState<{
    id: string;
    status: string;
    title?: string | null;
    projectId?: number;
    companyId?: number | null;
    items?: Item[];
  } | null>(null);
  const [polarity, setPolarity] = useState<"safe" | "at_risk">("at_risk");
  const [caption, setCaption] = useState("");
  const [ownerCompanyId, setOwnerCompanyId] = useState("1");
  const [coreFileId, setCoreFileId] = useState<number | null>(null);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setInspection(await fetchSafetyInspection(id) as typeof inspection);
  }

  useEffect(() => {
    if (id) void load();
  }, [id]);

  function onClassified(result: PhotoClassificationResult) {
    setPolarity(result.suggestedPolarity);
    if (result.suggestedCaption && !caption) {
      setCaption(result.suggestedCaption);
    }
    setAiHint(
      `${result.engines.join(" + ")}: ${result.suggestedPolarity} · ${result.suggestedSeverity}${result.hazardSummary ? ` — ${result.hazardSummary}` : ""}`,
    );
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await addInspectionItem(id, {
        polarity,
        caption,
        coreFileId: coreFileId ?? undefined,
        ownerCompanyId:
          polarity === "at_risk" ? Number(ownerCompanyId) : undefined,
        severity: polarity === "at_risk" ? "medium" : undefined,
      });
      setCoreFileId(null);
      setAiHint(null);
      setCaption("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    setBusy(true);
    try {
      await completeSafetyInspection(id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!inspection) {
    return <div className="p-8 text-sm">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">{inspection.title ?? "Walk-around"}</h1>
        <p className="text-sm text-[var(--sf-text-muted)]">Status: {inspection.status}</p>
      </header>

      {inspection.status === "in_progress" && (
        <SfCard className="space-y-4 p-6">
          <h2 className="font-medium">Add observation</h2>
          <form className="space-y-4" onSubmit={(e) => void addItem(e)}>
            <label className="block text-sm">
              Polarity
              <select
                className="mt-1 w-full rounded-lg border border-[var(--sf-border)] px-3 py-2"
                value={polarity}
                onChange={(e) => setPolarity(e.target.value as "safe" | "at_risk")}
              >
                <option value="safe">Safe</option>
                <option value="at_risk">At risk</option>
              </select>
            </label>

            <VsiPhotoUpload
              companyId={inspection.companyId ?? undefined}
              projectId={inspection.projectId}
              onUploaded={(file) => setCoreFileId(file.id)}
              onClassified={onClassified}
              disabled={busy}
            />

            <SfFloatingTextarea
              label="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            {aiHint && (
              <p className="text-xs text-[var(--sf-primary)]">{aiHint}</p>
            )}
            {polarity === "at_risk" && (
              <SfFloatingInput
                label="Owner company ID"
                value={ownerCompanyId}
                onChange={(e) => setOwnerCompanyId(e.target.value)}
              />
            )}
            <SfButton type="submit" disabled={busy || (polarity === "at_risk" && !coreFileId && !caption)}>
              Add item
            </SfButton>
          </form>
          <SfButton variant="secondary" type="button" disabled={busy} onClick={() => void complete()}>
            Complete inspection
          </SfButton>
        </SfCard>
      )}

      <SfCard className="p-6">
        <h2 className="font-medium">Items</h2>
        <ul className="mt-4 space-y-4">
          {(inspection.items ?? []).map((item) => (
            <li key={item.id} className="border-b border-[var(--sf-border)] pb-4 last:border-0">
              <span className="text-xs uppercase text-[var(--sf-text-muted)]">{item.polarity}</span>
              <p className="mt-1">{item.caption ?? "—"}</p>
              {item.photoPreviewUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-[var(--sf-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.photoPreviewUrl}
                    alt=""
                    className="max-h-40 w-full object-contain"
                  />
                </div>
              )}
              {item.cailEntry && (
                <Link
                  href={`/pm/safety-intelligence/${item.cailEntry.id}`}
                  className="mt-1 inline-block text-sm text-[var(--sf-primary)]"
                >
                  CAIL: {item.cailEntry.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </SfCard>
    </div>
  );
}
