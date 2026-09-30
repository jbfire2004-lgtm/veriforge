"use client";

import { useCallback, useState } from "react";
import { CalendarClock } from "lucide-react";
import {
  analyzeComplianceCalendar,
  type ComplianceCalendarAiResult,
} from "@/lib/compliance-calendar-ai";
import { SfButton } from "@/src/components/safety-forms/ui";

type ComplianceCalendarPanelProps = {
  companyId: number;
  projectId?: number;
};

export function ComplianceCalendarPanel({ companyId, projectId }: ComplianceCalendarPanelProps) {
  const [result, setResult] = useState<ComplianceCalendarAiResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setBusy(true);
    setError(null);
    void analyzeComplianceCalendar(companyId, projectId, 90)
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Calendar analysis failed"))
      .finally(() => setBusy(false));
  }, [companyId, projectId]);

  return (
    <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-blue-900" />
          <h2 className="font-medium text-blue-950">Compliance Calendar</h2>
        </div>
        <SfButton type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void run()}>
          {busy ? "Scanning…" : "Scan compliance calendar"}
        </SfButton>
      </div>

      {error ? <p className="text-xs text-red-700" role="alert">{error}</p> : null}

      {result ? (
        <div className="space-y-3 text-sm">
          <p className="text-xs text-blue-900">{result.field_summary}</p>

          {result.upcoming_expiries.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-blue-800">Upcoming expiries</p>
              <ul className="space-y-1 text-xs">
                {result.upcoming_expiries.slice(0, 6).map((item) => (
                  <li key={`${item.entity_type}-${item.entity_id}`} className="rounded border border-blue-100 bg-white px-2 py-1">
                    <span className="font-medium">{item.label}</span>
                    {" — "}
                    <span className={item.status === "expired" ? "text-red-700" : "text-blue-800"}>
                      {item.status.replace(/_/g, " ")} ({item.expires_at})
                    </span>
                    {item.worker_name ? <span className="text-slate-500"> · {item.worker_name}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.risk_items.filter((r) => r.severity === "critical").length > 0 ? (
            <div className="rounded border border-red-200 bg-red-50 p-2">
              <p className="text-xs font-semibold uppercase text-red-900">Compliance risks</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-red-800">
                {result.risk_items
                  .filter((r) => r.severity === "critical")
                  .map((r) => (
                    <li key={r.risk_code}>{r.description}</li>
                  ))}
              </ul>
            </div>
          ) : null}

          {result.bulk_actions.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-blue-800">Suggested bulk actions</p>
              <ul className="list-disc pl-4 text-xs text-blue-900">
                {result.bulk_actions.slice(0, 4).map((a) => (
                  <li key={a.action}>
                    [{a.priority}] {a.action} — {a.scope}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-xs text-slate-600">
            {result.notifications.length} reminder(s) drafted for workers, supervisors, and project managers.
          </p>
        </div>
      ) : null}
    </div>
  );
}
