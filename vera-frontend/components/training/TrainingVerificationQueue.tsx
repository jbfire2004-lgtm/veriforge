"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  approveValidation,
  rejectValidation,
  getValidationResults,
} from "@/lib/api/training-standards";
import { buttonStyles, Card, CardContent, Badge } from "@/components/ui";

type QueueItem = {
  id: number;
  outcome: string;
  trainingRecord?: {
    id: number;
    worker?: { firstName: string; lastName: string };
    certification?: { name: string };
    ingestionRun?: {
      coreFile?: { publicUrl: string | null; originalName: string } | null;
    } | null;
  } | null;
};

export function TrainingVerificationQueue({
  initialItems,
  companyId,
}: {
  initialItems: QueueItem[];
  companyId: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const refresh = useCallback(async () => {
    const rows = (await getValidationResults({
      outcome: "PENDING",
      limit: 50,
    })) as QueueItem[];
    setItems(rows);
  }, []);

  async function onApprove(id: number) {
    setBusy(id);
    try {
      await approveValidation(id);
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  async function onReject(id: number) {
    setBusy(id);
    try {
      await rejectValidation(id, ["DOCUMENT_UNREADABLE"]);
    } finally {
      setBusy(null);
    }
  }

  async function bulkApprove() {
    for (const id of selected) {
      await approveValidation(id);
    }
    setSelected(new Set());
    await refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonStyles({ variant: "teal" })}
          disabled={selected.size === 0}
          onClick={bulkApprove}
        >
          Bulk approve ({selected.size})
        </button>
        <Link
          href={`/admin/training/dashboard?companyId=${companyId}`}
          className={buttonStyles({ variant: "outline" })}
        >
          Back to dashboard
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending verifications.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const rec = item.trainingRecord;
            const worker = rec?.worker;
            const fileUrl = rec?.ingestionRun?.coreFile?.publicUrl;
            return (
              <li key={item.id}>
                <Card>
                  <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(item.id);
                            else next.delete(item.id);
                            setSelected(next);
                          }}
                        />
                        <span className="font-medium">
                          Validation #{item.id}
                        </span>
                        <Badge variant="warning">{item.outcome}</Badge>
                      </div>
                      {worker && (
                        <p className="text-sm">
                          {worker.firstName} {worker.lastName}
                          {rec?.certification?.name
                            ? ` · ${rec.certification.name}`
                            : ""}
                        </p>
                      )}
                      {rec?.id && (
                        <Link
                          href={`/admin/training/${rec.id}`}
                          className="text-sm text-teal-700 underline"
                        >
                          View training record
                        </Link>
                      )}
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm text-teal-700 underline"
                        >
                          Open uploaded document
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy === item.id}
                        className={buttonStyles({ variant: "teal", size: "sm" })}
                        onClick={() => onApprove(item.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busy === item.id}
                        className={buttonStyles({ variant: "outline", size: "sm" })}
                        onClick={() => onReject(item.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
