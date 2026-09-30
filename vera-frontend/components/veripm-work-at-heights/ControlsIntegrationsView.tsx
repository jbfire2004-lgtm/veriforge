"use client";

import Link from "next/link";
import { q } from "@/lib/veripm-work-at-heights/types";

const LINKS = [
  {
    title: "Fall protection focus audits",
    href: (qs: string) =>
      `/pm/inspections/focus-audits?${qs}&focus=fall-protection`,
    body: "Photo-first focus audits for fall protection & work at height.",
  },
  {
    title: "Scaffolding audits",
    href: (qs: string) =>
      `/pm/inspections/focus-audits?${qs}&focus=scaffolding`,
    body: "Scaffold and access system focus audits.",
  },
  {
    title: "Emergency response — fall scenario",
    href: (qs: string) => `/pm/emergency-response?${qs}&scenario=fall`,
    body: "ERP generator and fall rescue scenario planning.",
  },
  {
    title: "JHA / FLHA",
    href: (qs: string) => `/pm/jha-flha?${qs}`,
    body: "Job hazard analysis including work-at-height templates.",
  },
  {
    title: "Permits",
    href: (qs: string) => `/pm/permits?${qs}`,
    body: "Work permits that may accompany elevated work.",
  },
  {
    title: "Training",
    href: (qs: string) => `/pm/training?${qs}`,
    body: "Fall-protection competency and training records.",
  },
  {
    title: "Safety program ingestion",
    href: (qs: string) => `/pm/safety-program-ingest?${qs}`,
    body: "Paste IFU / policy text → schema extract → confirm into drafts (including fall equipment).",
  },
];

export function ControlsIntegrationsView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const qs = q(companyId, projectId);
  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <Link
        href={`/pm/work-at-heights?${qs}`}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Work at Heights
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Controls & integrations
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Deep links into existing VeriPM controls. Clearance worksheets remain
          user-owned and separate from these workflows.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((link) => (
          <Link
            key={link.title}
            href={link.href(qs)}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-400"
          >
            <h2 className="font-semibold text-slate-900">{link.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{link.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
