"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  SmartIncidentLog,
  SmartIncidentLogEntry,
  SmartLogFacetDimension,
} from "@/lib/veripm-incidents-hub";
import {
  AiInsightPanel,
  KpiTile,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

const DIMENSIONS: Array<{ id: SmartLogFacetDimension; label: string }> = [
  { id: "status", label: "Status" },
  { id: "type", label: "Type" },
  { id: "severity", label: "Severity" },
  { id: "rootCause", label: "Root cause" },
  { id: "location", label: "Location" },
  { id: "company", label: "Company" },
  { id: "subcontractor", label: "Subcontractor" },
  { id: "crew", label: "Crew" },
  { id: "investigator", label: "Investigator" },
  { id: "energy", label: "Energy" },
];

function typeLabel(t: string) {
  return t.replace(/_/g, " ");
}

function statusColor(s: string): string {
  if (s === "closed") return VS_COLORS.emerald;
  if (s === "pending_review") return VS_COLORS.orange;
  if (s === "investigating") return VS_COLORS.blue;
  return VS_COLORS.critical;
}

function severityColor(s: string): string {
  if (s === "Fatality") return VS_COLORS.critical;
  if (s === "LT") return VS_COLORS.orange;
  if (s === "MA") return VS_COLORS.blue;
  return VS_COLORS.emerald;
}

function entryMatches(
  e: SmartIncidentLogEntry,
  drills: Partial<Record<SmartLogFacetDimension, string>>,
  query: string,
): boolean {
  for (const [dim, value] of Object.entries(drills) as Array<
    [SmartLogFacetDimension, string]
  >) {
    if (!value) continue;
    if (dim === "type" && e.type !== value) return false;
    if (dim === "severity" && e.severity !== value) return false;
    if (dim === "status" && e.status !== value) return false;
    if (dim === "rootCause" && e.rootCause !== value) return false;
    if (dim === "company" && e.companyName !== value) return false;
    if (dim === "subcontractor" && e.subcontractorName !== value) return false;
    if (dim === "location" && e.location !== value) return false;
    if (dim === "investigator" && e.investigator !== value) return false;
    if (dim === "crew" && e.crew !== value) return false;
    if (dim === "energy" && !e.energyTypes.includes(value)) return false;
  }
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    e.title.toLowerCase().includes(q) ||
    e.rootCause.toLowerCase().includes(q) ||
    e.summary.toLowerCase().includes(q) ||
    e.investigator.toLowerCase().includes(q) ||
    e.location.toLowerCase().includes(q) ||
    e.companyName.toLowerCase().includes(q) ||
    (e.subcontractorName?.toLowerCase().includes(q) ?? false) ||
    e.crew.toLowerCase().includes(q) ||
    e.findings.some((f) => f.toLowerCase().includes(q)) ||
    e.energyTypes.some((en) => en.toLowerCase().includes(q))
  );
}

