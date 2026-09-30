"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listClearanceWorksheets } from "@/lib/veripm-work-at-heights/api";
import {
  WAH_DISCLAIMER,
  q,
  type WorksheetRecord,
} from "@/lib/veripm-work-at-heights/types";

export function WahRecordsView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const qs = q(companyId, projectId);
  const [rows, setRows] = useState<WorksheetRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listClearanceWorksheets({ companyId, projectId })
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [companyId, projectId]);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <Link
        href={`/pm/work-at-heights?${qs}`}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Work at Heights
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Saved worksheets
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          User-owned working records for this project. Not Vera certifications.
        </p>
      </header>
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {WAH_DISCLAIMER}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Industry</th>
              <th className="px-3 py-2">Acknowledged by</th>
              <th className="px-3 py-2">Your required / available (m)</th>
              <th className="px-3 py-2">Line subtotal</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  No saved worksheets yet.{" "}
                  <Link
                    href={`/pm/work-at-heights/clearance?${qs}`}
                    className="underline"
                  >
                    Open worksheet
                  </Link>
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{r.industry ?? "—"}</td>
                  <td className="px-3 py-2">{r.acknowledgedBy ?? "—"}</td>
                  <td className="px-3 py-2">
                    {r.userRequiredM ?? "—"} / {r.userAvailableM ?? "—"}
                  </td>
                  <td className="px-3 py-2">{r.userLineSubtotalM ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
