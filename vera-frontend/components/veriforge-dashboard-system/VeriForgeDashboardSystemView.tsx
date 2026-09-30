"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchAnalyticsRevision,
  fetchMetricCatalog,
} from "@/lib/dashboard-analytics/api";
import { listContractorScores } from "@/lib/contractor-safety-score";

const SURFACES = [
  {
    title: "VeriSuite Intelligence",
    href: "/hub/verisuite-intelligence",
    domain: "Industry · Regional · AI",
    scopes: "Global→City · dual plane · Hub/PM/Field/Core",
  },
  {
    title: "VERICore Dashboard",
    href: "/core/dashboard",
    domain: "Safety / SMS",
    scopes: "Company · Project · Contractor · Worker",
  },
  {
    title: "VERIPM Dashboard",
    href: "/pm/dashboard",
    domain: "Maintenance / Assets",
    scopes: "Company · Project · Contractor · Asset",
  },
  {
    title: "Contractor Safety Scores",
    href: "/core/contractor-scores",
    domain: "ISNetworld-style CSS",
    scopes: "Contractor (± project)",
  },
  {
    title: "FieldOS Permit Tasks",
    href: "/field/permits",
    domain: "Field execution",
    scopes: "VERIPM permits · live FieldOS sync",
  },
  {
    title: "Industry Safety (VISI)",
    href: "/hub/industry-safety",
    domain: "Benchmarks",
    scopes: "Company vs industry cohorts",
  },
];

export function VeriForgeDashboardSystemView() {
  const [revision, setRevision] = useState<number | null>(null);
  const [catalogCount, setCatalogCount] = useState(0);
  const [cssCount, setCssCount] = useState(0);

  useEffect(() => {
    void fetchAnalyticsRevision()
      .then((r) => setRevision(r.revision))
      .catch(() => undefined);
    void fetchMetricCatalog()
      .then((c) => setCatalogCount(c.items.length))
      .catch(() => undefined);
    void listContractorScores()
      .then((c) => setCssCount(c.items.length))
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-[#5A6169]/25 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
          VeriForge Dashboard System
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2A2E33]">
          Unified analytics command center
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[#5a6b7c]">
          VERICore, VERIPM, Contractor Scoring, industry comparison, multi-entity linking, reactive
          events, and universal drill-down — one system across company, project, contractor, asset,
          and worker scopes.
        </p>
        <p className="mt-2 text-xs text-[#8A9199]">
          Analytics revision {revision ?? "—"} · {catalogCount} catalog metrics · {cssCount}{" "}
          contractor scores
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SURFACES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-[3px] border border-[#5A6169]/40 bg-white p-5 transition hover:border-[#1E6FB8]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
              {s.domain}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#2A2E33]">{s.title}</h2>
            <p className="mt-2 text-sm text-[#5a6b7c]">{s.scopes}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-[3px] border border-[#5A6169]/40 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#2A2E33]">
          Shared engine
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[#5a6b7c]">
          <li>
            <strong className="text-[#2A2E33]">Metric model</strong> — metricId, domain, scope,
            value, trend, industry percentile, formula, sourceQuery
          </li>
          <li>
            <strong className="text-[#2A2E33]">Industry</strong> — construction sector bands +
            percentile approximation (VISI-ready)
          </li>
          <li>
            <strong className="text-[#2A2E33]">Events</strong> —{" "}
            <code className="text-xs">/api/v1/dashboard-analytics/events</code> bumps revision;
            Core/PM/CSS listen via rebuild
          </li>
          <li>
            <strong className="text-[#2A2E33]">Universal drill</strong> —{" "}
            <code className="text-xs">/api/v1/dashboard-analytics/drill</code> routes to Core, PM, or
            CSS evidence
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/core/dashboard"
            className="inline-flex h-9 items-center rounded-[3px] border border-[#5A6169] px-3 text-sm font-medium text-[#2A2E33] hover:border-[#1E6FB8]"
          >
            Open VERICore
          </Link>
          <Link
            href="/pm/dashboard"
            className="inline-flex h-9 items-center rounded-[3px] bg-[#1E6FB8] px-3 text-sm font-medium text-white hover:bg-[#174F86]"
          >
            Open VERIPM
          </Link>
          <Link
            href="/core/contractor-scores"
            className="inline-flex h-9 items-center rounded-[3px] border border-[#5A6169] px-3 text-sm font-medium text-[#2A2E33] hover:border-[#1E6FB8]"
          >
            Contractor scores
          </Link>
        </div>
      </section>
    </div>
  );
}
