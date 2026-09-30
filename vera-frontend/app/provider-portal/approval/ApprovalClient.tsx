"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { buttonStyles } from "@/components/ui/button";

export function ApprovalClient({ providerId }: { providerId: number }) {
  const [data, setData] = useState<{
    provider?: { approvalStatus: string };
    approvals?: { status: string; notes: string | null; createdAt: string }[];
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiGet(`/api/v1/training-providers/providers/${providerId}/approval-status`).then(setData);
  }, [providerId]);

  async function requestApproval() {
    setMessage(null);
    try {
      await apiPost(`/api/v1/training-providers/providers/${providerId}/request-approval`, { notes });
      setMessage("Approval request submitted.");
      const refreshed = await apiGet(`/api/v1/training-providers/providers/${providerId}/approval-status`);
      setData(refreshed);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Current status</p>
        <p className="text-xl font-semibold">{data?.provider?.approvalStatus ?? "—"}</p>
        <button
          type="button"
          className={buttonStyles({ variant: "teal", size: "sm", className: "mt-3" })}
          onClick={requestApproval}
        >
          Request approval review
        </button>
        <textarea
          className="mt-2 w-full rounded border px-3 py-2 text-sm"
          placeholder="Notes for reviewer (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      </div>
      <ul className="divide-y rounded-lg border text-sm">
        {(data?.approvals ?? []).map((a, i) => (
          <li key={i} className="px-4 py-3">
            <strong>{a.status}</strong>
            {a.notes && <p className="text-muted-foreground">{a.notes}</p>}
            <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
