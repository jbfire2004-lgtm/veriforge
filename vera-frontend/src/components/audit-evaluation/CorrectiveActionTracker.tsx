"use client";

import { Button } from "@/components/ui";
import {
  updateCorrectiveAction,
  type CorrectiveAction,
} from "@/lib/audit-evaluation-api";

export function CorrectiveActionTracker({
  actions,
  onChanged,
}: {
  actions: CorrectiveAction[];
  onChanged?: () => void;
}) {
  async function setStatus(
    id: string,
    status: CorrectiveAction["status"],
  ) {
    await updateCorrectiveAction(id, { status });
    onChanged?.();
  }

  return (
    <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
      {actions.map((a) => (
        <li
          key={a.id}
          className="flex flex-wrap items-center justify-between gap-2 px-3 py-3"
        >
          <div>
            <div className="font-medium">{a.title}</div>
            <div className="text-xs text-zinc-500">
              {a.status.replace(/_/g, " ")}
              {a.ownerName ? ` · ${a.ownerName}` : ""}
              {a.dueDate
                ? ` · due ${new Date(a.dueDate).toLocaleDateString()}`
                : ""}
              {a.audit?.title ? ` · ${a.audit.title}` : ""}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {a.status !== "completed" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void setStatus(a.id, "in_progress")}
              >
                In progress
              </Button>
            ) : null}
            {a.status !== "completed" ? (
              <Button
                type="button"
                size="sm"
                onClick={() => void setStatus(a.id, "completed")}
              >
                Complete
              </Button>
            ) : null}
            {a.status !== "waived" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void setStatus(a.id, "waived")}
              >
                Waive
              </Button>
            ) : null}
          </div>
        </li>
      ))}
      {!actions.length ? (
        <li className="px-3 py-4 text-zinc-500">No corrective actions.</li>
      ) : null}
    </ul>
  );
}
