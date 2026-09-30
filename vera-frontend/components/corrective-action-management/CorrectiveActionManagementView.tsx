"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type {
  ActionKind,
  CamDashboard,
  CamSelectors,
  CloseOutStage,
  ManagedAction,
} from "@/lib/corrective-action-management/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ActionAgingHistogram,
  ComparisonPanel,
  InsightStrip,
  KpiTile,
  RootCauseActionFlow,
  VsDashboardShell,
  VsSection,
  VsStatusBadge,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS, type VsTone } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  invalidateClientAggregate,
  useCachedAggregate,
} from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { usePmSmsScope } from "@/hooks/usePmSmsScope";

type Tab = "dashboard" | "workflow" | "suggestions" | "insights";

const INDUSTRIES: CamSelectors["industry"][] = [
  "mining",
  "construction",
  "manufacturing",
  "utilities",
];
const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"];
const OWNERS = ["A. Reyes", "J. Okonkwo", "M. Chen", "S. Patel", "L. Johansson"];
const STAGES: CloseOutStage[] = [
  "assigned",
  "implemented",
  "verified",
  "effectiveness_reviewed",
  "closed",
];

function parseTab(raw: string | null): Tab {
  if (
    raw === "workflow" ||
    raw === "suggestions" ||
    raw === "insights" ||
    raw === "dashboard"
  ) {
    return raw;
  }
  return "dashboard";
}

function fmt(n: number | null | undefined, digits = 1) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

function stageLabel(s: string) {
  return s.replace(/_/g, " ");
}

function statusTone(s: ManagedAction["status"]): VsTone {
  if (s === "overdue") return "critical";
  if (s === "closed") return "positive";
  if (s === "pending_verification" || s === "in_progress" || s === "open")
    return "caution";
  return "neutral";
}

function kindLabel(k: ActionKind) {
  return k === "corrective" ? "Corrective" : "Preventive";
}

