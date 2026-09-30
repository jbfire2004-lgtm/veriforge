"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { reportPost, reportUser } from "@/lib/moderation/api";
import { buttonStyles } from "@/components/ui";

const REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "OFF_TOPIC", label: "Off topic" },
  { value: "IMPERSONATION", label: "Impersonation" },
  { value: "SAFETY_RISK", label: "Safety risk" },
  { value: "OTHER", label: "Other" },
] as const;

type PostTarget = {
  kind: "post";
  targetType: string;
  targetId: string;
  label: string;
};

type UserTarget = {
  kind: "user";
  userId: number;
  label: string;
};

type Props = {
  target: PostTarget | UserTarget;
  triggerClassName?: string;
};

export function ReportDialog({ target, triggerClassName }: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!session) return;
    startTransition(async () => {
      setError(null);
      try {
        if (target.kind === "post") {
          await reportPost(session, {
            targetType: target.targetType,
            targetId: target.targetId,
            reason,
            details: details || undefined,
          });
        } else {
          await reportUser(session, {
            userId: target.userId,
            reason,
            details: details || undefined,
          });
        }
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not submit report");
      }
    });
  }

  if (!session) return null;

  return (
    <>
      <button
        type="button"
        className={triggerClassName ?? buttonStyles({ variant: "ghost", size: "sm" })}
        onClick={() => {
          setOpen(true);
          setDone(false);
          setError(null);
        }}
      >
        Report
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-vera-border bg-vera-surface p-vera-5 shadow-xl"
            role="dialog"
            aria-labelledby="report-title"
          >
            <h2 id="report-title" className="text-base font-semibold">
              Report {target.kind === "user" ? "user" : "content"}
            </h2>
            <p className="mt-vera-1 text-sm text-vera-muted line-clamp-2">{target.label}</p>
            {done ? (
              <p className="mt-vera-4 text-sm text-vera-teal">
                Thank you. Our moderation team will review this report.
              </p>
            ) : (
              <div className="mt-vera-4 space-y-vera-3">
                <label className="block text-sm">
                  Reason
                  <select
                    className="mt-vera-1 w-full rounded-md border border-vera-border bg-transparent px-vera-2 py-vera-2 text-sm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  Details (optional)
                  <textarea
                    className="mt-vera-1 w-full rounded-md border border-vera-border bg-transparent px-vera-2 py-vera-2 text-sm min-h-[80px]"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </label>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <div className="flex gap-vera-2 justify-end">
                  <button
                    type="button"
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                    onClick={submit}
                  >
                    Submit report
                  </button>
                </div>
              </div>
            )}
            {done ? (
              <button
                type="button"
                className={`${buttonStyles({ variant: "primary", size: "sm" })} mt-vera-4 w-full`}
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
