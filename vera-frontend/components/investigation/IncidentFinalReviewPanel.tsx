"use client";

import { useMemo, useState } from "react";
import {
  approvePmIncident,
  closePmIncident,
  reviewPmIncident,
  submitPmIncident,
  updateInvestigation,
  type PmSafetyEvent,
} from "@/lib/pm-incidents";
import { InvestigationReportView } from "@/components/investigation/InvestigationReport";
import { Button } from "@/components/ui/button";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  event: PmSafetyEvent;
  onUpdate: () => void;
};

type Gate = { id: string; label: string; ok: boolean; hint: string };

export function IncidentFinalReviewPanel({ event, onUpdate }: Props) {
  const [notes, setNotes] = useState(event.reviewNotes ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const gates: Gate[] = useMemo(() => {
    const evidenceCount =
      (event.attachments?.length ?? 0) +
      (event.witnesses?.length ?? 0) +
      (event.statements?.length ?? 0);
    const openActions = event.correctiveActions.filter(
      (c) => !["closed", "verified", "complete", "completed"].includes(c.status),
    ).length;
    return [
      {
        id: "info",
        label: "Incident information complete",
        ok: Boolean(
          event.title?.trim() &&
            event.description?.trim() &&
            event.occurredAt &&
            (event.locationNote?.trim() || event.projectId),
        ),
        hint: "Title, description, date, and location",
      },
      {
        id: "evidence",
        label: "Evidence collected",
        ok: evidenceCount > 0,
        hint: "Witnesses, statements, photos, or training records",
      },
      {
        id: "rca",
        label: "Root cause documented",
        ok: event.rootCauses.length > 0,
        hint: "At least one structured RCA method",
      },
      {
        id: "capa",
        label: "Corrective actions assigned",
        ok: event.correctiveActions.length > 0,
        hint: "Linked actions in Action Management",
      },
      {
        id: "open",
        label: "Open actions acknowledged",
        ok: openActions === 0 || event.status === "approved",
        hint:
          openActions > 0
            ? `${openActions} action(s) still open — can approve with tracking`
            : "All linked actions closed or verified",
      },
    ];
  }, [event]);

  const ready = gates.filter((g) => g.id !== "open").every((g) => g.ok);

  async function run(
    label: string,
    action: () => Promise<unknown>,
    syncInvestigation?: string,
  ) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      if (syncInvestigation) {
        try {
          await updateInvestigation(event.id, {
            status: syncInvestigation,
            executiveSummary: notes.trim() || undefined,
          } as never);
        } catch {
          /* optional */
        }
      }
      setMessage(`${label} succeeded.`);
      onUpdate();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : `Could not ${label}.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="vs-panel space-y-4 p-4">
        <div>
          <p className="vs-eyebrow">Final review readiness</p>
          <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
            Supervisor / HSE sign-off gate — aligned with Intelex and ISN
            investigation closure workflows.
          </p>
        </div>

        <ul className="space-y-2">
          {gates.map((g) => (
            <li
              key={g.id}
              className="flex items-start gap-3 rounded border px-3 py-2"
              style={{ borderColor: VS_COLORS.border }}
            >
              <span
                className="mt-0.5 text-sm font-bold"
                style={{ color: g.ok ? VS_COLORS.emerald : VS_COLORS.orange }}
              >
                {g.ok ? "✓" : "!"}
              </span>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: VS_COLORS.white }}
                >
                  {g.label}
                </p>
                <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
                  {g.hint}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-1">
          <label
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: VS_COLORS.muted }}
          >
            Review / closure notes
          </label>
          <textarea
            className="min-h-[96px] w-full rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Summary of findings, residual risk, and lessons for the organization…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {event.status === "draft" ? (
            <Button
              type="button"
              size="sm"
              disabled={busy || !ready}
              onClick={() =>
                void run("Submit for review", () => submitPmIncident(event.id), "review")
              }
            >
              Submit for review
            </Button>
          ) : null}

          {event.status === "submitted" ||
          event.status === "review_required" ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={busy || !ready}
                onClick={() =>
                  void run(
                    "Approve",
                    () => approvePmIncident(event.id, notes.trim() || undefined),
                    "review",
                  )
                }
              >
                Approve investigation
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void run("Request changes", () =>
                    reviewPmIncident(
                      event.id,
                      "request_changes",
                      notes.trim() || undefined,
                    ),
                  )
                }
              >
                Request changes
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void run("Reject", () =>
                    reviewPmIncident(
                      event.id,
                      "reject",
                      notes.trim() || undefined,
                    ),
                  )
                }
              >
                Reject
              </Button>
            </>
          ) : null}

          {event.status === "approved" || event.status === "locked" ? (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() =>
                void run("Close", () => closePmIncident(event.id), "closed")
              }
            >
              Close incident
            </Button>
          ) : null}

          {event.status === "closed" ? (
            <span
              className="rounded px-3 py-1.5 text-xs font-semibold"
              style={{
                background: VS_COLORS.emerald,
                color: VS_COLORS.navy,
              }}
            >
              Closed
            </span>
          ) : null}
        </div>

        {message ? (
          <p className="text-xs" style={{ color: VS_COLORS.muted }}>
            {message}
          </p>
        ) : null}
        {!ready ? (
          <p className="text-xs" style={{ color: VS_COLORS.orange }}>
            Complete information, evidence, root cause, and at least one
            corrective action before approval.
          </p>
        ) : null}
      </div>

      <InvestigationReportView eventId={event.id} />
    </div>
  );
}
