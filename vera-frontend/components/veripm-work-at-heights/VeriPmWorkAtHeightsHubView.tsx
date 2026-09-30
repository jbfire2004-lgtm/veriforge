"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchWahHub } from "@/lib/veripm-work-at-heights/api";
import {
  WAH_DISCLAIMER,
  type WahHubDashboard,
  type WahIndustryId,
  q,
} from "@/lib/veripm-work-at-heights/types";
import { buildWorkAtHeightsHub } from "@/lib/veripm-work-at-heights/build";

const TILES = [
  {
    key: "clearance",
    title: "Clearance worksheet",
    body: "Load manufacturer specs as reference. You build and own the clearance figures.",
  },
  {
    key: "equipment",
    title: "Spec library",
    body: "Manufacturer profiles, manual ingest, and review before use as reference.",
  },
  {
    key: "industries",
    title: "Industry playbooks",
    body: "Construction, mining, nuclear, power, wind, tower/comms, and more.",
  },
  {
    key: "controls",
    title: "Controls & rescue",
    body: "Focus audits, JHA, permits, ERP fall scenario, and training cues.",
  },
  {
    key: "records",
    title: "Saved worksheets",
    body: "User-owned working records for this project — not Vera certifications.",
  },
] as const;

export function VeriPmWorkAtHeightsHubView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [industry, setIndustry] = useState<WahIndustryId>("construction");
  const [hub, setHub] = useState<WahHubDashboard>(() =>
    buildWorkAtHeightsHub({ companyId, projectId, industry: "construction" }),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWahHub({ companyId, projectId, industry })
      .then((data) => {
        if (!cancelled) setHub(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, projectId, industry]);

  const qs = useMemo(() => q(companyId, projectId), [companyId, projectId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          VeriPM · Controls
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Work at Heights</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Spec-assisted clearance worksheets, equipment library, and industry
          playbooks. Vera supplies reference data — competent persons own the
          calculation and work authorization.
        </p>
      </header>

      <div
        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        role="note"
      >
        {hub.disclaimer || WAH_DISCLAIMER}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-slate-700">
          Industry context
          <select
            className="ml-2 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
            value={industry}
            onChange={(e) => setIndustry(e.target.value as WahIndustryId)}
          >
            {hub.playbooks.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        {loading ? (
          <span className="text-xs text-slate-400">Refreshing…</span>
        ) : null}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Saved worksheets", hub.kpis.savedWorksheets],
          ["Records (recent)", hub.kpis.draftOrRecent],
          ["Approved specs", hub.kpis.approvedSpecs],
          ["Pending review", hub.kpis.pendingSpecReview],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {hub.playbook.label} playbook
        </h2>
        <p className="mt-1 text-sm text-slate-600">{hub.playbook.summary}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <PlayList title="Typical systems" items={hub.playbook.typicalSystems} />
          <PlayList title="Control cues" items={hub.playbook.controlCues} />
          <PlayList title="Rescue cues" items={hub.playbook.rescueCues} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.key}
            href={`/pm/work-at-heights/${tile.key}?${qs}${
              tile.key === "clearance" || tile.key === "industries"
                ? `&industry=${industry}`
                : ""
            }`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-400"
          >
            <h3 className="font-semibold text-slate-900">{tile.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{tile.body}</p>
          </Link>
        ))}
      </section>

      {hub.recentWorksheets.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent worksheets
          </h2>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {hub.recentWorksheets.map((w) => (
              <li key={w.id} className="flex justify-between gap-2 py-2">
                <span className="text-slate-700">
                  {w.industry ?? "General"} · {w.acknowledgedBy ?? "—"}
                </span>
                <span className="text-slate-500">
                  {new Date(w.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function PlayList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
