"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchSafetyForm,
  fetchSafetyFormDefinition,
  type SafetyFormDetail,
  type SafetyFormStatus,
} from "@/lib/safety-forms";
import { transitionSafetyWorkflowForm } from "@/lib/safety-workflow";
import { SafetyFormAttachmentsPanel } from "@/components/safety-workflow/SafetyFormAttachmentsPanel";
import { SafetyFormEngine } from "@/src/components/safety-forms/engine";
import { SafetyFormStatusBadge } from "@/src/components/safety-forms/SafetyFormStatusBadge";
import type { SafetyFormDefinition } from "@/src/components/safety-forms/engine/types";
import {
  SfButton,
  SfCard,
  SfSection,
  SfTimeline,
  type TimelineEvent,
} from "@/src/components/safety-forms/ui";
import { safetyFormErrorMessage } from "@/lib/safety-form-errors";

const SUPERVISOR_ACTIONS: Array<{ status: SafetyFormStatus; label: string }> = [
  { status: "APPROVED", label: "Approve" },
  { status: "REJECTED", label: "Reject" },
  { status: "CLOSED", label: "Close" },
];

export default function SafetyFormDetailPage({
  formId,
  backHref = "/pm/safety-forms",
}: {
  formId: string;
  backHref?: string;
}) {
  const [form, setForm] = useState<SafetyFormDetail | null>(null);
  const [definition, setDefinition] = useState<SafetyFormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const row = await fetchSafetyForm(formId);
      setForm(row);
      const def = await fetchSafetyFormDefinition(row.definitionId);
      setDefinition(def);
    } catch (e) {
      setError(safetyFormErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function transition(status: SafetyFormStatus) {
    setBusy(true);
    try {
      await transitionSafetyWorkflowForm(formId, status);
      await load();
    } catch (e) {
      setError(safetyFormErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="p-8 text-sm text-[var(--sf-text-muted)]">Loading submission…</p>
    );
  }

  if (error || !form || !definition) {
    return (
      <div className="p-8">
        <p className="text-sm text-[var(--sf-danger)]">{error ?? "Not found"}</p>
        <Link href="/pm/safety-forms" className="text-[var(--sf-primary)] underline">
          Back
        </Link>
      </div>
    );
  }

  const readOnly = !["DRAFT", "REJECTED"].includes(form.status);
  const showSupervisor =
    form.status === "SUBMITTED" || form.status === "UNDER_REVIEW";

  const timeline: TimelineEvent[] = (form.auditLogs ?? []).map((log) => ({
    id: log.id,
    title: log.eventType.replace(/_/g, " "),
    time: new Date(log.createdAt).toLocaleString(),
    tone:
      log.eventType.includes("reject") || log.eventType.includes("REJECTED")
        ? "danger"
        : log.eventType.includes("approv")
          ? "success"
          : "default",
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <section>
          <Link href={backHref} className="mb-2 inline-block text-sm text-[var(--sf-primary)] hover:underline">
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--sf-text)]">
            {form.title ?? definition.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--sf-text-muted)]">
            {form.sifFlag ? "SIF · " : ""}
            {form.hecaFlag ? "HECA · " : ""}
            Updated {new Date(form.updatedAt).toLocaleString()}
          </p>
        </section>
        <SafetyFormStatusBadge status={form.status} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          {timeline.length > 0 ? (
            <SfCard padding="md">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--sf-text-muted)]">
                Timeline
              </h2>
              <SfTimeline events={timeline} />
            </SfCard>
          ) : null}

          {form.actions && form.actions.length > 0 ? (
            <SfCard padding="md">
              <h2 className="mb-3 text-sm font-semibold text-[var(--sf-text)]">
                Corrective actions
              </h2>
              <ul className="space-y-2 text-sm">
                {form.actions.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-[var(--sf-radius-sm)] border border-[var(--sf-border)] px-3 py-2"
                  >
                    {a.title}
                    <span className="ml-2 text-[var(--sf-text-muted)]">{a.status}</span>
                  </li>
                ))}
              </ul>
            </SfCard>
          ) : null}
        </aside>

        <div className="space-y-6">
          {showSupervisor ? (
            <SfSection title="Supervisor review" collapsible={false}>
              <div className="flex flex-wrap gap-2">
                {SUPERVISOR_ACTIONS.map((a) => (
                  <SfButton
                    key={a.status}
                    type="button"
                    variant={a.status === "REJECTED" ? "ghost" : "primary"}
                    disabled={busy}
                    onClick={() => void transition(a.status)}
                  >
                    {a.label}
                  </SfButton>
                ))}
              </div>
            </SfSection>
          ) : null}

          <SafetyFormAttachmentsPanel formId={form.id} readOnly={readOnly} />

          <SafetyFormEngine
            definition={definition}
            formId={form.id}
            initialData={form.formData as Record<string, unknown>}
            projectId={form.projectId ?? undefined}
            workerId={form.workerId ?? undefined}
            companyId={form.companyId ?? undefined}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