function DrillDownPanel({
  entry,
  onClose,
  onDrill,
}: {
  entry: SmartIncidentLogEntry;
  onClose: () => void;
  onDrill: (dimension: SmartLogFacetDimension, value: string) => void;
}) {
  return (
    <div
      className="vs-panel fixed inset-4 z-50 overflow-y-auto p-5 md:inset-x-[8%] md:inset-y-6"
      style={{
        background: VS_COLORS.navy,
        border: `1px solid ${VS_COLORS.border}`,
        boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
      }}
      role="dialog"
      aria-labelledby="smart-log-drill-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="vs-eyebrow">Smart incident log · drill-down</p>
          <h2
            id="smart-log-drill-title"
            className="mt-1 text-lg font-semibold"
            style={{ color: VS_COLORS.white }}
          >
            {entry.title}
          </h2>
          <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
            {entry.date} · {typeLabel(entry.type)} · {entry.severity} ·{" "}
            <span style={{ color: statusColor(entry.status) }}>
              {entry.status.replace(/_/g, " ")}
            </span>
            {entry.daysOpen != null ? ` · ${entry.daysOpen}d open` : null}
            {entry.sifPotential ? " · SIF potential" : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={entry.href}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
          >
            Open record
          </Link>
          <button
            type="button"
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="vs-panel space-y-3 p-4 lg:col-span-2">
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: VS_COLORS.muted }}>
              Summary
            </p>
            <p className="mt-1 text-sm" style={{ color: VS_COLORS.white }}>
              {entry.summary}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: VS_COLORS.muted }}>
              Root cause
            </p>
            <button
              type="button"
              className="mt-1 text-left text-sm font-semibold"
              style={{ color: VS_COLORS.blue }}
              onClick={() => onDrill("rootCause", entry.rootCause)}
            >
              {entry.rootCause} → drill log
            </button>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: VS_COLORS.muted }}>
              Findings
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm" style={{ color: VS_COLORS.muted }}>
              {entry.findings.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: VS_COLORS.muted }}>
                Corrective actions
              </p>
              {entry.correctiveActions.length ? (
                <ul className="mt-2 space-y-1 text-xs">
                  {entry.correctiveActions.map((a) => (
                    <li key={a.id}>
                      <Link href={a.href} style={{ color: VS_COLORS.blue }}>
                        {a.title}
                      </Link>
                      <span style={{ color: VS_COLORS.muted }}> · {a.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                  None linked yet
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: VS_COLORS.muted }}>
                Preventive actions
              </p>
              {entry.preventiveActions.length ? (
                <ul className="mt-2 space-y-1 text-xs">
                  {entry.preventiveActions.map((a) => (
                    <li key={a.id}>
                      <Link href={a.href} style={{ color: VS_COLORS.blue }}>
                        {a.title}
                      </Link>
                      <span style={{ color: VS_COLORS.muted }}> · {a.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                  None linked yet
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: VS_COLORS.muted }}>
                Safety meeting topics
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                {entry.relatedMeetingTopics.length ? (
                  entry.relatedMeetingTopics.map((t) => (
                    <li key={t.title}>
                      <Link href={t.href} style={{ color: VS_COLORS.blue }}>
                        {t.title} →
                      </Link>
                    </li>
                  ))
                ) : (
                  <li style={{ color: VS_COLORS.muted }}>None linked</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: VS_COLORS.muted }}>
                Inspection focus
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                {entry.relatedInspectionFocus.length ? (
                  entry.relatedInspectionFocus.map((t) => (
                    <li key={t.title}>
                      <Link href={t.href} style={{ color: VS_COLORS.blue }}>
                        {t.title} →
                      </Link>
                    </li>
                  ))
                ) : (
                  <li style={{ color: VS_COLORS.muted }}>None linked</li>
                )}
              </ul>
            </div>
          </div>
          {entry.relatedFlhaHref ? (
            <p className="text-xs">
              <Link href={entry.relatedFlhaHref} style={{ color: VS_COLORS.blue }}>
                Related FLHA {entry.relatedFlhaId} →
              </Link>
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="vs-panel space-y-2 p-4 text-xs">
            <p className="vs-eyebrow">Scope & context</p>
            {(
              [
                ["Plane", entry.plane, null],
                ["Company", entry.companyName, "company"],
                ["Subcontractor", entry.subcontractorName ?? "—", "subcontractor"],
                ["Project", entry.projectName, null],
                ["Location", entry.location, "location"],
                ["Crew", entry.crew, "crew"],
                ["Work type", entry.workType, null],
                ["Investigator", entry.investigator, "investigator"],
              ] as Array<[string, string, SmartLogFacetDimension | null]>
            ).map(([label, value, dim]) => (
              <div key={label} className="flex justify-between gap-2">
                <span style={{ color: VS_COLORS.muted }}>{label}</span>
                {dim && value !== "—" ? (
                  <button
                    type="button"
                    className="text-right font-semibold"
                    style={{ color: VS_COLORS.blue }}
                    onClick={() => onDrill(dim, value)}
                  >
                    {value} →
                  </button>
                ) : (
                  <span className="text-right" style={{ color: VS_COLORS.white }}>
                    {value}
                  </span>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-1 pt-1">
              {entry.energyTypes.map((en) => (
                <button
                  key={en}
                  type="button"
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: VS_COLORS.slate,
                    color: VS_COLORS.blue,
                    border: `1px solid ${VS_COLORS.border}`,
                  }}
                  onClick={() => onDrill("energy", en)}
                >
                  {en}
                </button>
              ))}
            </div>
            <p style={{ color: VS_COLORS.muted }}>
              Witnesses {entry.witnessCount} · Evidence {entry.evidenceCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmartIncidentLogPanel({ log }: { log: SmartIncidentLog }) {
  const [query, setQuery] = useState("");
  const [drills, setDrills] = useState<
    Partial<Record<SmartLogFacetDimension, string>>
  >({});
  const [facetDim, setFacetDim] = useState<SmartLogFacetDimension>("status");
  const [selected, setSelected] = useState<SmartIncidentLogEntry | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return log.entries.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return entryMatches(e, drills, query.trim());
    });
  }, [log.entries, drills, query, dateFrom, dateTo]);

  const facetOptions = useMemo(() => {
    return log.facets
      .filter((f) => f.dimension === facetDim)
      .map((f) => {
        const count = filtered.filter((e) => {
          if (facetDim === "energy") return e.energyTypes.includes(f.value);
          if (facetDim === "type") return e.type === f.value;
          if (facetDim === "severity") return e.severity === f.value;
          if (facetDim === "status") return e.status === f.value;
          if (facetDim === "rootCause") return e.rootCause === f.value;
          if (facetDim === "company") return e.companyName === f.value;
          if (facetDim === "subcontractor") return e.subcontractorName === f.value;
          if (facetDim === "location") return e.location === f.value;
          if (facetDim === "investigator") return e.investigator === f.value;
          if (facetDim === "crew") return e.crew === f.value;
          return false;
        }).length;
        return { ...f, filteredCount: count };
      })
      .filter((f) => f.filteredCount > 0 || drills[facetDim] === f.value);
  }, [log.facets, facetDim, filtered, drills]);

  const filteredTotals = useMemo(() => {
    const open = filtered.filter((e) => e.status !== "closed").length;
    const nearMiss = filtered.filter((e) => e.type === "near_miss").length;
    const sif = filtered.filter((e) => e.sifPotential).length;
    const overdue = filtered.filter(
      (e) => e.daysOpen != null && e.daysOpen > 14,
    ).length;
    return { open, nearMiss, sif, overdue, all: filtered.length };
  }, [filtered]);

  function setDrill(dimension: SmartLogFacetDimension, value: string) {
    setDrills((prev) => {
      if (prev[dimension] === value) {
        const next = { ...prev };
        delete next[dimension];
        return next;
      }
      return { ...prev, [dimension]: value };
    });
    setFacetDim(dimension);
    setSelected(null);
  }

  function clearDrills() {
    setDrills({});
    setQuery("");
    setDateFrom("");
    setDateTo("");
  }

  const activeDrills = Object.entries(drills) as Array<
    [SmartLogFacetDimension, string]
  >;

  return (
    <>
      <VsSection band="kpi" label={`Smart incident log · ${log.scopeLabel}`}>
        <KpiTile label="In view" value={filteredTotals.all} tone="info" />
        <KpiTile
          label="Open"
          value={filteredTotals.open}
          tone={filteredTotals.open > 0 ? "caution" : "positive"}
        />
        <KpiTile label="Near misses" value={filteredTotals.nearMiss} tone="caution" />
        <KpiTile
          label="SIF potential"
          value={filteredTotals.sif}
          tone={filteredTotals.sif > 0 ? "critical" : "neutral"}
        />
        <KpiTile
          label="Overdue (>14d)"
          value={filteredTotals.overdue}
          tone={filteredTotals.overdue > 0 ? "critical" : "positive"}
        />
      </VsSection>

      <VsSection band="narrative" label="Log intelligence">
        <AiInsightPanel
          title="Patterns in this scope"
          items={log.intelligence.map((ins) => ({
            id: ins.id,
            tone: ins.tone,
            headline: ins.headline,
            body: ins.body,
            confidence: ins.confidence,
          }))}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {log.intelligence
            .filter((i) => i.drillDimension && i.drillValue)
            .map((i) => (
              <button
                key={`drill-${i.id}`}
                type="button"
                className="rounded px-2 py-1 text-[11px] font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.blue,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
                onClick={() =>
                  setDrill(i.drillDimension!, i.drillValue!)
                }
              >
                Drill: {i.drillValue}
              </button>
            ))}
        </div>
      </VsSection>

      <VsSection band="controls" label="Search & drill-down facets">
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Search title, cause, location, crew, findings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-[220px] flex-1 rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded border bg-transparent px-2 py-2 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            aria-label="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded border bg-transparent px-2 py-2 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            aria-label="To date"
          />
          {activeDrills.length || query || dateFrom || dateTo ? (
            <button
              type="button"
              className="rounded px-3 py-1.5 text-xs font-semibold"
              style={{
                background: VS_COLORS.slate,
                color: VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              onClick={clearDrills}
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {activeDrills.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {activeDrills.map(([dim, value]) => (
              <button
                key={`${dim}:${value}`}
                type="button"
                className="rounded px-2 py-1 text-[11px] font-semibold"
                style={{
                  background: VS_COLORS.blue,
                  color: VS_COLORS.navy,
                }}
                onClick={() => setDrill(dim, value)}
              >
                {dim}: {typeLabel(value)} ×
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1">
          {DIMENSIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              className="rounded px-2 py-1 text-[10px] font-semibold uppercase"
              style={{
                background: facetDim === d.id ? VS_COLORS.blue : VS_COLORS.slate,
                color: facetDim === d.id ? VS_COLORS.navy : VS_COLORS.muted,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              onClick={() => setFacetDim(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {facetOptions.map((f) => {
            const active = drills[facetDim] === f.value;
            return (
              <button
                key={f.id}
                type="button"
                className="rounded px-2.5 py-1.5 text-xs font-semibold"
                style={{
                  background: active ? VS_COLORS.blue : VS_COLORS.panel,
                  color: active ? VS_COLORS.navy : VS_COLORS.white,
                  border: `1px solid ${
                    active ? VS_COLORS.blue : VS_COLORS.border
                  }`,
                }}
                onClick={() => setDrill(facetDim, f.value)}
              >
                {typeLabel(f.value)}{" "}
                <span style={{ opacity: 0.75 }}>({f.filteredCount})</span>
              </button>
            );
          })}
          {facetOptions.length === 0 ? (
            <p className="text-xs" style={{ color: VS_COLORS.muted }}>
              No values for this dimension in the current filter.
            </p>
          ) : null}
        </div>
      </VsSection>

      <VsSection band="detail" label="All incidents in scope">
        <div className="vs-panel overflow-x-auto p-0">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr style={{ color: VS_COLORS.muted }}>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Sev</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Company / Sub</th>
                <th className="p-3 font-medium">Root cause</th>
                <th className="p-3 font-medium">Drill</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                >
                  <td className="p-3 tabular-nums" style={{ color: VS_COLORS.muted }}>
                    {e.date}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      style={{ color: VS_COLORS.white }}
                      onClick={() => setSelected(e)}
                    >
                      {e.title}
                    </button>
                    {e.sifPotential ? (
                      <span
                        className="ml-2 text-[10px] font-semibold uppercase"
                        style={{ color: VS_COLORS.critical }}
                      >
                        SIF
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3" style={{ color: VS_COLORS.muted }}>
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => setDrill("type", e.type)}
                    >
                      {typeLabel(e.type)}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="text-xs font-semibold"
                      style={{ color: severityColor(e.severity) }}
                      onClick={() => setDrill("severity", e.severity)}
                    >
                      {e.severity}
                    </button>
                  </td>
                  <td
                    className="p-3 text-xs font-semibold uppercase"
                    style={{ color: statusColor(e.status) }}
                  >
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => setDrill("status", e.status)}
                    >
                      {e.status.replace(/_/g, " ")}
                    </button>
                  </td>
                  <td className="p-3" style={{ color: VS_COLORS.muted }}>
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => setDrill("location", e.location)}
                    >
                      {e.location}
                    </button>
                  </td>
                  <td className="p-3 text-xs" style={{ color: VS_COLORS.muted }}>
                    <button
                      type="button"
                      className="block hover:underline"
                      onClick={() => setDrill("company", e.companyName)}
                    >
                      {e.companyName}
                    </button>
                    {e.subcontractorName ? (
                      <button
                        type="button"
                        className="block hover:underline"
                        style={{ color: VS_COLORS.blue }}
                        onClick={() =>
                          setDrill("subcontractor", e.subcontractorName!)
                        }
                      >
                        {e.subcontractorName}
                      </button>
                    ) : null}
                  </td>
                  <td
                    className="max-w-[180px] truncate p-3 text-xs"
                    style={{ color: VS_COLORS.muted }}
                    title={e.rootCause}
                  >
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => setDrill("rootCause", e.rootCause)}
                    >
                      {e.rootCause}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="text-xs font-semibold"
                      style={{ color: VS_COLORS.blue }}
                      onClick={() => setSelected(e)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-6 text-center text-sm"
                    style={{ color: VS_COLORS.muted }}
                  >
                    No incidents match this drill-down.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
          Showing {filtered.length} of {log.totals.all} incidents ·{" "}
          {log.scopeLabel} · plane {log.plane}. Click any facet cell to drill
          further; open Details for full aspect breakdown.
        </p>
      </VsSection>

      {selected ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60"
            aria-label="Close drill-down overlay"
            onClick={() => setSelected(null)}
          />
          <DrillDownPanel
            entry={selected}
            onClose={() => setSelected(null)}
            onDrill={(dim, value) => {
              setDrill(dim, value);
              setSelected(null);
            }}
          />
        </>
      ) : null}
    </>
  );
}
