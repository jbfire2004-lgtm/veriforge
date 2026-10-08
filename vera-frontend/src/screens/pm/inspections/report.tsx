"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPmInspectionReport, updatePmInspectionSharing, type PmInspectionReport } from "@/lib/pm-inspections";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { PmPageShell } from "@/src/components/pm/layout";
import { AuditInspectionCapaEnginePanel } from "@/src/components/pm/AuditInspectionCapaEnginePanel";

export default function PmInspectionReportPage({
  id,
  projectId = 1,
  companyId = 1,
}: {
  id: string;
  projectId?: number;
  companyId?: number;
}) {
  const { session, authLoading, authenticated, tokenReady, sessionExpired } =
    usePmInspectionScope(companyId, projectId);
  const [report, setReport] = useState<PmInspectionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);

  const reload = () => {
    if (!tokenReady) return;
    void fetchPmInspectionReport(id, { session })
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : "Report unavailable"));
  };

  useEffect(() => {
    reload();
  }, [id, tokenReady, session?.accessToken]);

  function printReport() {
    if (typeof window !== "undefined") window.print();
  }

  if (error) {
    return (
      <PmPageShell
        title="Inspection report"
        description={error}
        auth={{
          authLoading,
          authenticated,
          tokenReady,
          sessionExpired,
        }}
      >
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      </PmPageShell>
    );
  }

  if (!report) {
    return (
      <PmPageShell title="Inspection report" description="Generating report…">
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      </PmPageShell>
    );
  }

  return (
    <PmPageShell
      title={report.title}
      description={`${report.template.name} · ${report.project.name}`}
      actions={
        <SfButton type="button" variant="secondary" onClick={printReport}>
          Print / PDF
        </SfButton>
      }
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load report.",
      }}
    >
      <div className="print-report space-y-8">
        <SfCard className="p-5 print:border-0 print:shadow-none">
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs uppercase text-[var(--sf-text-muted)]">Status</p>
              <p className="font-medium">{report.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--sf-text-muted)]">Photos</p>
              <p className="font-medium">
                {report.totals?.photoCount ?? 0} total · {report.totals?.safeCount ?? 0} safe ·{" "}
                <span className="text-red-600">{report.totals?.atRiskCount ?? 0} at risk</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--sf-text-muted)]">Generated</p>
              <p className="font-medium">
                {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </SfCard>

        <SfCard className="p-5 print:hidden">
          <h2 className="mb-2 font-medium">Report access</h2>
          <p className="mb-3 text-sm text-[var(--sf-text-muted)]">
            Project owner controls who can view this completed report.
          </p>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={report.sharing?.shareReportWithContractors ?? false}
                disabled={shareBusy}
                onChange={(e) => {
                  setShareBusy(true);
                  void updatePmInspectionSharing(id, {
                    shareReportWithContractors: e.target.checked,
                  }, { session })
                    .then(() => reload())
                    .finally(() => setShareBusy(false));
                }}
              />
              Share report with all contractors on this project
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={report.sharing?.shareReportWithWorkers ?? false}
                disabled={shareBusy}
                onChange={(e) => {
                  setShareBusy(true);
                  void updatePmInspectionSharing(id, {
                    shareReportWithWorkers: e.target.checked,
                  }, { session })
                    .then(() => reload())
                    .finally(() => setShareBusy(false));
                }}
              />
              Share report with workers assigned to this project
            </label>
          </div>
        </SfCard>

        <AuditInspectionCapaEnginePanel inspectionId={id} />

        <section className="break-before-page">
          <h2 className="mb-4 text-xl font-semibold">Summary sheet</h2>
          <p className="mb-4 text-sm text-[var(--sf-text-muted)]">
            One-page overview — reference numbers match photo pages below.
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-[var(--sf-text-muted)]">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Responsible company</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(report.summarySheet ?? []).map((row) => (
                  <tr key={row.photoNumber}>
                    <td className="px-3 py-2 font-semibold">{row.photoNumber}</td>
                    <td className="px-3 py-2">{row.locationDescription || "—"}</td>
                    <td className="px-3 py-2">{row.pictureDescription || row.findingTitle || "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          row.safetyStatus === "at_risk"
                            ? "font-medium text-red-700"
                            : "text-green-700"
                        }
                      >
                        {row.safetyStatus === "at_risk" ? "At risk" : "Safe"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {row.safetyStatus === "at_risk"
                        ? row.responsibleCompanyName ?? "Unassigned"
                        : "—"}
                    </td>
                  </tr>
                ))}
                {!report.summarySheet?.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-[var(--sf-text-muted)]">
                      No photos on this inspection.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Photo report</h2>
          <ul className="space-y-8">
            {(report.photos ?? []).map((photo) => (
              <li key={photo.attachmentId} className="break-inside-avoid rounded-lg border p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sf-primary)] text-lg font-bold text-white">
                    {photo.photoNumber}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      photo.safetyStatus === "at_risk"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {photo.safetyStatus === "at_risk" ? "At risk" : "Safe"}
                  </span>
                </div>
                {photo.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${photo.photoNumber}`}
                    className="mb-4 max-h-80 w-full rounded-lg border object-contain"
                  />
                ) : null}
                {photo.correctionPhotoDataUrl ? (
                  <div className="mb-4">
                    <p className="mb-1 text-xs font-medium text-green-700">Correction photo</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.correctionPhotoDataUrl}
                      alt={`Correction for photo ${photo.photoNumber}`}
                      className="max-h-64 w-full rounded-lg border border-green-200 object-contain"
                    />
                  </div>
                ) : null}
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase text-[var(--sf-text-muted)]">Location</dt>
                    <dd>{photo.locationDescription || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[var(--sf-text-muted)]">
                      Responsible company
                    </dt>
                    <dd>
                      {photo.safetyStatus === "at_risk"
                        ? photo.responsibleCompanyName ?? "Unassigned"
                        : "—"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase text-[var(--sf-text-muted)]">Description</dt>
                    <dd>{photo.pictureDescription || "—"}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PmPageShell>
  );
}
