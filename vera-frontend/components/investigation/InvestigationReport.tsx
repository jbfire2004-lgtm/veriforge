"use client";

import { useEffect, useState } from "react";
import { getInvestigationReport, type InvestigationReport } from "@/lib/pm-incidents";
import { CausalTreeDiagram } from "./CausalTreeDiagram";
import { OrientationProgressBar } from "@/components/orientation/OrientationProgressBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { eventId: string };

export function InvestigationReportView({ eventId }: Props) {
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setBusy(true);
    void getInvestigationReport(eventId)
      .then(setReport)
      .finally(() => setBusy(false));
  }

  useEffect(() => {
    load();
  }, [eventId]);

  function printPdf() {
    if (!report?.html) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(report.html);
    win.document.close();
    win.focus();
    win.print();
  }

  if (!report) return <Skeleton className="h-48 w-full rounded-2xl" />;

  const ev = report.event as Record<string, string | number>;
  const closed = report.correctiveActions.filter(
    (c) => c.status === "closed" || c.status === "verified",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#64748b]">Investigation report</p>
          <h2 className="text-xl font-bold text-[#2A2E33]">{String(ev.title ?? "")}</h2>
          <p className="text-sm text-[#64748b]">
            {String(ev.type ?? "").replace(/_/g, " ")} · {String(ev.severity ?? "")} ·{" "}
            {String(ev.project ?? "")}
          </p>
        </div>
        <Button type="button" size="sm" onClick={printPdf} disabled={busy}>
          Print / PDF
        </Button>
      </div>

      <div className="rounded-2xl border border-[#2A2E33]/10 bg-white p-6 space-y-3">
        <h3 className="text-sm font-semibold text-[#2A2E33]">Executive summary</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#5a6b7c]">
          {report.executiveSummary}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Root causes", value: report.rootCauses.length },
          { label: "Corrective actions", value: report.correctiveActions.length },
          { label: "Closed CAPA", value: closed },
          { label: "Attachments", value: report.evidence.attachments },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[#2A2E33]/10 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#2A2E33]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      <OrientationProgressBar
        completed={closed}
        total={report.correctiveActions.length}
        label="CAPA closure"
      />

      <CausalTreeDiagram eventId={eventId} />

      <div className="space-y-2 rounded-2xl border border-[#2A2E33]/10 bg-white p-6">
        <h3 className="text-sm font-semibold text-[#2A2E33]">Root causes</h3>
        {report.rootCauses.length ? (
          <ul className="space-y-2">
            {report.rootCauses.map((rc) => (
              <li key={rc.id} className="flex gap-3 rounded-lg bg-[#f8fafc] px-4 py-3 text-sm">
                <span className="font-mono text-xs text-[#64748b]">{rc.method}</span>
                <span className="text-[#2A2E33]">{rc.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#64748b]">No root causes recorded yet.</p>
        )}
      </div>

      <div className="space-y-2 rounded-2xl border border-[#2A2E33]/10 bg-white p-6">
        <h3 className="text-sm font-semibold text-[#2A2E33]">Corrective actions</h3>
        {report.correctiveActions.length ? (
          <ul className="divide-y divide-[#2A2E33]/10">
            {report.correctiveActions.map((c) => (
              <li key={c.id} className="flex justify-between py-2 text-sm">
                <span className="text-[#2A2E33]">{c.title}</span>
                <span className="capitalize text-[#64748b]">{c.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#64748b]">No corrective actions yet.</p>
        )}
      </div>

      <p className="text-xs text-[#94a3b8]">Generated {new Date(report.generatedAt).toLocaleString()}</p>
    </div>
  );
}
