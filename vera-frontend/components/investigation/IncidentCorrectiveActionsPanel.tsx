"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createPmCorrectiveAction,
  type PmCorrectiveAction,
} from "@/lib/pm-corrective-actions";
import type { PmSafetyEvent } from "@/lib/pm-incidents";
import { Button } from "@/components/ui/button";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  event: PmSafetyEvent;
  query: string;
  onUpdate: () => void;
};

export function IncidentCorrectiveActionsPanel({
  event,
  query,
  onUpdate,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkRootCauseId, setLinkRootCauseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [created, setCreated] = useState<PmCorrectiveAction | null>(null);

  const actionsHref = `/pm/action-management${query}`;

  async function createLinkedAction() {
    if (!title.trim()) {
      setMessage("Action title is required.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const row = await createPmCorrectiveAction({
        companyId: event.companyId,
        projectId: event.projectId,
        sourceModule: "incident",
        sourceId: event.id,
        title: title.trim(),
        description: [
          description.trim(),
          linkRootCauseId
            ? `Linked root cause: ${
                event.rootCauses.find((r) => r.id === linkRootCauseId)
                  ?.description ?? linkRootCauseId
              }`
            : "",
          `Incident: ${event.title} (${event.id})`,
        ]
          .filter(Boolean)
          .join("\n\n"),
        actionType: "corrective",
        severity: event.severity,
      });
      setCreated(row);
      setTitle("");
      setDescription("");
      setMessage(
        "Action created in Action Management and linked to this incident.",
      );
      onUpdate();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not create corrective action.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="vs-panel space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="vs-eyebrow">Corrective & preventive actions</p>
            <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
              Actions generated from root causes appear here. Create additional
              actions or open Action Management to assign owners, due dates, and
              verification.
            </p>
          </div>
          <Link
            href={actionsHref}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
          >
            Open Action Management →
          </Link>
        </div>

        {event.correctiveActions.length ? (
          <ul className="divide-y" style={{ borderColor: VS_COLORS.border }}>
            {event.correctiveActions.map((c) => {
              const href = c.unifiedCorrectiveActionId
                ? `${actionsHref}${actionsHref.includes("?") ? "&" : "?"}actionId=${c.unifiedCorrectiveActionId}`
                : actionsHref;
              const linkedRc = event.rootCauses.find(
                (r) => r.id === c.rootCauseId,
              );
              return (
                <li
                  key={c.id}
                  className="flex flex-wrap items-start justify-between gap-2 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: VS_COLORS.white }}
                    >
                      {c.title}
                    </p>
                    {linkedRc ? (
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: VS_COLORS.muted }}
                      >
                        From RCA ({linkedRc.method}): {linkedRc.description}
                      </p>
                    ) : null}
                    {c.dueAt ? (
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: VS_COLORS.orange }}
                      >
                        Due {new Date(c.dueAt).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{
                        background: VS_COLORS.slate,
                        color: VS_COLORS.emerald,
                        border: `1px solid ${VS_COLORS.border}`,
                      }}
                    >
                      {c.status}
                    </span>
                    <Link
                      href={href}
                      className="text-xs font-semibold"
                      style={{ color: VS_COLORS.blue }}
                    >
                      Track →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm" style={{ color: VS_COLORS.muted }}>
            No actions yet. Add a root cause to auto-generate, or create one
            below.
          </p>
        )}
      </div>

      <div className="vs-panel space-y-3 p-4">
        <p className="vs-eyebrow">Add linked action</p>
        <input
          className="w-full rounded border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          placeholder="Action title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="min-h-[80px] w-full rounded border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          placeholder="Description / effectiveness expectation…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {event.rootCauses.length ? (
          <select
            className="w-full max-w-md rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            value={linkRootCauseId}
            onChange={(e) => setLinkRootCauseId(e.target.value)}
          >
            <option value="">— Link to root cause (optional) —</option>
            {event.rootCauses.map((rc) => (
              <option key={rc.id} value={rc.id}>
                [{rc.method}] {rc.description.slice(0, 80)}
              </option>
            ))}
          </select>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            disabled={busy || !title.trim()}
            onClick={() => void createLinkedAction()}
          >
            {busy ? "Creating…" : "Create in Action Management"}
          </Button>
          {created ? (
            <Link
              href={`/pm/corrective-actions/${created.id}${query}`}
              className="text-xs font-semibold"
              style={{ color: VS_COLORS.emerald }}
            >
              Open new action →
            </Link>
          ) : null}
          {message ? (
            <p className="text-xs" style={{ color: VS_COLORS.muted }}>
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
