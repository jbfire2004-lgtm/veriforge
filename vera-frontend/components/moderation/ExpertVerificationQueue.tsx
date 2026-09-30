"use client";

import type { ExpertVerificationRequest } from "@vera/api-contract";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { adminReviewExpertVerification } from "@/lib/moderation/api";
import { buttonStyles } from "@/components/ui";

type Props = { initial: ExpertVerificationRequest[] };

export function ExpertVerificationQueue({ initial }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return <p className="text-sm text-vera-muted">No pending expert applications.</p>;
  }

  return (
    <ul className="space-y-vera-4">
      {items.map((req) => (
        <li
          key={req.id}
          className="rounded-lg border border-vera-border bg-vera-surface p-vera-4 text-sm space-y-vera-3"
        >
          <div>
            <p className="font-medium">{req.displayName}</p>
            <p className="text-vera-muted">
              {req.trade ?? "Trade not specified"}
              {req.headline ? ` · ${req.headline}` : ""}
            </p>
            <p className="text-xs text-vera-muted mt-vera-1">
              Submitted {new Date(req.submittedAt).toLocaleString()}
            </p>
          </div>
          {req.statement ? (
            <p className="whitespace-pre-wrap text-vera-deep">{req.statement}</p>
          ) : null}
          {req.tradeEvidence ? (
            <p className="text-vera-muted">
              <span className="font-medium">Evidence:</span> {req.tradeEvidence}
            </p>
          ) : null}
          <div className="flex gap-vera-2">
            <button
              type="button"
              disabled={pending}
              className={buttonStyles({ variant: "primary", size: "sm" })}
              onClick={() =>
                startTransition(async () => {
                  if (!session) return;
                  await adminReviewExpertVerification(session, req.id, {
                    status: "APPROVED",
                  });
                  setItems((prev) => prev.filter((r) => r.id !== req.id));
                })
              }
            >
              Approve expert
            </button>
            <button
              type="button"
              disabled={pending}
              className={buttonStyles({ variant: "outline", size: "sm" })}
              onClick={() =>
                startTransition(async () => {
                  if (!session) return;
                  await adminReviewExpertVerification(session, req.id, {
                    status: "REJECTED",
                    reviewNote: "Does not meet verification criteria",
                  });
                  setItems((prev) => prev.filter((r) => r.id !== req.id));
                })
              }
            >
              Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
