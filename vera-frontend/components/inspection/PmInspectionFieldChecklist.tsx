"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { InspectionChecklistFields } from "@/components/inspection/InspectionChecklistFields";
import { OfflineFormFooter } from "@/components/field/OfflineFormFooter";
import { useFieldMode } from "@/components/field/FieldModeProvider";
import { syncPmInspectionOffline } from "@/lib/field/workflows/pm-inspection";
import { pruneHiddenInspectionAnswers } from "@/lib/inspection-visible-items";
import {
  fetchPmInspectionPhotoFindings,
  getPmInspection,
  savePmInspectionAnswers,
  submitPmInspection,
  type PmInspection,
  type PmInspectionPhotoFinding,
} from "@/lib/pm-inspections";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export function PmInspectionFieldChecklist({
  inspectionId,
  projectId = 1,
}: {
  inspectionId: string;
  projectId?: number;
}) {
  const { cache, queue, fieldModeActive } = useFieldMode();
  const [inspection, setInspection] = useState<PmInspection | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [photoFindings, setPhotoFindings] = useState<PmInspectionPhotoFinding[]>(
    [],
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    void getPmInspection(inspectionId).then((row) => {
      const templateItems = row.template.items ?? [];
      const raw = (row.answers as Record<string, unknown>) ?? {};
      setInspection(row);
      setAnswers(pruneHiddenInspectionAnswers(templateItems, raw));
    });
    void fetchPmInspectionPhotoFindings(inspectionId)
      .then(setPhotoFindings)
      .catch(() => setPhotoFindings([]));
  }, [inspectionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!inspection) {
    return <p className="p-4 text-sm text-[var(--sf-text-muted)]">Loading…</p>;
  }

  const items = inspection.template.items ?? [];
  const editable = ["draft", "in_progress"].includes(inspection.status);

  async function persistAnswers(submitted = false) {
    if (!inspection) return { offline: false as const };
    const payload = pruneHiddenInspectionAnswers(items, answers);

    if (fieldModeActive && cache && queue) {
      const { pendingSyncId } = await syncPmInspectionOffline(cache, queue, {
        clientSyncId: inspection.clientSyncId ?? `field-${inspectionId}`,
        templateId: inspection.template.id,
        companyId: inspection.companyId,
        projectId: inspection.projectId ?? projectId,
        answers: payload,
        siteId: inspection.siteId ?? undefined,
        equipmentId: inspection.equipmentId ?? undefined,
        workerId: inspection.workerId ?? undefined,
        submitted,
        templateItems: items,
      });
      return { offline: true as const, pendingSyncId };
    }

    await savePmInspectionAnswers(inspectionId, payload);
    if (submitted) {
      await submitPmInspection(inspectionId);
    }
    return { offline: false as const };
  }

  async function saveDraft() {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const result = await persistAnswers(false);
      if (result.offline) {
        setStatus(`Saved offline — queued as ${result.pendingSyncId}`);
      } else {
        setStatus("Draft saved");
        load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const result = await persistAnswers(true);
      if (result.offline) {
        setStatus("Submitted offline — will sync when online");
      } else {
        setStatus("Inspection submitted");
        load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/field" className="text-sm text-teal-700 underline">
        ← Field dashboard
      </Link>
      <header>
        <h1 className="text-xl font-semibold">
          {inspection.title ?? inspection.template.name}
        </h1>
        <p className="text-sm text-[var(--sf-text-muted)]">{inspection.status}</p>
      </header>

      <SfCard className="space-y-4 p-4">
        <InspectionChecklistFields
          items={items}
          answers={answers}
          editable={editable}
          onAnswersChange={setAnswers}
          photoFindings={photoFindings}
          inspectionId={inspectionId}
          companyId={inspection.companyId}
          projectId={inspection.projectId ?? projectId}
          onPhotoCaptured={() => load()}
        />

        {editable ? (
          <div className="space-y-2 pt-2">
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            {status ? (
              <p className="text-sm text-teal-800" role="status">
                {status}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <SfButton
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void saveDraft()}
              >
                Save draft
              </SfButton>
              <SfButton
                type="button"
                disabled={busy}
                onClick={() => void submit()}
              >
                Submit
              </SfButton>
            </div>
          </div>
        ) : null}
      </SfCard>

      <OfflineFormFooter />
    </div>
  );
}