export function CorrectiveActionManagementView() {
  const smsScope = usePmSmsScope(1, 1);
  const companyId = smsScope.companyId ?? 1;
  const projectId = smsScope.projectId ?? 1;
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => parseTab(searchParams.get("tab")));
  const [industry, setIndustry] =
    useState<CamSelectors["industry"]>("construction");
  const [period, setPeriod] = useState("2026-Q2");
  const [regionCode, setRegionCode] = useState("GLB");
  const [focusKind, setFocusKind] = useState<ActionKind | "all">(() => {
    const f = searchParams.get("focus") ?? searchParams.get("kind");
    if (f === "corrective" || f === "preventive") return f;
    return "all";
  });
  const [showCreate, setShowCreate] = useState(
    () => searchParams.get("create") === "1",
  );
  const [createKind, setCreateKind] = useState<ActionKind>(() =>
    searchParams.get("kind") === "preventive" ? "preventive" : "corrective",
  );
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createOwner, setCreateOwner] = useState("");
  const [createRootCause, setCreateRootCause] = useState("Energy control failure");
  const [busy, setBusy] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  useEffect(() => {
    const t = parseTab(searchParams.get("tab"));
    setTab(t);
    if (searchParams.get("create") === "1") {
      setShowCreate(true);
      setTab("workflow");
    }
    const f = searchParams.get("focus") ?? searchParams.get("kind");
    if (f === "corrective" || f === "preventive") {
      setFocusKind(f);
      setCreateKind(f);
    }
  }, [searchParams]);

  const url = useMemo(() => {
    const q = new URLSearchParams({ industry, period, regionCode });
    return `/api/v1/corrective-action-management?${q}`;
  }, [industry, period, regionCode]);

  const { data: dash, loading, error, fromCache, reload } =
    useCachedAggregate<CamDashboard>(url);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/corrective-action-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, period, regionCode, ...body }),
      });
      if (res.ok) {
        invalidateClientAggregate("/api/v1/corrective-action-management");
        await reload({ bust: true });
      }
      return res;
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    await post({ op: "refresh" });
  }

  async function createAction() {
    if (!createTitle.trim()) return;
    const res = await post({
      op: "create",
      create: {
        title: createTitle,
        description: createDesc,
        kind: createKind,
        owner: createOwner || undefined,
        rootCauseLabel: createRootCause,
        source: createKind === "preventive" ? "inspection" : "incident",
        sourceLabel:
          createKind === "preventive"
            ? "Inspection finding"
            : "Incident root cause",
      },
    });
    if (res?.ok) {
      setCreateTitle("");
      setCreateDesc("");
      setShowCreate(false);
      setTab("workflow");
    }
  }

  async function assignOwner(token: string, owner: string) {
    await post({
      op: "mutate",
      mutate: { actionToken: token, owner },
    });
  }

  async function advanceStage(token: string, stage: CloseOutStage) {
    await post({
      op: "mutate",
      mutate: {
        actionToken: token,
        closeOutStage: stage,
        close: stage === "closed",
      },
    });
  }

  async function setProgress(token: string, progressPct: number) {
    await post({
      op: "mutate",
      mutate: { actionToken: token, progressPct },
    });
  }

  const project = dash?.project;
  const company = dash?.company;
  const bench = dash?.industryBenchmark;

  const compareRows =
    project && company
      ? [
          {
            label: "Open rate",
            left: project.rates.openRatePer200k,
            right: company.rates.openRatePer200k,
            unit: "/200k",
            suppressed: project.rates.suppressed || company.rates.suppressed,
          },
          {
            label: "Median age (days)",
            left: project.aging.medianAgeDays,
            right: company.aging.medianAgeDays,
          },
          {
            label: "On-time closure %",
            left: project.aging.onTimeClosurePct,
            right: company.aging.onTimeClosurePct,
            unit: "%",
          },
          {
            label: "Effectiveness",
            left: project.effectiveness.avgScore,
            right: company.effectiveness.avgScore,
            suppressed:
              project.effectiveness.suppressed || company.effectiveness.suppressed,
          },
        ]
      : [];

  const industryCompareRows =
    project && bench
      ? [
          {
            label: "Median age (days)",
            left: project.aging.medianAgeDays,
            right: bench.medianAgeDays,
            suppressed: bench.suppressed,
          },
          {
            label: "On-time closure %",
            left: project.aging.onTimeClosurePct,
            right: bench.onTimeClosurePct,
            unit: "%",
            suppressed: bench.suppressed,
          },
          {
            label: "Effectiveness",
            left: project.effectiveness.avgScore,
            right: bench.effectivenessAvg,
            suppressed: bench.suppressed || project.effectiveness.suppressed,
          },
        ]
      : [];

  const insightChips =
    dash && project
      ? [
          {
            id: "open",
            label: "Open actions",
            value: String(project.aging.openTotal),
            tone: "info" as const,
            href: "#cam-workflow",
          },
          {
            id: "median",
            label: "Median age",
            value: `${fmt(project.aging.medianAgeDays, 0)}d`,
            tone:
              project.aging.medianAgeDays > 21
                ? ("caution" as const)
                : ("positive" as const),
          },
          {
            id: "overdue",
            label: "Overdue",
            value: String(project.aging.overdue),
            tone:
              project.aging.overdue > 3 ? ("alert" as const) : ("neutral" as const),
            href: "#cam-insights",
          },
          {
            id: "eff",
            label: "Effectiveness",
            value: fmt(project.effectiveness.avgScore, 0),
            tone: "positive" as const,
            href: "#vs-root-cause-flow",
          },
        ]
      : [];

  const queue = useMemo(() => {
    if (!dash) return [];
    let rows = dash.workflow.openQueue;
    if (focusKind !== "all") {
      rows = rows.filter((a) => a.kind === focusKind);
    }
    return rows;
  }, [dash, focusKind]);

  const selected =
    queue.find((a) => a.actionToken === selectedToken) ??
    project?.actions.find((a) => a.actionToken === selectedToken) ??
    null;

  return (
    <VsDashboardShell
      eyebrow="Action Management"
      title="Corrective & Preventive Actions"
      description="Create, assign, track, and close Corrective Actions (incident-driven) and Preventive Actions (inspection/risk-driven). Dashboard aging, effectiveness, root-cause linkage, AI suggestions, and insights — VeriSuite design."
      meta={
        dash
          ? `Rev ${dash.revision} · n≥${dash.rules.minSample} · per ${dash.rules.hoursDenominator.toLocaleString()} hrs · ${
              fromCache ? "cached · " : ""
            }${dash.rules.terminology.program}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["dashboard", "Dashboard"],
              ["workflow", "Workflow"],
              ["suggestions", "Smart suggestions"],
              ["insights", "Insights"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{
                background: tab === id ? VS_COLORS.blue : VS_COLORS.slate,
                color: tab === id ? VS_COLORS.navy : VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}

          <select
            value={industry}
            onChange={(e) =>
              setIndustry(e.target.value as CamSelectors["industry"])
            }
            className="ml-2 rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={regionCode}
            onChange={(e) => setRegionCode(e.target.value)}
            className="rounded border bg-transparent px-2 py-1.5 text-xs"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          >
            <option value="GLB">Global</option>
            <option value="CA-AB">Alberta</option>
            <option value="CA-BC">British Columbia</option>
            <option value="US-TX">Texas</option>
            <option value="US-NV">Nevada</option>
          </select>

          <button
            type="button"
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
            disabled={busy}
            onClick={() => void refresh()}
          >
            Recompute
          </button>
          <button
            type="button"
            className="ml-auto rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
            onClick={() => {
              setShowCreate(true);
              setTab("workflow");
            }}
          >
            Create action
          </button>
        </div>
      </VsSection>

      {error ? (
        <p className="mb-4 text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {loading && !dash ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full bg-[var(--vs-slate)]" />
          <Skeleton className="h-40 w-full bg-[var(--vs-slate)]" />
        </div>
      ) : null}

      {dash && project && company ? (
        <>
          <InsightStrip chips={insightChips} cachedHint={fromCache} />

          {tab === "dashboard" ? (
            <>
              <VsSection band="kpi" label="Corrective Action Dashboard">
                <KpiTile
                  label="Open actions"
                  value={project.aging.openTotal}
                  tone="info"
                />
                <KpiTile
                  label="Open Corrective"
                  value={project.aging.openCorrective}
                  tone="info"
                />
                <KpiTile
                  label="Open Preventive"
                  value={project.aging.openPreventive}
                  tone="caution"
                />
                <KpiTile
                  label="Action aging (median days)"
                  value={fmt(project.aging.medianAgeDays)}
                  tone={
                    project.aging.medianAgeDays > 21 ? "critical" : "neutral"
                  }
                />
                <KpiTile
                  label="Effectiveness score"
                  value={
                    project.effectiveness.suppressed
                      ? "hidden"
                      : fmt(project.effectiveness.avgScore, 0)
                  }
                  tone="info"
                  suppressed={project.effectiveness.suppressed}
                />
                <KpiTile
                  label="Overdue"
                  value={project.aging.overdue}
                  tone={project.aging.overdue > 3 ? "critical" : "neutral"}
                />
              </VsSection>

              <VsSection band="trend" label="Aging & comparison">
                <ActionAgingHistogram
                  title="Action aging (days open)"
                  bins={project.aging.histogram}
                />
                <ComparisonPanel
                  mode="project-vs-company"
                  title="Project vs company Action Management"
                  rows={compareRows}
                />
              </VsSection>

              <VsSection band="detail" label="Root cause → action linkage">
                <RootCauseActionFlow flows={project.rootCauseFlows} />
                <div className="vs-panel p-4">
                  <p className="vs-eyebrow">Close-out funnel</p>
                  <div className="mt-3 space-y-2">
                    {project.closeOut.map((s) => (
                      <div key={s.stage} className="flex items-center gap-3 text-sm">
                        <span className="w-44 capitalize" style={{ color: VS_COLORS.muted }}>
                          {stageLabel(s.stage)}
                        </span>
                        <div className="h-2 flex-1 rounded-sm" style={{ background: VS_COLORS.panel }}>
                          <div
                            className="h-2 rounded-sm"
                            style={{
                              width: `${Math.min(100, s.sharePct)}%`,
                              background: VS_COLORS.blue,
                            }}
                          />
                        </div>
                        <span className="w-16 text-right tabular-nums">
                          {s.count} · {fmt(s.sharePct, 0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <ComparisonPanel
                  mode="project-vs-industry"
                  title="Project vs industry"
                  rows={industryCompareRows}
                />
              </VsSection>
            </>
          ) : null}

          {tab === "workflow" ? (
            <VsSection band="detail" label="Action workflow">
              <div id="cam-workflow">
              {showCreate ? (
                <div
                  className="vs-panel mb-4 grid gap-3 p-4 md:grid-cols-2"
                  style={{ borderLeft: `3px solid ${VS_COLORS.blue}` }}
                >
                  <div className="space-y-2 md:col-span-2">
                    <p className="vs-eyebrow">Create action</p>
                    <p className="text-xs" style={{ color: VS_COLORS.muted }}>
                      Corrective Actions from incidents · Preventive Actions from
                      inspection findings / risk
                    </p>
                  </div>
                  <select
                    value={createKind}
                    onChange={(e) => setCreateKind(e.target.value as ActionKind)}
                    className="rounded border bg-transparent px-2 py-2 text-sm"
                    style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
                  >
                    <option value="corrective">Corrective Action</option>
                    <option value="preventive">Preventive Action</option>
                  </select>
                  <select
                    value={createOwner}
                    onChange={(e) => setCreateOwner(e.target.value)}
                    className="rounded border bg-transparent px-2 py-2 text-sm"
                    style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
                  >
                    <option value="">Assign owner later</option>
                    {OWNERS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded border bg-transparent px-3 py-2 text-sm md:col-span-2"
                    style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
                    placeholder="Title"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                  />
                  <textarea
                    className="min-h-[72px] rounded border bg-transparent px-3 py-2 text-sm md:col-span-2"
                    style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
                    placeholder="Description / acceptance criteria"
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                  />
                  <select
                    value={createRootCause}
                    onChange={(e) => setCreateRootCause(e.target.value)}
                    className="rounded border bg-transparent px-2 py-2 text-sm md:col-span-2"
                    style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
                  >
                    {[
                      "Energy control failure",
                      "Procedural non-compliance",
                      "Competency gap",
                      "Equipment integrity",
                      "Housekeeping / layout",
                      "Communication breakdown",
                    ].map((r) => (
                      <option key={r} value={r}>
                        Root cause: {r}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      type="button"
                      disabled={busy || !createTitle.trim()}
                      className="rounded px-3 py-2 text-xs font-semibold"
                      style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
                      onClick={() => void createAction()}
                    >
                      Save action
                    </button>
                    <button
                      type="button"
                      className="rounded px-3 py-2 text-xs font-semibold"
                      style={{
                        background: VS_COLORS.slate,
                        color: VS_COLORS.white,
                        border: `1px solid ${VS_COLORS.border}`,
                      }}
                      onClick={() => setShowCreate(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mb-3 flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All"],
                    ["corrective", "Corrective"],
                    ["preventive", "Preventive"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className="rounded px-2.5 py-1 text-[11px] font-semibold uppercase"
                    style={{
                      background:
                        focusKind === id ? VS_COLORS.blue : VS_COLORS.slate,
                      color: focusKind === id ? VS_COLORS.navy : VS_COLORS.white,
                      border: `1px solid ${VS_COLORS.border}`,
                    }}
                    onClick={() => setFocusKind(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div className="vs-panel overflow-x-auto p-0">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr style={{ color: VS_COLORS.muted }}>
                        <th className="p-3 font-medium">Action</th>
                        <th className="p-3 font-medium">Kind</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Owner</th>
                        <th className="p-3 font-medium">Age</th>
                        <th className="p-3 font-medium">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map((row) => (
                        <tr
                          key={row.actionToken}
                          style={{
                            borderTop: `1px solid ${VS_COLORS.border}`,
                            background:
                              selectedToken === row.actionToken
                                ? VS_COLORS.slate
                                : undefined,
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedToken(row.actionToken)}
                        >
                          <td className="p-3" style={{ color: VS_COLORS.white }}>
                            {row.title}
                            <p className="text-[11px]" style={{ color: VS_COLORS.muted }}>
                              {row.sourceLabel}
                            </p>
                          </td>
                          <td className="p-3 text-xs" style={{ color: VS_COLORS.blue }}>
                            {kindLabel(row.kind)}
                          </td>
                          <td className="p-3">
                            <VsStatusBadge tone={statusTone(row.status)}>
                              {row.status.replace(/_/g, " ")}
                            </VsStatusBadge>
                          </td>
                          <td className="p-3" style={{ color: VS_COLORS.muted }}>
                            {row.owner ?? "Unassigned"}
                          </td>
                          <td
                            className="p-3 tabular-nums"
                            style={{
                              color:
                                row.ageDays > 45
                                  ? VS_COLORS.critical
                                  : VS_COLORS.muted,
                            }}
                          >
                            {row.ageDays}d
                          </td>
                          <td className="p-3 tabular-nums" style={{ color: VS_COLORS.muted }}>
                            {row.progressPct}%
                          </td>
                        </tr>
                      ))}
                      {queue.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-6 text-center text-sm"
                            style={{ color: VS_COLORS.muted }}
                          >
                            No open actions in this filter.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <div className="vs-panel space-y-3 p-4">
                  <p className="vs-eyebrow">Track · assign · close-out</p>
                  {selected ? (
                    <>
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {selected.title}
                      </h3>
                      <p className="text-xs" style={{ color: VS_COLORS.muted }}>
                        {selected.description}
                      </p>
                      <p className="text-xs" style={{ color: VS_COLORS.blue }}>
                        Root cause:{" "}
                        {selected.rootCauses.map((r) => r.rootCauseLabel).join(", ")}
                      </p>
                      <label className="block text-[11px] uppercase" style={{ color: VS_COLORS.muted }}>
                        Assign owner
                        <select
                          className="mt-1 w-full rounded border bg-transparent px-2 py-2 text-sm"
                          style={{
                            borderColor: VS_COLORS.border,
                            color: VS_COLORS.white,
                          }}
                          value={selected.owner ?? ""}
                          disabled={busy}
                          onChange={(e) =>
                            void assignOwner(selected.actionToken, e.target.value)
                          }
                        >
                          <option value="">Unassigned</option>
                          {OWNERS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-[11px] uppercase" style={{ color: VS_COLORS.muted }}>
                        Progress ({selected.progressPct}%)
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={selected.progressPct}
                          disabled={busy}
                          className="mt-2 w-full"
                          onChange={(e) =>
                            void setProgress(
                              selected.actionToken,
                              Number(e.target.value),
                            )
                          }
                        />
                      </label>
                      <p className="text-[11px] uppercase" style={{ color: VS_COLORS.muted }}>
                        Close-out stage
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {STAGES.map((stage) => (
                          <button
                            key={stage}
                            type="button"
                            disabled={busy}
                            className="rounded px-2 py-1 text-[10px] font-semibold uppercase"
                            style={{
                              background:
                                selected.closeOutStage === stage
                                  ? VS_COLORS.blue
                                  : VS_COLORS.slate,
                              color:
                                selected.closeOutStage === stage
                                  ? VS_COLORS.navy
                                  : VS_COLORS.white,
                              border: `1px solid ${VS_COLORS.border}`,
                            }}
                            onClick={() =>
                              void advanceStage(selected.actionToken, stage)
                            }
                          >
                            {stageLabel(stage)}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={busy || selected.status === "closed"}
                        className="w-full rounded px-3 py-2 text-xs font-semibold"
                        style={{
                          background: VS_COLORS.emerald,
                          color: VS_COLORS.navy,
                        }}
                        onClick={() =>
                          void advanceStage(selected.actionToken, "closed")
                        }
                      >
                        Close-out action
                      </button>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: VS_COLORS.muted }}>
                      Select an action to assign an owner, track progress, and
                      advance close-out (assigned → implemented → verified →
                      effectiveness reviewed → closed).
                    </p>
                  )}
                </div>
              </div>
              </div>
            </VsSection>
          ) : null}

          {tab === "suggestions" ? (
            <VsSection band="detail" label="Smart action suggestions">
              <div className="grid gap-3 md:grid-cols-2">
                {dash.smartSuggestions.map((s) => (
                  <div
                    key={s.id}
                    className="vs-panel p-4"
                    style={{
                      borderLeft: `3px solid ${
                        s.kind === "corrective" ? VS_COLORS.blue : VS_COLORS.orange
                      }`,
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {kindLabel(s.kind)} Action · {s.basedOn.replace(/_/g, " ")} ·{" "}
                      {Math.round(s.confidence * 100)}%
                    </p>
                    <h3
                      className="mt-1 text-sm font-semibold"
                      style={{ color: VS_COLORS.white }}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: VS_COLORS.muted }}>
                      {s.detail}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: VS_COLORS.blue }}>
                      {s.sourceLabel} · {s.rootCauseLabel} · {s.suggestedOwnerRole}
                    </p>
                    <button
                      type="button"
                      className="mt-3 text-xs font-semibold"
                      style={{ color: VS_COLORS.blue }}
                      onClick={() => {
                        setCreateKind(s.kind);
                        setCreateTitle(
                          s.title.replace(/^Corrective Action:\s*/i, "").replace(
                            /^Preventive Action:\s*/i,
                            "",
                          ),
                        );
                        setCreateRootCause(s.rootCauseLabel);
                        setCreateDesc(s.detail);
                        setShowCreate(true);
                        setTab("workflow");
                      }}
                    >
                      Create from suggestion →
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs" style={{ color: VS_COLORS.muted }}>
                AI suggests Corrective Actions from incident root causes and
                Preventive Actions from inspection findings / recurring causes.
              </p>
            </VsSection>
          ) : null}

          {tab === "insights" ? (
            <VsSection band="narrative" label="Action insights">
              <div id="cam-insights">
              <div className="grid gap-3 md:grid-cols-3">
                {dash.insights.map((ins) => (
                  <div
                    key={ins.id}
                    className="vs-panel p-4"
                    style={{
                      borderTop: `2px solid ${
                        ins.tone === "alert"
                          ? VS_COLORS.critical
                          : ins.tone === "caution"
                            ? VS_COLORS.orange
                            : ins.tone === "positive"
                              ? VS_COLORS.emerald
                              : VS_COLORS.blue
                      }`,
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {ins.category.replace(/_/g, " ")}
                      {ins.metric ? ` · ${ins.metric}` : ""}
                    </p>
                    <h3
                      className="mt-1 text-sm font-semibold"
                      style={{ color: VS_COLORS.white }}
                    >
                      {ins.headline}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: VS_COLORS.muted }}>
                      {ins.body}
                    </p>
                    {ins.href ? (
                      <button
                        type="button"
                        className="mt-3 text-xs font-semibold"
                        style={{ color: VS_COLORS.blue }}
                        onClick={() => {
                          if (ins.href === "#cam-workflow") setTab("workflow");
                          else if (ins.href === "#vs-root-cause-flow")
                            setTab("dashboard");
                        }}
                      >
                        Open related view →
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <SmsAiIntegrationPanel
                  page="actions"
                  companyId={companyId}
                  projectId={projectId}
                  title="Narrative"
                  fallbackInsights={dash.narratives.map((n) => ({
                    id: n.id,
                    tone: n.tone,
                    headline: n.headline,
                    body: n.body,
                  }))}
                  defaultAcceptAction="create_action"
                />
                <div className="mt-4">
                  <SmsInteractionFlowPanel
                    page="actions"
                    companyId={companyId}
                    projectId={projectId}
                    title="Close action flow"
                    showCrossLinks={false}
                  />
                </div>
              </div>
              </div>
            </VsSection>
          ) : null}

          <VsSection band="narrative" label="Cross-page links">
            <div className="flex flex-wrap gap-4 text-xs">
              <Link href={dash.links.incidents} style={{ color: VS_COLORS.blue }}>
                ← Incidents
              </Link>
              <Link href={dash.links.meetings} style={{ color: VS_COLORS.blue }}>
                Safety meetings →
              </Link>
              <Link href={dash.links.inspections} style={{ color: VS_COLORS.blue }}>
                Inspections →
              </Link>
              <Link href={dash.links.training} style={{ color: VS_COLORS.blue }}>
                Training →
              </Link>
            </div>
          </VsSection>

          <VeriPmAiIntelligencePanel page="action-management" />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
