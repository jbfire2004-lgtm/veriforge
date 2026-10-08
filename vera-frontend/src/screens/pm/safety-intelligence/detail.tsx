"use client";

import { ArrowLeft, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  analyzeCailEntry,
  cancelCailEntry,
  CAIL_SOURCE_LABELS,
  fetchCailEntry,
  resolveCailEntry,
  verifyCailEntry,
  type CailEntryDetail,
  type EvidenceRef,
} from "@/lib/safety-intelligence";
import { CailStatusBadge } from "@/src/components/safety-intelligence/CailStatusBadge";
import { VsiEvidenceGallery } from "@/src/components/safety-intelligence/VsiEvidenceGallery";
import {
  SfButton,
  SfCard,
  SfFloatingTextarea,
  SfSection,
  SfTimeline,
} from "@/src/components/safety-forms/ui";

export default function CailDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [entry, setEntry] = useState<CailEntryDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setEntry(await fetchCailEntry(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) void load();
  }, [id]);

  async function onResolve() {
    setBusy(true);
    try {
      const updated = await resolveCailEntry(id, { resolutionNotes: notes });
      setEntry(updated);
      setNotes("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resolve failed");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    setBusy(true);
    try {
      setEntry(await verifyCailEntry(id, notes || undefined));
      setNotes("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    if (!confirm("Cancel this CAIL entry?")) return;
    setBusy(true);
    try {
      setEntry(await cancelCailEntry(id, notes || undefined));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-[var(--sf-text-muted)]">
        Loading…
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-red-600">{error ?? "Not found"}</p>
      </div>
    );
  }

  const timeline =
    entry.activityLogs?.map((l) => ({
      id: l.id,
      title: l.eventType,
      time: new Date(l.createdAt).toLocaleString(),
    })) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <Link
        href="/pm/safety-intelligence"
        className="inline-flex items-center gap-1 text-sm text-[var(--sf-text-muted)] hover:text-[var(--sf-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        CAIL
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CailStatusBadge status={entry.status} />
          <span className="text-xs uppercase text-[var(--sf-text-muted)]">
            {CAIL_SOURCE_LABELS[entry.sourceType]}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--sf-text)]">{entry.title}</h1>
        {entry.description && (
          <p className="text-sm text-[var(--sf-text-muted)]">{entry.description}</p>
        )}
      </header>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <SfCard className="grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs text-[var(--sf-text-muted)]">Project</p>
          <p className="font-medium">{entry.project?.name ?? entry.projectId}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--sf-text-muted)]">Owner</p>
          <p className="font-medium">
            {entry.ownerCompany?.name ?? entry.ownerCompanyId}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--sf-text-muted)]">Severity</p>
          <p className="font-medium capitalize">{entry.severity}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--sf-text-muted)]">Due</p>
          <p className="font-medium">
            {entry.dueDate
              ? new Date(entry.dueDate).toLocaleDateString()
              : "—"}
          </p>
        </div>
      </SfCard>

      <VsiEvidenceGallery
        title="Evidence (before)"
        items={(entry.evidenceBefore as EvidenceRef[]) ?? []}
      />
      <VsiEvidenceGallery
        title="Evidence (after)"
        items={(entry.evidenceAfter as EvidenceRef[]) ?? []}
      />

      <SfSection title="AI intelligence">
        <SfButton
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void analyzeCailEntry(id)
              .then((r) => {
                setEntry(r.entry);
                setAiSummary(r.analysis.summary);
              })
              .catch((e) =>
                setError(e instanceof Error ? e.message : "AI analyze failed"),
              )
              .finally(() => setBusy(false));
          }}
        >
          <Sparkles className="h-4 w-4" />
          Run AI analysis
        </SfButton>
        {(aiSummary || entry.aiClassification?.summary) && (
          <p className="mt-3 text-sm text-[var(--sf-text-muted)]">
            {aiSummary ?? entry.aiClassification?.summary}
          </p>
        )}
        {entry.aiClassification?.engine && (
          <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
            Engine: {entry.aiClassification.engine}
            {entry.aiClassification.module
              ? ` · ${entry.aiClassification.module}`
              : ""}
          </p>
        )}
        {entry.aiClassification?.cailEnvelope && (
          <div className="mt-4 space-y-2 text-sm">
            {entry.aiClassification.cailEnvelope.hazard_type && (
              <p>
                <span className="font-medium">Hazard:</span>{" "}
                {entry.aiClassification.cailEnvelope.hazard_type}
              </p>
            )}
            {entry.aiClassification.cailEnvelope.recommended_corrective_actions
              ?.length ? (
              <div>
                <p className="font-medium">Corrective actions</p>
                <ul className="mt-1 list-inside list-disc text-[var(--sf-text-muted)]">
                  {entry.aiClassification.cailEnvelope.recommended_corrective_actions.map(
                    (a) => (
                      <li key={a}>{a}</li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}
            {entry.aiClassification.cailEnvelope.recommended_preventive_actions
              ?.length ? (
              <div>
                <p className="font-medium">Preventive actions</p>
                <ul className="mt-1 list-inside list-disc text-[var(--sf-text-muted)]">
                  {entry.aiClassification.cailEnvelope.recommended_preventive_actions.map(
                    (a) => (
                      <li key={a}>{a}</li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </SfSection>

      {(entry.status === "open" ||
        entry.status === "in_progress" ||
        entry.status === "overdue") && (
        <SfSection title="Actions">
          <SfFloatingTextarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <SfButton type="button" disabled={busy} onClick={() => void onResolve()}>
              <CheckCircle2 className="h-4 w-4" />
              Resolve
            </SfButton>
            <SfButton
              variant="secondary"
              type="button"
              disabled={busy}
              onClick={() => void onCancel()}
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </SfButton>
          </div>
        </SfSection>
      )}

      {entry.status === "resolved" && (
        <SfSection title="Verification">
          <SfFloatingTextarea
            label="Verification note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <SfButton
            className="mt-4"
            type="button"
            disabled={busy}
            onClick={() => void onVerify()}
          >
            Verify closure
          </SfButton>
        </SfSection>
      )}

      {entry.status === "verified" && (
        <SfCard className="p-6">
          <h2 className="font-medium">Lessons learned</h2>
          {entry.lessonLearned ? (
            <Link
              href={`/pm/safety-intelligence/lessons/${entry.lessonLearned.id}`}
              className="mt-2 inline-block text-sm text-[var(--sf-primary)]"
            >
              View lesson: {entry.lessonLearned.title} →
            </Link>
          ) : (
            <p className="mt-2 text-sm text-[var(--sf-text-muted)]">
              Lesson will appear after verification processing.
            </p>
          )}
        </SfCard>
      )}

      {timeline.length > 0 && (
        <SfSection title="Activity">
          <SfTimeline events={timeline} />
        </SfSection>
      )}
    </div>
  );
}
