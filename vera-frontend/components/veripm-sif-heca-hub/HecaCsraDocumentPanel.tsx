"use client";

import { useRef } from "react";
import type { CsraAssessment } from "@/lib/sif-heca";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Props = {
  csra: CsraAssessment;
};

/**
 * Printable HECA assessment document produced by CSRA methodology.
 */
export function HecaCsraDocumentPanel({ csra }: Props) {
  const doc = csra.document;
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const node = printRef.current;
    if (!node) return;
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${doc.title}</title>
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
          <h2 className="font-medium">HECA assessment document (CSRA)</h2>
          <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
            Methodology: identify high-energy sources → exposure & proximity →
            Direct vs Alternative controls → SIF potential → missing-control
            recommendations → authorization.
          </p>
        </div>
        <SfButton type="button" variant="secondary" onClick={handlePrint}>
          Print / save PDF
        </SfButton>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="csra-summary"
      >
        <SummaryChip
          label="High energy"
          value={doc.summary.highEnergy ? "Yes" : "No"}
          alert={doc.summary.highEnergy}
        />
        <SummaryChip
          label="SIF potential"
          value={`${doc.summary.sifCategory} (${doc.summary.sifScore})`}
          alert={doc.summary.sifApplies}
        />
        <SummaryChip
          label="Direct / Alternative"
          value={`${doc.summary.directControlCount} / ${doc.summary.alternativeControlCount}`}
        />
        <SummaryChip
          label="Ready for work"
          value={doc.summary.readyForWork ? "Yes" : "Not yet"}
          alert={!doc.summary.readyForWork}
        />
      </div>

      {/* CSRA step strip */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <StepCard
          step="1"
          title="High-energy sources"
          body={
            csra.highEnergySources.length
              ? csra.highEnergySources
                  .map(
                    (e) =>
                      `${e.label}${e.highEnergy ? " (HE)" : ""} · mag ${e.magnitude}`,
                  )
                  .join("; ")
              : "None identified"
          }
        />
        <StepCard
          step="2"
          title="Exposure & proximity"
          body={csra.exposure.narrative}
        />
        <StepCard
          step="3"
          title="Direct vs Alternative"
          body={`${csra.controls.directCount} Direct · ${csra.controls.alternativeCount} Alternative · ${
            csra.controls.adequate ? "adequate" : "gaps"
          }`}
        />
        <StepCard step="4" title="SIF potential" body={csra.sifPotential.narrative} />
        <StepCard
          step="5"
          title="Missing-control recommendations"
          body={
            csra.recommendations.length
              ? `${csra.recommendations.length} recommendation(s) — ${
                  csra.recommendations.filter((r) => r.controlClass === "direct")
                    .length
                } Direct`
              : "No gaps"
          }
        />
        <StepCard
          step="6"
          title="Document"
          body={`${doc.revision} · ${
            doc.summary.supervisorReviewRequired
              ? "Supervisor review required"
              : "Standard authorization"
          }`}
        />
      </div>

      {csra.recommendations.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium">AI / CSRA control recommendations</h3>
          <ul className="mt-2 divide-y rounded-lg border border-[var(--sf-border)]">
            {csra.recommendations.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-2 px-3 py-2.5 text-sm">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    r.controlClass === "direct"
                      ? "bg-orange-100 text-orange-900"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {r.controlClass}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    r.priority === "critical"
                      ? "bg-red-100 text-red-800"
                      : r.priority === "high"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {r.priority}
                </span>
                <div className="min-w-0 flex-1">
                  <p>{r.description}</p>
                  <p className="text-xs text-[var(--sf-text-muted)]">{r.reason}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div
        ref={printRef}
        className="rounded-lg border border-[var(--sf-border)] bg-white p-5 text-[var(--sf-text)]"
      >
        <h1 className="text-lg font-semibold">{doc.title}</h1>
        <p className="meta text-xs text-[var(--sf-text-muted)]">
          {doc.methodology} · {doc.revision} ·{" "}
          {new Date(doc.generatedAt).toLocaleString()}
        </p>
        <div className="summary my-3 grid gap-2 sm:grid-cols-3">
          <div className="chip rounded border border-[var(--sf-border)] p-2 text-xs">
            <strong className="block text-[10px] uppercase text-[var(--sf-text-muted)]">
              SIF
            </strong>
            {doc.summary.sifCategory} ({doc.summary.sifScore})
          </div>
          <div className="chip rounded border border-[var(--sf-border)] p-2 text-xs">
            <strong className="block text-[10px] uppercase text-[var(--sf-text-muted)]">
              High energy
            </strong>
            {doc.summary.highEnergy ? "Yes" : "No"}
          </div>
          <div className="chip rounded border border-[var(--sf-border)] p-2 text-xs">
            <strong className="block text-[10px] uppercase text-[var(--sf-text-muted)]">
              Ready for work
            </strong>
            {doc.summary.readyForWork ? "Yes" : "No"}
          </div>
        </div>
        {doc.sections.map((section) => (
          <section key={section.id} className="mt-4">
            <h2 className="border-b border-[var(--sf-border)] pb-1 text-sm font-semibold">
              {section.title}
            </h2>
            {section.body ? (
              <p className="mt-2 whitespace-pre-wrap text-sm">{section.body}</p>
            ) : null}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </SfCard>
  );
}

function SummaryChip({
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
      className={`rounded-lg border px-3 py-2 ${
        alert
          ? "border-amber-300 bg-amber-50"
          : "border-[var(--sf-border)] bg-[var(--sf-surface)]"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--sf-border)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
        CSRA step {step}
      </p>
      <p className="mt-1 text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-[var(--sf-text-muted)] line-clamp-3">{body}</p>
    </div>
  );
}
