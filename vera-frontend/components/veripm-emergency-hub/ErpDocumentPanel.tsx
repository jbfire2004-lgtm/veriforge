"use client";

import { useRef } from "react";
import type { ErpFullDocument } from "@/lib/erp-generator";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Props = {
  document: ErpFullDocument;
};

/** Printable final ERP document. */
export function ErpDocumentPanel({ document: doc }: Props) {
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
          <h2 className="font-medium">Emergency Response Plan document</h2>
          <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
            Auto-populated project data, hazard/readiness signals, provincial OHS
            dangerous-occurrence guidance, and utility routing (e.g. SaskEnergy).
          </p>
        </div>
        <SfButton type="button" variant="secondary" onClick={handlePrint}>
          Print / save PDF
        </SfButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Chip label="Project" value={doc.summary.projectName} />
        <Chip label="Region" value={doc.summary.regionCode} />
        <Chip
          label="Quality"
          value={`${doc.summary.qualityScore}`}
          alert={doc.summary.qualityScore < 70}
        />
        <Chip
          label="Utilities"
          value={String(doc.summary.utilityContactCount)}
          alert={doc.summary.utilityContactCount === 0}
        />
      </div>

      {doc.contactRouting && doc.contactRouting.contacts.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium">Hazard-specific contact routing</h3>
          {doc.contactRouting.summary.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-xs text-[var(--sf-text-muted)]">
              {doc.contactRouting.summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}
          <ul className="mt-2 divide-y rounded-lg border border-[var(--sf-border)]">
            {doc.contactRouting.contacts.map((c) => (
              <li key={c.id} className="px-3 py-2.5 text-sm">
                <span className="font-semibold">{c.name}</span>
                {c.phone ? (
                  <a
                    href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                    className="ml-2 font-mono text-xs font-bold text-red-700"
                  >
                    {c.phone}
                  </a>
                ) : null}
                <p className="mt-0.5 text-xs text-[var(--sf-text-muted)]">
                  {c.reason}
                  {!c.phone ? ` · ${c.dialHint}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {doc.utilityContacts.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium">Utility contact catalog</h3>
          <ul className="mt-2 divide-y rounded-lg border border-[var(--sf-border)]">
            {doc.utilityContacts.map((u) => (
              <li key={u.id} className="px-3 py-2.5 text-sm">
                <span className="font-semibold">{u.name}</span>
                <span className="ml-2 text-xs uppercase text-[var(--sf-text-muted)]">
                  {u.agency}
                </span>
                <p className="mt-0.5 font-mono text-sm">{u.phone}</p>
                <p className="text-xs text-[var(--sf-text-muted)]">{u.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {doc.ohs.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium">
            Provincial OHS — dangerous occurrence
            {doc.summary.ohsFramework
              ? ` (${doc.summary.ohsFramework})`
              : ""}
          </h3>
          {doc.dangerousOccurrenceAssessment?.mustReportAny ? (
            <p className="mt-1 text-xs font-semibold text-amber-800">
              Required reporting indicated —{" "}
              {doc.dangerousOccurrenceAssessment.narrative}
            </p>
          ) : null}
          <ul className="mt-2 space-y-2">
            {doc.ohs.map((o) => (
              <li
                key={o.code}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              >
                <p className="font-medium">
                  {o.mustReport ? "REQUIRED REPORT · " : ""}
                  {o.label}
                  {o.urgency ? (
                    <span className="ml-2 text-[10px] uppercase tracking-wide opacity-80">
                      {o.urgency.replace(/_/g, " ")}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs">{o.guidance}</p>
                {o.authority ? (
                  <p className="mt-1 text-[11px] text-amber-900/80">
                    Authority: {o.authority}
                  </p>
                ) : null}
                {o.requiredActions?.length ? (
                  <ul className="mt-1 list-inside list-disc text-[11px]">
                    {o.requiredActions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          {doc.dangerousOccurrenceAssessment?.disclaimer ? (
            <p className="mt-2 text-[10px] text-[var(--sf-text-muted)]">
              {doc.dangerousOccurrenceAssessment.disclaimer}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        ref={printRef}
        className="rounded-lg border border-[var(--sf-border)] bg-white p-5 text-[var(--sf-text)]"
      >
        <h1 className="text-lg font-semibold">{doc.title}</h1>
        <p className="meta text-xs text-[var(--sf-text-muted)]">
          {doc.documentType} · {doc.revision} ·{" "}
          {new Date(doc.generatedAt).toLocaleString()} ·{" "}
          {doc.project.regionCode}
        </p>
        <div className="summary my-3 grid gap-2 sm:grid-cols-3">
          <div className="chip rounded border border-[var(--sf-border)] p-2 text-xs">
            <strong className="block text-[10px] uppercase text-[var(--sf-text-muted)]">
              Scenario
            </strong>
            {doc.summary.scenario}
          </div>
          <div className="chip rounded border border-[var(--sf-border)] p-2 text-xs">
            <strong className="block text-[10px] uppercase text-[var(--sf-text-muted)]">
              Readiness
            </strong>
            {doc.summary.readinessScore ?? "—"}
          </div>
          <div className="chip rounded border border-[var(--sf-border)] p-2 text-xs">
            <strong className="block text-[10px] uppercase text-[var(--sf-text-muted)]">
              Review
            </strong>
            {doc.summary.supervisorReviewRequired ? "Required" : "Standard"}
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
