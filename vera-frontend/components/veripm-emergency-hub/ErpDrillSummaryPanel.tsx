"use client";

import { useRef } from "react";
import type { ErpDrillSummaryReport } from "@/lib/erp-drill";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Props = {
  report: ErpDrillSummaryReport;
};

function Chip({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm"
      style={{
        borderColor: alert ? "#f87171" : "var(--sf-border)",
        background: alert ? "rgba(248,113,113,0.08)" : "transparent",
      }}
    >
      <span className="block text-[11px] uppercase tracking-wide text-[var(--sf-text-muted)]">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/** Printable auto-generated ERP drill summary. */
export function ErpDrillSummaryPanel({ report }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const node = printRef.current;
    if (!node) return;
    const win = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=900,height=1100",
    );
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${report.title}</title>
      <style>
        body { font-family: "Segoe UI", system-ui, sans-serif; color: #0f172a; padding: 24px; line-height: 1.45; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        h2 { font-size: 14px; margin: 20px 0 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
        .meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0 20px; }
        .chip { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 12px; }
        .chip strong { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; }
        ul { margin: 6px 0 0; padding-left: 18px; }
        li { margin: 2px 0; font-size: 13px; }
        p { font-size: 13px; white-space: pre-wrap; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
        th { background: #f8fafc; }
        @media print { body { padding: 0; } }
      </style></head><body>${node.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <SfCard className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">Drill summary report</h2>
          <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
            Auto-generated from checklist timestamps, attendance, and
            issues/observations.
          </p>
        </div>
        <SfButton type="button" variant="secondary" onClick={handlePrint}>
          Print / save PDF
        </SfButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Chip label="Score" value={`${report.scores.overall}/100`} alert={report.scores.overall < 70} />
        <Chip label="Required checklist" value={`${report.scores.requiredChecklistPct}%`} />
        <Chip label="Attendance" value={`${report.scores.attendancePct}%`} alert={report.attendance.missing > 0} />
        <Chip label="Duration" value={`${report.durationMinutes} min`} />
      </div>

      <div ref={printRef}>
        <h1>{report.title}</h1>
        <p className="meta">
          {report.drillTypeLabel} · {report.projectName} · Facilitator{" "}
          {report.facilitator}
          <br />
          Started {new Date(report.startedAt).toLocaleString()} · Ended{" "}
          {new Date(report.endedAt).toLocaleString()} · Muster:{" "}
          {report.musterPoint}
        </p>

        <div className="summary">
          <div className="chip">
            <strong>Overall</strong>
            {report.scores.overall}/100
          </div>
          <div className="chip">
            <strong>Checklist</strong>
            {report.scores.checklistPct}%
          </div>
          <div className="chip">
            <strong>Attendance</strong>
            {report.attendance.accounted}/{report.attendance.expected} accounted
            {report.attendance.missing > 0
              ? ` · ${report.attendance.missing} missing`
              : ""}
          </div>
        </div>

        <p>{report.narrative}</p>

        <h2>Findings</h2>
        <ul>
          {report.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <h2>Recommendations</h2>
        <ul>
          {report.recommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>

        <h2>Checklist timestamps</h2>
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Status</th>
              <th>Completed</th>
              <th>Latency</th>
            </tr>
          </thead>
          <tbody>
            {report.checklist.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.label}
                  {c.required ? " *" : ""}
                </td>
                <td>{c.done ? "Done" : "Open"}</td>
                <td>
                  {c.completedAt
                    ? new Date(c.completedAt).toLocaleTimeString()
                    : "—"}
                </td>
                <td>
                  {c.latencySec != null ? `${c.latencySec}s` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Attendance</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Crew</th>
              <th>Status</th>
              <th>Marked</th>
            </tr>
          </thead>
          <tbody>
            {report.attendance.people.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.role}</td>
                <td>{p.crew}</td>
                <td>{p.status}</td>
                <td>
                  {p.markedAt
                    ? new Date(p.markedAt).toLocaleTimeString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {report.issues.length > 0 ? (
          <>
            <h2>Issues &amp; observations</h2>
            <ul>
              {report.issues.map((i) => (
                <li key={i.id}>
                  [{i.severity}] {i.text}
                  {i.requiresAction ? " (action required)" : ""} —{" "}
                  {new Date(i.at).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {report.timeline.length > 0 ? (
          <>
            <h2>Timeline</h2>
            <ul>
              {report.timeline.map((e) => (
                <li key={e.id}>
                  {new Date(e.at).toLocaleTimeString()} — {e.label}
                  {e.detail ? `: ${e.detail}` : ""}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </SfCard>
  );
}
