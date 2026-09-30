"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, FileCheck, Search } from "lucide-react";
import { TrainingRecordVerificationView } from "./TrainingRecordVerificationView";
import {
  fetchCoreTrainingRuns,
  fetchCoreVerificationQueue,
} from "@/lib/core/vera-core-platform";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Tab = "lookup" | "queue" | "runs";

export function CoreVerificationHub() {
  const [tab, setTab] = useState<Tab>("lookup");
  const [companyId, setCompanyId] = useState("1");
  const [queue, setQueue] = useState<unknown[]>([]);
  const [runs, setRuns] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQueue = useCallback(async () => {
    const cid = Number(companyId);
    if (!Number.isFinite(cid)) return;
    setLoading(true);
    try {
      const [q, r] = await Promise.all([
        fetchCoreVerificationQueue(cid),
        fetchCoreTrainingRuns(cid),
      ]);
      setQueue(q);
      setRuns(r);
    } catch {
      setQueue([]);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (tab === "queue" || tab === "runs") void loadQueue();
  }, [tab, loadQueue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: "lookup" as const, label: "Record lookup", icon: Search },
            { id: "queue" as const, label: "Verification queue", icon: FileCheck },
            { id: "runs" as const, label: "Ingestion runs", icon: ClipboardList },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === id
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === "lookup" ? (
        <TrainingRecordVerificationView />
      ) : (
        <>
          <div className="flex items-end gap-3">
            <div>
              <label htmlFor="verify-company" className="text-xs font-medium text-slate-600">
                Company ID
              </label>
              <Input
                id="verify-company"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="mt-1 w-28"
              />
            </div>
            <Button type="button" onClick={() => void loadQueue()} disabled={loading}>
              Refresh
            </Button>
          </div>

          {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}

          {tab === "queue" ? (
            <QueueList items={queue} />
          ) : (
            <RunsList items={runs} />
          )}
        </>
      )}
    </div>
  );
}

function QueueList({ items }: { items: unknown[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Verification queue is empty.</p>;
  }
  return (
    <ul className="divide-y rounded-xl border border-slate-200 bg-white">
      {items.map((item, i) => {
        const row = item as Record<string, unknown>;
        const record = row.trainingRecord as Record<string, unknown> | undefined;
        const worker = record?.worker as { firstName?: string; lastName?: string } | undefined;
        return (
          <li key={String(row.id ?? i)} className="px-4 py-3 text-sm">
            <p className="font-medium">
              {worker ? `${worker.firstName} ${worker.lastName}` : "Training record"}
              {record?.id ? ` · Record #${String(record.id)}` : ""}
            </p>
            <p className="text-xs text-slate-500">Pending verification</p>
          </li>
        );
      })}
    </ul>
  );
}

function RunsList({ items }: { items: unknown[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No ingestion runs.{" "}
        <Link href="/core/training-ingest" className="text-teal-700 hover:underline">
          Upload documents
        </Link>
      </p>
    );
  }
  return (
    <ul className="divide-y rounded-xl border border-slate-200 bg-white">
      {items.map((item) => {
        const run = item as Record<string, unknown>;
        return (
          <li key={String(run.id)} className="flex justify-between px-4 py-3 text-sm">
            <span>
              #{String(run.id)} · {String(run.originalFilename ?? "file")}
            </span>
            <span className="text-slate-500">{String(run.status)}</span>
          </li>
        );
      })}
    </ul>
  );
}
