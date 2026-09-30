"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { applyToJob } from "@/lib/job-board/api";
import { buttonStyles, Input, Label } from "@/components/ui";

type Props = { jobId: string; jobTitle: string };

export function ApplyButton({ jobId, jobTitle }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <p className="text-sm text-vera-teal">
        Application submitted. Check messages for employer follow-up.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className={buttonStyles({ variant: "primary", size: "md" })}
        onClick={() => {
          if (status === "unauthenticated") {
            router.push(`/auth/login?callbackUrl=${encodeURIComponent("/jobs")}`);
            return;
          }
          setOpen(true);
        }}
      >
        Apply for this role
      </button>
    );
  }

  return (
    <form
      className="space-y-vera-4 rounded-lg border border-vera-border p-vera-4 max-w-lg"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!session) return;
        setLoading(true);
        setError(null);
        try {
          await applyToJob(session, jobId, message || undefined);
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not apply");
        } finally {
          setLoading(false);
        }
      }}
    >
      <p className="text-sm font-medium">Apply: {jobTitle}</p>
      <div className="space-y-vera-1">
        <Label htmlFor="cover">Cover message (optional)</Label>
        <Input
          id="cover"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Brief intro and availability"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-vera-2">
        <button
          type="submit"
          disabled={loading}
          className={buttonStyles({ variant: "primary", size: "sm" })}
        >
          {loading ? "Submitting…" : "Submit application"}
        </button>
        <button
          type="button"
          className={buttonStyles({ variant: "ghost", size: "sm" })}
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
