"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  autoAssignUnifiedCapa,
  fetchUnifiedCapa,
  markUnifiedCapaInProgress,
  publishUnifiedCapa,
  submitUnifiedCapa,
  verifyUnifiedCapa,
} from "@/lib/pm-unified-corrective-action";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type CapaDetail = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  actionType: string;
  priorityScore: number;
  severityScore: number;
  escalationLevel: number;
  dueAt?: string | null;
  sourceModule: string;
  hazardId?: string | null;
  controlId?: string | null;
  assignees?: Array<{ id: string; role: string; user?: { username: string } }>;
  escalations?: Array<{ id: string; level: number; reason: string }>;
  verifications?: Array<{ id: string; outcome: string; role: string; notes?: string | null }>;
};

export default function PmUnifiedCorrectiveActionDetailPage({
  id,
  companyId = 1,
  projectId,
}: {
  id: string;
  companyId?: number;
  projectId?: number;
}) {
  const [action, setAction] = useState<CapaDetail | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");

  const load = useCallback(() => {
    void fetchUnifiedCapa(id).then((r) => setAction(r as CapaDetail));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!action) {
    return <p className="p-8 text-sm text-[var(--sf-text-muted)]">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">{action.title}</h1>
        <p className="text-sm text-[var(--sf-text-muted)]">
          {action.actionType.replace(/_/g, " ")} · {action.sourceModule} · severity {action.severityScore}{" "}
          · escalation L{action.escalationLevel} · {action.status}
        </p>
      </header>

      <SfCard className="p-5">
        <p className="whitespace-pre-wrap text-sm">{action.description ?? "—"}</p>
        {action.dueAt ? (
          <p className="mt-2 text-xs text-[var(--sf-text-muted)]">
            Due {new Date(action.dueAt).toLocaleString()}
          </p>
        ) : null}
        {(action.hazardId || action.controlId) && (
          <p className="mt-2 text-xs text-[var(--sf-text-muted)]">
            {action.hazardId ? `Hazard ${action.hazardId}` : ""}
            {action.controlId ? ` · Control ${action.controlId}` : ""}
          </p>
        )}
      </SfCard>

      {action.assignees?.length ? (
        <SfCard className="p-5">
          <h2 className="mb-2 font-medium">Assignees</h2>
          <ul className="text-sm">
            {action.assignees.map((a) => (
              <li key={a.id}>
                {a.user?.username ?? "—"} ({a.role})
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {action.escalations?.length ? (
        <SfCard className="p-5">
          <h2 className="mb-2 font-medium">Escalations</h2>
          <ul className="text-sm text-[var(--sf-text-muted)]">
            {action.escalations.map((e) => (
              <li key={e.id}>
                L{e.level}: {e.reason}
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {["draft", "assigned", "open", "in_progress"].includes(action.status) ? (
        <SfCard className="flex flex-wrap gap-2 p-4">
          {action.status === "draft" ? (
            <SfButton type="button" onClick={() => void publishUnifiedCapa(id).then(load)}>
              Publish
            </SfButton>
          ) : null}
          <SfButton type="button" variant="secondary" onClick={() => void autoAssignUnifiedCapa(id).then(load)}>
            Auto-assign
          </SfButton>
          <SfButton type="button" variant="secondary" onClick={() => void markUnifiedCapaInProgress(id).then(load)}>
            Mark in progress
          </SfButton>
          <SfButton type="button" onClick={() => void submitUnifiedCapa(id).then(load)}>
            Submit for verification
          </SfButton>
        </SfCard>
      ) : null}

      {action.status === "verification_pending" ? (
        <SfCard className="space-y-3 p-4">
          <textarea
            className="w-full rounded border border-[var(--sf-border)] bg-transparent p-2 text-sm"
            placeholder="Verification notes"
            value={verifyNotes}
            onChange={(e) => setVerifyNotes(e.target.value)}
          />
          <div className="flex gap-2">
            <SfButton
              type="button"
              onClick={() =>
                void verifyUnifiedCapa(id, {
                  outcome: "approve",
                  role: "supervisor",
                  notes: verifyNotes,
                }).then(load)
              }
            >
              Approve & close
            </SfButton>
            <SfButton
              type="button"
              variant="secondary"
              onClick={() =>
                void verifyUnifiedCapa(id, {
                  outcome: "reject",
                  role: "supervisor",
                  notes: verifyNotes,
                }).then(load)
              }
            >
              Reject
            </SfButton>
          </div>
        </SfCard>
      ) : null}

      <p className="text-xs text-[var(--sf-text-muted)]">
        Company #{companyId}
        {projectId ? ` · Project #${projectId}` : ""} ·{" "}
        <Link href={`/pm/corrective-actions/${id}`} className="text-[var(--sf-primary)]">
          Legacy detail view
        </Link>
      </p>
    </div>
  );
}
