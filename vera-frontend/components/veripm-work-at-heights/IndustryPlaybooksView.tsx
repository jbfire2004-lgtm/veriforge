"use client";

import Link from "next/link";
import {
  WAH_INDUSTRY_PLAYBOOKS,
  q,
  type WahIndustryId,
} from "@/lib/veripm-work-at-heights/types";

export function IndustryPlaybooksView({
  projectId = 1,
  companyId = 1,
  industry,
}: {
  projectId?: number;
  companyId?: number;
  industry?: string;
}) {
  const qs = q(companyId, projectId);
  const focus = (industry as WahIndustryId) || undefined;

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
          Industry playbooks
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Operational cues by industry. Playbooks guide controls and rescue
          readiness — they do not change clearance math or authorize work.
        </p>
      </header>
      <div className="space-y-4">
        {WAH_INDUSTRY_PLAYBOOKS.map((p) => (
          <article
            key={p.id}
            id={p.id}
            className={`rounded-lg border bg-white p-4 shadow-sm ${
              focus === p.id ? "border-slate-900" : "border-slate-200"
            }`}
          >
            <h2 className="text-lg font-semibold text-slate-900">{p.label}</h2>
            <p className="mt-1 text-sm text-slate-600">{p.summary}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <List title="Typical systems" items={p.typicalSystems} />
              <List title="Control cues" items={p.controlCues} />
              <List title="Rescue cues" items={p.rescueCues} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/pm/work-at-heights/clearance?${qs}&industry=${p.id}`}
                className="text-sm text-slate-800 underline"
              >
                Open worksheet
              </Link>
              {p.suggestedAuditFocus.map((f) => (
                <Link
                  key={f}
                  href={`/pm/inspections/focus-audits?${qs}&focus=${f}`}
                  className="text-sm text-slate-600 underline"
                >
                  Audit: {f}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase text-slate-500">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-700">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
