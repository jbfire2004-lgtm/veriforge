"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type {
  EmergencyHubDashboard,
  ErpDrillAccountabilityStatus,
  ErpDrillRosterPerson,
  ErpScenario,
} from "@/lib/veripm-emergency-hub";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";
import {
  ErpScenarioCards,
  InsightStrip,
  KpiTile,
  RiskGauge,
  SmsCoreIntegrationGrid,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { smsCoreSiblingIntegrations } from "@/lib/sms-core-integrations";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";

const SCENARIOS: ErpScenario[] = [
  "electrical",
  "fall",
  "trench",
  "chemical",
  "rollover",
  "general",
];

const AGENCY_COLOR: Record<string, string> = {
  fire: VS_COLORS.critical,
  ambulance: VS_COLORS.orange,
  police: VS_COLORS.blue,
  hospital: VS_COLORS.emerald,
  rescue: VS_COLORS.muted,
};

const SOURCE_SHORT: Record<string, string> = {
  site_gate_log: "Gate",
  daily_site_log: "Site log",
  toolbox_meeting: "Toolbox",
  flha_sign_in: "FLHA",
};

function summarizeRoster(roster: ErpDrillRosterPerson[]) {
  const tracked = roster.filter((p) => p.requiresTracking);
  const accounted = tracked.filter((p) => p.status === "accounted").length;
  const missing = tracked.filter((p) => p.status === "missing").length;
  const excused = tracked.filter((p) => p.status === "excused").length;
  const expected = tracked.length;
  const resolved = accounted + missing + excused;
  return {
    expectedHeadcount: expected,
    accountedCount: accounted,
    missingCount: missing,
    excusedCount: excused,
    completenessPct:
      expected === 0 ? 100 : Math.round((resolved / expected) * 100),
  };
}

function statusTone(status: ErpDrillAccountabilityStatus) {
  if (status === "accounted") return VS_COLORS.emerald;
  if (status === "missing") return VS_COLORS.critical;
  if (status === "excused") return VS_COLORS.orange;
  return VS_COLORS.muted;
}

export function VeriPmEmergencyHubView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const plane = resolveVeriPmPlane(role);
  const [workType, setWorkType] = useState("General construction");
  const [region, setRegion] = useState("CA-AB");
  const [projectScope, setProjectScope] = useState("Active construction site");
  const [scenario, setScenario] = useState<ErpScenario>("fall");
  const [hazards, setHazards] = useState("Fall from height|Struck-by|Energy isolation");
  const [generateToken, setGenerateToken] = useState("0");
  const [draftWorkType, setDraftWorkType] = useState(workType);
  const [draftRegion, setDraftRegion] = useState(region);
  const [draftProjectScope, setDraftProjectScope] = useState(projectScope);
  const [draftScenario, setDraftScenario] = useState(scenario);
  const [draftHazards, setDraftHazards] = useState(hazards);
  const [generateFlash, setGenerateFlash] = useState<string | null>(null);
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillRoster, setDrillRoster] = useState<ErpDrillRosterPerson[] | null>(
    null,
  );
  const [drillStartedAt, setDrillStartedAt] = useState<string | null>(null);
  const [trackEveryone, setTrackEveryone] = useState(true);
  const [selectedEmsIds, setSelectedEmsIds] = useState<string[] | null>(null);
  const [planEmsIds, setPlanEmsIds] = useState<string[] | null>(null);
  const [emsRefreshFlash, setEmsRefreshFlash] = useState<string | null>(null);

  const url = useMemo(() => {
    const q = new URLSearchParams({
      projectId: String(projectId),
      companyId: String(companyId),
      plane,
      workType,
      region,
      projectScope,
      scenario,
      hazards,
      generateToken,
    });
    if (role) q.set("role", role);
    if (planEmsIds?.length) q.set("includeEms", planEmsIds.join("|"));
    return `/api/v1/veripm-emergency-hub?${q}`;
  }, [
    projectId,
    companyId,
    plane,
    workType,
    region,
    projectScope,
    scenario,
    hazards,
    generateToken,
    planEmsIds,
    role,
  ]);

  const { data: dash, loading, error, fromCache } =
    useCachedAggregate<EmergencyHubDashboard>(url);

  useEffect(() => {
    if (!dash) return;
    setDraftWorkType(dash.generator.workType);
    setDraftRegion(dash.generator.region);
    setDraftProjectScope(dash.generator.projectScope);
    setDraftScenario(dash.generator.scenario);
    setDraftHazards(dash.generator.hazards.join("|"));
    if (selectedEmsIds === null && dash.emsContacts.length) {
      setSelectedEmsIds(dash.emsContacts.map((c) => c.id));
    }
  }, [dash?.revision]);

  const activeEmsIds = selectedEmsIds ?? dash?.emsContacts.map((c) => c.id) ?? [];

  const chips = dash
    ? [
        {
          id: "q",
          label: "ERP quality",
          value: String(dash.quality.overall),
          tone:
            dash.quality.overall >= 80
              ? ("positive" as const)
              : ("caution" as const),
        },
        {
          id: "sc",
          label: "Scenario",
          value: dash.erp.scenario,
          tone: "info" as const,
        },
        {
          id: "ems",
          label: "EMS contacts",
          value: String(dash.emsContacts.length),
          tone: "neutral" as const,
        },
        {
          id: "drill",
          label: "Drill readiness",
          value: `${dash.quality.drillReadiness}%`,
          tone: "caution" as const,
        },
      ]
    : [];

  const liveRoster = useMemo(() => {
    if (!drillRoster) return null;
    if (trackEveryone) {
      return drillRoster.map((p) => ({ ...p, requiresTracking: true }));
    }
    return drillRoster;
  }, [drillRoster, trackEveryone]);

  const drillStats = liveRoster ? summarizeRoster(liveRoster) : null;

  function handleGenerateErp() {
    const emsIds =
      selectedEmsIds ?? dash?.emsContacts.map((c) => c.id) ?? [];
    setWorkType(draftWorkType);
    setRegion(draftRegion);
    setProjectScope(draftProjectScope);
    setScenario(draftScenario);
    setHazards(draftHazards);
    setPlanEmsIds(emsIds);
    setGenerateToken(String(Date.now()));
    setGenerateFlash(
      emsIds.length
        ? `ERP generated with ${emsIds.length} EMS contacts plugged in.`
        : "ERP generated from current parameters.",
    );
    setTimeout(() => setGenerateFlash(null), 4000);
  }

  function handleRefreshEms() {
    setRegion(draftRegion);
    setScenario(draftScenario);
    setEmsRefreshFlash(`EMS lookup refreshed for ${draftRegion} · ${draftScenario}.`);
    setTimeout(() => setEmsRefreshFlash(null), 3500);
  }

  function toggleEmsForPlan(id: string) {
    setSelectedEmsIds((prev) => {
      const base = prev ?? dash?.emsContacts.map((c) => c.id) ?? [];
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    });
  }

  function selectAllEms() {
    if (!dash) return;
    setSelectedEmsIds(dash.emsContacts.map((c) => c.id));
  }

  function handleStartDrill() {
    if (!dash) return;
    setDrillRoster(
      dash.drill.roster.map((p) => ({
        ...p,
        status: "expected" as const,
      })),
    );
    setDrillStartedAt(new Date().toISOString());
    setDrillOpen(true);
    setTrackEveryone(dash.drill.accountabilityRequired);
  }

  function setPersonStatus(id: string, status: ErpDrillAccountabilityStatus) {
    setDrillRoster((prev) =>
      prev
        ? prev.map((p) => (p.id === id ? { ...p, status } : p))
        : prev,
    );
  }

  function markAllAccounted() {
    setDrillRoster((prev) =>
      prev
        ? prev.map((p) =>
            p.requiresTracking || trackEveryone
              ? { ...p, status: "accounted" as const }
              : p,
          )
        : prev,
    );
  }

  function closeDrill() {
    setDrillOpen(false);
  }

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Emergency Response"
      title="AI Emergency Response Plans"
      description="Generate scenario ERPs with local EMS contacts plugged into Call EMS steps — run drills, or find EMS immediately in an emergency."
      meta={
        dash
          ? `${dash.scopeLabel} · rev ${dash.revision}${fromCache ? " · cached" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
            onClick={handleGenerateErp}
          >
            Generate ERP
          </button>
          <Link
            href={`/pm/emergency-response/generator?projectId=${projectId}&companyId=${companyId}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
          >
            Full ERP generator
          </Link>
          <Link
            href={`/pm/emergency-response/drill?projectId=${projectId}&companyId=${companyId}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.orange,
              color: VS_COLORS.navy,
            }}
          >
            Run ERP drill
          </Link>
          <Link
            href={`/pm/emergency-response/quick?projectId=${projectId}&companyId=${companyId}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.critical,
              color: VS_COLORS.white,
            }}
          >
            Find in emergency
          </Link>
          {generateFlash ? (
            <span className="text-xs font-medium" style={{ color: VS_COLORS.emerald }}>
              {generateFlash}
            </span>
          ) : null}
          {emsRefreshFlash ? (
            <span className="text-xs font-medium" style={{ color: VS_COLORS.blue }}>
              {emsRefreshFlash}
            </span>
          ) : null}
          {drillOpen && drillStats ? (
            <span className="text-xs" style={{ color: VS_COLORS.muted }}>
              Drill active · {drillStats.completenessPct}% tracked
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={draftWorkType}
            onChange={(e) => setDraftWorkType(e.target.value)}
            className="rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Work type"
          />
          <select
            value={draftRegion}
            onChange={(e) => setDraftRegion(e.target.value)}
            className="rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          >
            <option value="CA-AB">Alberta</option>
            <option value="CA-BC">British Columbia</option>
            <option value="US-TX">Texas</option>
            <option value="US-NV">Nevada</option>
          </select>
          <input
            value={draftProjectScope}
            onChange={(e) => setDraftProjectScope(e.target.value)}
            className="min-w-[160px] rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Project scope"
          />
          <select
            value={draftScenario}
            onChange={(e) => setDraftScenario(e.target.value as ErpScenario)}
            className="rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          >
            {SCENARIOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            value={draftHazards}
            onChange={(e) => setDraftHazards(e.target.value)}
            className="min-w-[200px] flex-1 rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Hazards (pipe-separated)"
          />
        </div>
        <p className="mt-2 text-[11px]" style={{ color: VS_COLORS.muted }}>
          Set parameters, select contacts in Local EMS lookup, then Generate ERP to plug them into Call EMS steps. Use Find in emergency for immediate lookup.
        </p>
      </VsSection>

      {error ? (
        <p className="text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {loading && !dash ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded" />
          ))}
        </div>
      ) : null}

      {dash ? (
        <>
          <InsightStrip chips={chips} cachedHint={fromCache} />

          <VsSection band="kpi" label="ERP quality dashboard">
            <KpiTile
              label="ERP quality score"
              value={dash.quality.overall}
              unit="/100"
              tone={dash.quality.overall >= 80 ? "positive" : "caution"}
            />
            <KpiTile
              label="Scenario coverage"
              value={dash.quality.coverage}
              unit="%"
              tone="info"
            />
            <KpiTile
              label="Contact currency"
              value={dash.quality.contactCurrency}
              unit="%"
              tone="positive"
            />
            <KpiTile
              label="Drill readiness"
              value={dash.quality.drillReadiness}
              unit="%"
              tone="caution"
            />
          </VsSection>

          <VsSection band="detail" label="Local EMS lookup — plug into ERP">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.white,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
                onClick={handleRefreshEms}
              >
                Refresh EMS for region
              </button>
              <button
                type="button"
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.white,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
                onClick={selectAllEms}
              >
                Select all for ERP
              </button>
              <span className="text-xs" style={{ color: VS_COLORS.muted }}>
                {activeEmsIds.length} selected · included when you Generate ERP
              </span>
            </div>
            <div className="vs-panel overflow-x-auto p-0">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr style={{ color: VS_COLORS.muted }}>
                    <th className="p-3 font-medium">In ERP</th>
                    <th className="p-3 font-medium">Agency</th>
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Phone</th>
                    <th className="p-3 font-medium">Distance</th>
                    <th className="p-3 font-medium">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.emsContacts.map((c) => {
                    const inPlan = activeEmsIds.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={inPlan}
                            onChange={() => toggleEmsForPlan(c.id)}
                            aria-label={`Include ${c.name} in ERP`}
                          />
                        </td>
                        <td className="p-3">
                          <span
                            className="text-xs font-semibold uppercase"
                            style={{ color: AGENCY_COLOR[c.agency] }}
                          >
                            {c.agency}
                          </span>
                        </td>
                        <td className="p-3" style={{ color: VS_COLORS.white }}>
                          {c.name}
                          <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
                            {c.address}
                          </p>
                        </td>
                        <td className="p-3">
                          <a
                            href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                            className="tabular-nums font-semibold"
                            style={{ color: VS_COLORS.blue }}
                          >
                            {c.phone}
                          </a>
                        </td>
                        <td className="p-3 tabular-nums" style={{ color: VS_COLORS.muted }}>
                          {c.distanceKm} km
                        </td>
                        <td className="p-3 tabular-nums" style={{ color: VS_COLORS.muted }}>
                          {c.etaMinutes} min
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </VsSection>

          {drillOpen && liveRoster && drillStats ? (
            <VsSection band="detail" label="ERP drill — accountability">
              <div className="space-y-4">
                <div className="vs-panel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="vs-eyebrow">Active drill</p>
                      <h3
                        className="mt-1 text-base font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {dash.drill.title}
                      </h3>
                      <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                        Muster: {dash.drill.musterPoint}
                        {drillStartedAt
                          ? ` · Started ${new Date(drillStartedAt).toLocaleTimeString()}`
                          : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded px-3 py-1.5 text-xs font-semibold"
                        style={{
                          background: VS_COLORS.emerald,
                          color: VS_COLORS.navy,
                        }}
                        onClick={markAllAccounted}
                      >
                        Mark all accounted
                      </button>
                      <button
                        type="button"
                        className="rounded px-3 py-1.5 text-xs font-semibold"
                        style={{
                          background: VS_COLORS.slate,
                          color: VS_COLORS.white,
                          border: `1px solid ${VS_COLORS.border}`,
                        }}
                        onClick={closeDrill}
                      >
                        Close drill panel
                      </button>
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-xs" style={{ color: VS_COLORS.white }}>
                    <input
                      type="checkbox"
                      checked={trackEveryone}
                      onChange={(e) => setTrackEveryone(e.target.checked)}
                    />
                    Track everyone when required (include visitors & non-crew)
                  </label>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <KpiTile
                      label="Expected"
                      value={drillStats.expectedHeadcount}
                      tone="info"
                    />
                    <KpiTile
                      label="Accounted"
                      value={drillStats.accountedCount}
                      tone="positive"
                    />
                    <KpiTile
                      label="Missing"
                      value={drillStats.missingCount}
                      tone={drillStats.missingCount > 0 ? "critical" : "neutral"}
                    />
                    <KpiTile
                      label="Completeness"
                      value={drillStats.completenessPct}
                      unit="%"
                      tone={
                        drillStats.completenessPct >= 100 ? "positive" : "caution"
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {dash.drill.sources.map((s) => (
                    <Link
                      key={s.source}
                      href={s.href}
                      className="vs-panel block p-4"
                    >
                      <p
                        className="text-[10px] font-semibold uppercase"
                        style={{ color: VS_COLORS.muted }}
                      >
                        {s.signedInCount} signed in
                      </p>
                      <p
                        className="mt-1 text-sm font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {s.label}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                        {s.detail}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="vs-panel overflow-x-auto p-0">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr style={{ color: VS_COLORS.muted }}>
                        <th className="p-3 font-medium">Person</th>
                        <th className="p-3 font-medium">Crew / role</th>
                        <th className="p-3 font-medium">Sign-in sources</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveRoster.map((p) => (
                        <tr
                          key={p.id}
                          style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                        >
                          <td className="p-3" style={{ color: VS_COLORS.white }}>
                            {p.name}
                            <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
                              {p.company}
                              {!p.requiresTracking ? " · optional" : null}
                            </p>
                          </td>
                          <td className="p-3" style={{ color: VS_COLORS.muted }}>
                            {p.crew} · {p.role}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {p.signInSources.map((src) => (
                                <span
                                  key={src}
                                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                                  style={{
                                    background: VS_COLORS.slate,
                                    color: VS_COLORS.blue,
                                    border: `1px solid ${VS_COLORS.border}`,
                                  }}
                                >
                                  {SOURCE_SHORT[src] ?? src}
                                </span>
                              ))}
                            </div>
                            <p className="mt-1 text-[11px]" style={{ color: VS_COLORS.muted }}>
                              {p.lastSignInLabel}
                            </p>
                          </td>
                          <td
                            className="p-3 text-xs font-semibold uppercase"
                            style={{ color: statusTone(p.status) }}
                          >
                            {p.status}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(
                                [
                                  "accounted",
                                  "missing",
                                  "excused",
                                  "expected",
                                ] as ErpDrillAccountabilityStatus[]
                              ).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  className="rounded px-2 py-1 text-[10px] font-semibold capitalize"
                                  style={{
                                    background:
                                      p.status === st
                                        ? statusTone(st)
                                        : VS_COLORS.slate,
                                    color:
                                      p.status === st
                                        ? VS_COLORS.navy
                                        : VS_COLORS.muted,
                                    border: `1px solid ${VS_COLORS.border}`,
                                  }}
                                  onClick={() => setPersonStatus(p.id, st)}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="space-y-1 text-xs" style={{ color: VS_COLORS.muted }}>
                  {dash.drill.guidance.map((g) => (
                    <li key={g}>· {g}</li>
                  ))}
                </ul>
              </div>
            </VsSection>
          ) : null}

          <VsSection band="detail" label="AI-generated ERP">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="vs-panel p-4">
                <p className="vs-eyebrow">Generated plan</p>
                <h3
                  className="mt-1 text-base font-semibold"
                  style={{ color: VS_COLORS.white }}
                >
                  {dash.erp.title}
                </h3>
                <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                  {dash.erp.region} · {dash.erp.projectScope} · Muster:{" "}
                  {dash.erp.musterPoint}
                </p>
                <p className="mt-2 text-xs" style={{ color: VS_COLORS.blue }}>
                  Hazards: {dash.erp.hazards.join(" · ")}
                </p>
                {dash.erp.emsContacts.length ? (
                  <div
                    className="mt-3 rounded p-3"
                    style={{
                      background: VS_COLORS.slate,
                      border: `1px solid ${VS_COLORS.border}`,
                    }}
                  >
                    <p className="vs-eyebrow">EMS plugged into this plan</p>
                    <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                      {dash.erp.emsCallScript}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {dash.erp.emsContacts.map((c) => (
                        <li key={c.id} className="text-xs" style={{ color: VS_COLORS.white }}>
                          <span
                            className="font-semibold uppercase"
                            style={{ color: AGENCY_COLOR[c.agency] }}
                          >
                            {c.agency}
                          </span>
                          {" · "}
                          {c.name}{" "}
                          <a
                            href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                            style={{ color: VS_COLORS.blue }}
                          >
                            {c.phone}
                          </a>
                          {" · "}
                          ETA {c.etaMinutes}m
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <ol className="mt-4 list-decimal space-y-3 pl-4">
                  {dash.erp.steps.map((s) => (
                    <li key={s.order}>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {s.title}
                      </p>
                      <p className="text-xs" style={{ color: VS_COLORS.muted }}>
                        {s.detail}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-3">
                <RiskGauge
                  label="ERP quality"
                  score={dash.erp.qualityScore}
                />
                <div className="vs-panel p-4 text-xs" style={{ color: VS_COLORS.muted }}>
                  <p className="vs-eyebrow">Quality notes</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {dash.erp.qualityNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                  <Link
                    href={dash.erp.meetingTopicHref}
                    className="mt-3 inline-block text-xs font-semibold"
                    style={{ color: VS_COLORS.blue }}
                  >
                    Auto-link safety meeting topic →
                  </Link>
                </div>
              </div>
            </div>
          </VsSection>

          <VsSection band="detail" label="ERP simulation mode">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">{dash.simulation.title}</p>
              <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                Outcome score {dash.simulation.outcomeScore}/100 — AI walks the timeline
                against expected actions.
              </p>
              <ol className="mt-4 space-y-3">
                {dash.simulation.timeline.map((t) => (
                  <li
                    key={t.minute}
                    className="grid gap-1 border-l-2 pl-3 sm:grid-cols-[64px_1fr]"
                    style={{ borderColor: VS_COLORS.blue }}
                  >
                    <span
                      className="text-xs font-semibold tabular-nums"
                      style={{ color: VS_COLORS.blue }}
                    >
                      T+{t.minute}m
                    </span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: VS_COLORS.white }}>
                        {t.event}
                      </p>
                      <p className="text-xs" style={{ color: VS_COLORS.muted }}>
                        Expected: {t.expectedAction}
                      </p>
                      <p className="text-[11px]" style={{ color: VS_COLORS.emerald }}>
                        Pass: {t.passCriteria}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </VsSection>

          <VsSection band="detail" label="ERP compliance checker">
            <div className="grid gap-3 md:grid-cols-2">
              {dash.compliance.map((c) => (
                <div
                  key={c.id}
                  className="vs-panel p-4"
                  style={{
                    borderLeft: `3px solid ${
                      c.status === "met"
                        ? VS_COLORS.emerald
                        : c.status === "partial"
                          ? VS_COLORS.orange
                          : VS_COLORS.critical
                    }`,
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase"
                    style={{ color: VS_COLORS.muted }}
                  >
                    {c.source} · {c.status}
                  </p>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: VS_COLORS.white }}
                  >
                    {c.requirement}
                  </p>
                  <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
                    {c.detail}
                  </p>
                </div>
              ))}
            </div>
          </VsSection>

          <VsSection band="detail" label="Scenario-based ERP library">
            <ErpScenarioCards
              title="ERP scenarios"
              items={dash.scenarioLibrary.map((s) => ({
                id: s.scenario,
                title: s.title,
                scenario: s.scenario,
                qualityScore: s.qualityScore,
                status: draftScenario === s.scenario ? "active" : "draft",
                selected: draftScenario === s.scenario,
              }))}
              onSelect={(id) => setDraftScenario(id as ErpScenario)}
            />
          </VsSection>

          <VsSection band="narrative" label="SMS Core federation">
            <SmsCoreIntegrationGrid
              title="SMS Core federation"
              description="Emergency / ERP shares muster, drills, and scenarios with SMS Core, Projects, FieldOS, SIF/HECA, and Safety Hub."
              items={smsCoreSiblingIntegrations("erp", {
                companyId,
                projectId,
              })}
            />
            <div className="vs-panel mt-4 space-y-2 p-4 text-xs">
              <p className="vs-eyebrow">Operational deep links</p>
              <Link href={dash.links.jhaFlha} style={{ color: VS_COLORS.blue }} className="block">
                JHA / FLHA →
              </Link>
              <Link href={dash.links.siteAccess} style={{ color: VS_COLORS.blue }} className="block">
                Site access / logs →
              </Link>
              <Link href={dash.links.meetings} style={{ color: VS_COLORS.blue }} className="block">
                Safety meetings / toolbox →
              </Link>
              <Link href={dash.links.inspections} style={{ color: VS_COLORS.blue }} className="block">
                Inspections →
              </Link>
              <Link href={dash.links.incidents} style={{ color: VS_COLORS.blue }} className="block">
                Incidents →
              </Link>
              <Link href={dash.links.actions} style={{ color: VS_COLORS.blue }} className="block">
                Action Management →
              </Link>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <SmsAiIntegrationPanel
                page="emergency"
                companyId={companyId}
                projectId={projectId}
                title="AI insights"
                fallbackInsights={dash.insights}
                defaultAcceptAction="persist_erp"
              />
              <SmsInteractionFlowPanel
                page="emergency"
                companyId={companyId}
                projectId={projectId}
                title="ERP simulation flow"
                showCrossLinks={false}
              />
            </div>
          </VsSection>

          <VeriPmAiIntelligencePanel
            page="emergency"
            projectId={projectId}
            companyId={companyId}
            plane={plane}
          />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
