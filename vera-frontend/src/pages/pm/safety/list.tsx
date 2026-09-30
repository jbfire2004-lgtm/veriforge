"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchPmSafetyWorkflows,
  type PmSafetyWorkflow,
  type PmSafetyWorkflowStatus,
} from "@/lib/pm-safety-workflow";
import { PmSafetyStatusBadge } from "@/src/components/pm/PmSafetyStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUSES: Array<PmSafetyWorkflowStatus | "ALL"> = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "CLOSED",
  "CANCELLED",
];

export default function PmSafetyListPage() {
  const [rows, setRows] = useState<PmSafetyWorkflow[]>([]);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("ALL");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsedCompanyId = useMemo(() => {
    if (!companyId.trim()) return undefined;
    const n = Number(companyId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [companyId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPmSafetyWorkflows({
        companyId: parsedCompanyId,
        status: status === "ALL" ? undefined : status,
      });
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [status, parsedCompanyId]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">PM safety workflows</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/pm/safety-forms" className="text-blue-700 underline">
            Safety forms (25)
          </Link>
          <Link href="/pm/safety/new" className="text-blue-700 underline">
            Legacy workflow
          </Link>
        </nav>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="company-id">Company ID</Label>
          <Input
            id="company-id"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="optional"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </section>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-600">Loading workflows…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-600">
          No workflows found for current filters.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Link href={`/pm/safety/${row.id}`} className="font-medium underline">
                    #{row.id} · {row.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {row.kind.replace(/_/g, " ")}
                  </p>
                </div>
                <PmSafetyStatusBadge status={row.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

