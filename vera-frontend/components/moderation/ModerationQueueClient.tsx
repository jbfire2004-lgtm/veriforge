"use client";

import type { ModerationCase } from "@vera/api-contract";
import { useSession } from "next-auth/react";
import { useCallback, useState, useTransition } from "react";
import { adminResolveCase } from "@/lib/moderation/api";
import { buttonStyles } from "@/components/ui";

const RESOLUTIONS = [
  "NO_ACTION",
  "CONTENT_HIDDEN",
  "USER_WARNED",
  "USER_SUSPENDED",
] as const;

type Props = { initial: ModerationCase[] };

export function ModerationQueueClient({ initial }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();

  const resolve = useCallback(
    (caseId: string, status: string, resolution?: string) => {
      if (!session) return;
      startTransition(async () => {
        await adminResolveCase(session, caseId, { status, resolution });
        setItems((prev) => prev.filter((c) => c.id !== caseId));
      });
    },
    [session],
  );

  if (items.length === 0) {
    return <p className="text-sm text-vera-muted">Queue is empty.</p>;
  }

  return (
    <ul className="space-y-vera-3">
      {items.map((c) => (
        <li
          key={c.id}
          className="rounded-lg border border-vera-border bg-vera-surface p-vera-4 text-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-vera-2">
            <div>
              <p className="font-medium">
                {c.source === "AUTO_RULE" ? "Auto-flag" : "User report"} · {c.targetType}
              </p>
              <p className="text-vera-muted mt-vera-1">
                {c.targetSummary ?? c.targetId}
              </p>
              {c.reportReason ? (
                <p className="mt-vera-1">
                  Reason: {c.reportReason}
                  {c.reporterName ? ` · by ${c.reporterName}` : ""}
                </p>
              ) : null}
              {c.autoRuleName ? (
                <p className="text-xs text-vera-muted mt-vera-1">Rule: {c.autoRuleName}</p>
              ) : null}
              <p className="text-xs text-vera-muted mt-vera-1">
                Priority {c.priority} · {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col gap-vera-1 shrink-0">
              <button
                type="button"
                disabled={pending}
                className={buttonStyles({ variant: "outline", size: "sm" })}
                onClick={() => resolve(c.id, "DISMISSED", "NO_ACTION")}
              >
                Dismiss
              </button>
              <button
                type="button"
                disabled={pending}
                className={buttonStyles({ variant: "primary", size: "sm" })}
                onClick={() => resolve(c.id, "RESOLVED", "CONTENT_HIDDEN")}
              >
                Hide content
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
