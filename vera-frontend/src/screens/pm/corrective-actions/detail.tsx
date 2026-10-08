"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getPmCorrectiveAction,
  markPmCapaInProgress,
  submitPmCapaVerification,
  verifyPmCorrectiveAction,
  type PmCorrectiveAction,
} from "@/lib/pm-corrective-actions";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export default function PmCapaDetailPage({
  id,
  projectId = 1,
}: {
  id: string;
  projectId?: number;
}) {
  const [action, setAction] = useState<PmCorrectiveAction | null>(null);

  const load = useCallback(() => {
    void getPmCorrectiveAction(id).then(setAction);
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
          {action.actionType.replace(/_/g, " ")} · {action.sourceModule} · priority{" "}
          {action.priorityScore} · escalation L{action.escalationLevel} · {action.status}
        </p>
      </header>

      <SfCard className="p-5">
        <p className="text-sm whitespace-pre-wrap">{action.description ?? "—"}</p>
        {action.dueAt ? (
          <p className="mt-2 text-xs text-[var(--sf-text-muted)]">
            Due {new Date(action.dueAt).toLocaleString()}
          </p>
        ) : null}
        {action.cailEntry ? (
          <p className="mt-2 text-xs">
            CAIL: {action.cailEntry.status} (
            <Link href="/pm/safety-intelligence" className="text-[var(--sf-primary)]">
              view hub
            </Link>
            )
          </p>
        ) : null}
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

      {["assigned", "open", "in_progress"].includes(action.status) ? (
        <SfCard className="flex flex-wrap gap-2 p-4">
          <SfButton type="button" variant="secondary" onClick={() => void markPmCapaInProgress(id).then(load)}>
            Mark in progress
          </SfButton>
          <SfButton type="button" onClick={() => void submitPmCapaVerification(id).then(load)}>
            Submit for verification
          </SfButton>
        </SfCard>
      ) : null}

      {action.status === "verification_pending" ? (
        <SfCard className="flex gap-2 p-4">
          <SfButton
            type="button"
            onClick={() =>
              void verifyPmCorrectiveAction(id, "approve", "supervisor").then(load)
            }
          >
            Verify & close
          </SfButton>
          <SfButton
            type="button"
            variant="secondary"
            onClick={() =>
              void verifyPmCorrectiveAction(id, "reject", "supervisor", "Incomplete").then(
                load,
              )
            }
          >
            Reject
          </SfButton>
        </SfCard>
      ) : null}
    </div>
  );
}
