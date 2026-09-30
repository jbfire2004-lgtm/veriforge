"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import {
  AnvilIcon,
  ForgeBoltIcon,
  HeatEdgeIcon,
  ShieldGridIcon,
  IconTrainingProgress,
  IconForgeCheck,
  IconComplianceDocument,
  IconIncidentSeverity,
  IconRiskHazard,
  IconEquipmentInspection,
  IconCultureEngagement,
  IconRiskScoring,
} from "./icons";

export type ReportType =
  | "executive"
  | "training"
  | "verification"
  | "compliance"
  | "incident"
  | "risk"
  | "equipment"
  | "workforce"
  | "predictive";

export type ReportStatus = "draft" | "ready" | "exported" | "critical";
export type RegionCode =
  | "NA-EAST"
  | "NA-WEST"
  | "EU-CENTRAL"
  | "EU-WEST"
  | "APAC"
  | "LATAM"
  | "GLOBAL";

export type ReportKpiLocal = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  critical: boolean;
  series?: number[];
};

export type ExecutiveReportLocal = {
  id: string;
  type: ReportType;
  title: string;
  summary: string;
  status: ReportStatus;
  score: number;
  region: RegionCode;
  tenantId: string;
  kpis: ReportKpiLocal[];
  highlights: string[];
  timestamp: string;
  userId: number;
  exportedAt?: string;
};

export type ReportingAnalyticsSnapshot = {
  totalReports: number;
  readyCount: number;
  exportedCount: number;
  criticalCount: number;
  averageScore: number;
  typeCounts: Record<ReportType, number>;
  executiveReadinessScore: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.reports.analytics";
const TENANT_ID = "tenant-forge-global";

const TYPES: ReportType[] = [
  "executive",
  "training",
  "verification",
  "compliance",
  "incident",
  "risk",
  "equipment",
  "workforce",
  "predictive",
];

const TYPE_LABEL: Record<ReportType, string> = {
  executive: "Executive Summary",
  training: "Training",
  verification: "Verification",
  compliance: "Compliance",
  incident: "Incident",
  risk: "Risk",
  equipment: "Equipment",
  workforce: "Workforce",
  predictive: "Predictive",
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const SEED_REPORTS: ExecutiveReportLocal[] = [
  {
    id: "rpt-exec-01",
    type: "executive",
    title: "Executive Summary · Q Shift",
    summary: "Composite industrial readiness across training, compliance, incidents, and risk",
    status: "ready",
    score: 78,
    region: "GLOBAL",
    tenantId: TENANT_ID,
    kpis: [
      { id: "k1", label: "Overall readiness", value: 78, critical: false, series: [70, 72, 74, 75, 76, 77, 78] },
      { id: "k2", label: "Critical KPIs", value: 3, critical: true },
      { id: "k3", label: "Open incidents", value: 5, critical: true },
      { id: "k4", label: "Compliance coverage", value: 86, critical: false },
    ],
    highlights: [
      "3 critical KPIs require executive attention",
      "Compliance coverage holding above target",
      "Incident closure time trending down",
    ],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "rpt-train-01",
    type: "training",
    title: "Training Report",
    summary: "Completion rate, overdue modules, certification status",
    status: "ready",
    score: 84,
    region: "NA-EAST",
    tenantId: TENANT_ID,
    kpis: [
      { id: "t1", label: "Completion rate", value: 84, unit: "%", critical: false, series: [78, 80, 81, 82, 83, 84, 84] },
      { id: "t2", label: "Overdue modules", value: 12, critical: true },
      { id: "t3", label: "Certifications valid", value: 91, unit: "%", critical: false },
      { id: "t4", label: "Fail risk cohort", value: 8, critical: false },
    ],
    highlights: ["12 overdue modules in Cell B", "Certification validity strong at 91%"],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "rpt-ver-01",
    type: "verification",
    title: "Verification Report",
    summary: "forgeCheck pass rate, workflow time, failure trends",
    status: "ready",
    score: 81,
    region: "NA-WEST",
    tenantId: TENANT_ID,
    kpis: [
      { id: "v1", label: "forgeCheck pass rate", value: 81, unit: "%", critical: false, series: [76, 77, 78, 79, 80, 80, 81] },
      { id: "v2", label: "Avg workflow time", value: 42, unit: "min", critical: false },
      { id: "v3", label: "Failure trend", value: 19, unit: "%", critical: true },
      { id: "v4", label: "Pending checks", value: 23, critical: false },
    ],
    highlights: ["Failure trend elevated — review forgeFlow bottlenecks"],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "rpt-comp-01",
    type: "compliance",
    title: "Compliance Report",
    summary: "Document validity, requirement coverage, expiry forecast",
    status: "critical",
    score: 72,
    region: "EU-CENTRAL",
    tenantId: TENANT_ID,
    kpis: [
      { id: "c1", label: "Document validity", value: 88, unit: "%", critical: false },
      { id: "c2", label: "Requirement coverage", value: 79, unit: "%", critical: false },
      { id: "c3", label: "Expiry forecast (14d)", value: 14, critical: true, series: [4, 6, 8, 10, 11, 13, 14] },
      { id: "c4", label: "Critical gaps", value: 4, critical: true },
    ],
    highlights: ["4 critical gaps · 14 docs expiring in 14 days"],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "rpt-inc-01",
    type: "incident",
    title: "Incident Report",
    summary: "Frequency, severity, root cause, closure time",
    status: "critical",
    score: 64,
    region: "APAC",
    tenantId: TENANT_ID,
    kpis: [
      { id: "i1", label: "Frequency (30d)", value: 11, critical: true, series: [6, 7, 8, 9, 9, 10, 11] },
      { id: "i2", label: "Critical severity", value: 3, critical: true },
      { id: "i3", label: "Avg closure time", value: 4.2, unit: "d", critical: false },
      { id: "i4", label: "Root cause closed", value: 68, unit: "%", critical: false },
    ],
    highlights: ["Severity cluster in Zone 3", "Closure time improving"],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "rpt-risk-01",
    type: "risk",
    title: "Risk Report",
    summary: "Hazard density, control coverage, risk score trends",
    status: "ready",
    score: 70,
    region: "EU-WEST",
    tenantId: TENANT_ID,
    kpis: [
      { id: "r1", label: "Risk score", value: 70, critical: false, series: [62, 64, 66, 67, 68, 69, 70] },
      { id: "r2", label: "Hazard density", value: 58, critical: false },
      { id: "r3", label: "Control coverage", value: 82, unit: "%", critical: false },
      { id: "r4", label: "High-risk zones", value: 3, critical: true },
    ],
    highlights: ["3 high-risk zones predicted", "Control coverage above 80%"],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "rpt-eq-01",
    type: "equipment",
    title: "Equipment Report",
    summary: "Inspection status, defect frequency, certification expiry",
    status: "ready",
    score: 76,
    region: "NA-EAST",
    tenantId: TENANT_ID,
    kpis: [
      { id: "e1", label: "Inspection pass", value: 87, unit: "%", critical: false },
      { id: "e2", label: "Defect frequency", value: 9, critical: true, series: [4, 5, 6, 7, 8, 8, 9] },
      { id: "e3", label: "Cert expiry (30d)", value: 6, critical: true },
      { id: "e4", label: "Assets healthy", value: 91, unit: "%", critical: false },
    ],
    highlights: ["Crane-04 defect anomaly", "6 certs expiring in 30 days"],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "rpt-wf-01",
    type: "workforce",
    title: "Workforce Readiness Report",
    summary: "Training, verification, compliance readiness",
    status: "critical",
    score: 68,
    region: "LATAM",
    tenantId: TENANT_ID,
    kpis: [
      { id: "w1", label: "Training readiness", value: 74, unit: "%", critical: false },
      { id: "w2", label: "Verification readiness", value: 71, unit: "%", critical: false },
      { id: "w3", label: "Compliance readiness", value: 62, unit: "%", critical: true },
      { id: "w4", label: "Composite readiness", value: 68, unit: "%", critical: true, series: [72, 71, 70, 69, 69, 68, 68] },
    ],
    highlights: ["Low compliance readiness in LATAM", "Composite below 70% threshold"],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "rpt-pred-01",
    type: "predictive",
    title: "Predictive Insights",
    summary: "AI-driven forecasts with predicted risk highlights",
    status: "ready",
    score: 73,
    region: "GLOBAL",
    tenantId: TENANT_ID,
    kpis: [
      { id: "p1", label: "Incident probability", value: 78, critical: true, series: [55, 60, 65, 70, 74, 76, 78] },
      { id: "p2", label: "Compliance lapse risk", value: 81, critical: true },
      { id: "p3", label: "Equipment failure", value: 69, critical: false },
      { id: "p4", label: "Predictive health", value: 73, critical: false, series: [80, 78, 76, 75, 74, 73, 73] },
    ],
    highlights: ["Critical incident & compliance forecasts", "Equipment failure watch on Crane-04"],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
];

export function computeReportingAnalytics(
  reports: ExecutiveReportLocal[],
): ReportingAnalyticsSnapshot {
  const typeCounts = Object.fromEntries(TYPES.map((t) => [t, 0])) as Record<
    ReportType,
    number
  >;
  for (const r of reports) typeCounts[r.type] += 1;
  const criticalCount = reports.filter(
    (r) => r.status === "critical" || r.kpis.some((k) => k.critical) || r.score < 70,
  ).length;
  const readyCount = reports.filter(
    (r) => r.status === "ready" || r.status === "exported",
  ).length;
  const exportedCount = reports.filter((r) => r.status === "exported").length;
  const averageScore =
    reports.length === 0
      ? 0
      : clamp(reports.reduce((s, r) => s + r.score, 0) / reports.length);
  const executiveReadinessScore = clamp(
    averageScore - criticalCount * 3 + exportedCount * 2,
  );
  return {
    totalReports: reports.length,
    readyCount,
    exportedCount,
    criticalCount,
    averageScore,
    typeCounts,
    executiveReadinessScore,
    timestamp: new Date().toISOString(),
  };
}

export function persistReportingAnalytics(snapshot: ReportingAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:reports-analytics", { detail: snapshot }),
  );
}

export function readReportingAnalytics(): ReportingAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReportingAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useReportingAnalyticsSync(
  fallback: ReportingAnalyticsSnapshot = computeReportingAnalytics(SEED_REPORTS),
) {
  const [analytics, setAnalytics] = React.useState<ReportingAnalyticsSnapshot>(
    () => readReportingAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as ReportingAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<ReportingAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:reports-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:reports-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function Metric({
  label,
  value,
  critical,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border px-3 py-2",
        critical
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.25)]"
          : "border-[#424242] bg-[#1f1f1f]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">{label}</p>
      <p className="mt-1 font-[var(--vf-font-primary)] text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}

function StatusChip({ status }: { status: ReportStatus }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        status === "critical"
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.25)] text-[#ffc9c9]"
          : status === "exported"
            ? "border-[#FAFAFA] bg-[#1f1f1f] text-[#FAFAFA]"
            : "border-[#424242] bg-[#151515] text-[#9f9f9f]",
      )}
    >
      {status}
    </span>
  );
}

function Sparkline({ series, critical }: { series: number[]; critical?: boolean }) {
  const max = Math.max(...series, 1);
  const points = series
    .map((v, i) => {
      const x = (i / Math.max(1, series.length - 1)) * 100;
      const y = 36 - (v / max) * 32;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" aria-hidden>
      <polyline
        fill="none"
        stroke={critical ? "#1E6FB8" : "#424242"}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

function MetaLine({
  region,
  tenantId,
  timestamp,
}: {
  region: string;
  tenantId: string;
  timestamp: string;
}) {
  return (
    <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-[#6f6f6f]">
      region {region} · tenant {tenantId} · {timestamp.slice(0, 19)}Z
    </p>
  );
}

function TypeIcon({ type }: { type: ReportType }) {
  const props = { size: 20, tone: "neutral" as const };
  switch (type) {
    case "training":
      return <IconTrainingProgress {...props} />;
    case "verification":
      return <IconForgeCheck {...props} />;
    case "compliance":
      return <IconComplianceDocument {...props} />;
    case "incident":
      return <IconIncidentSeverity {...props} tone="critical" />;
    case "risk":
      return <IconRiskHazard {...props} />;
    case "equipment":
      return <IconEquipmentInspection {...props} />;
    case "workforce":
      return <IconCultureEngagement {...props} />;
    case "predictive":
      return <IconRiskScoring {...props} tone="critical" />;
    default:
      return <ForgeBoltIcon />;
  }
}

const RISK_CELLS = [
  { label: "L1×S1", score: 12 },
  { label: "L2×S2", score: 28 },
  { label: "L3×S3", score: 52 },
  { label: "L3×S5", score: 76 },
  { label: "L4×S4", score: 80 },
  { label: "L4×S5", score: 88 },
];

const INCIDENT_MATRIX = [
  { sev: "Low", count: 4 },
  { sev: "Med", count: 4 },
  { sev: "High", count: 2 },
  { sev: "Crit", count: 3 },
];

export function VeriForgeExecutiveReportingSuite() {
  const { push } = useVeriForgeNotifications();
  const [reports, setReports] = React.useState(SEED_REPORTS);
  const [filter, setFilter] = React.useState<ReportType | "all">("all");
  const [genType, setGenType] = React.useState<ReportType>("executive");
  const [selectedId, setSelectedId] = React.useState(SEED_REPORTS[0]?.id ?? null);
  const seq = React.useRef(30);
  const notified = React.useRef<Set<string>>(new Set());

  const analytics = React.useMemo(
    () => computeReportingAnalytics(reports),
    [reports],
  );

  React.useEffect(() => {
    persistReportingAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const r of reports) {
      const critical =
        r.status === "critical" || r.kpis.some((k) => k.critical) || r.score < 70;
      if (!critical) continue;
      if (notified.current.has(r.id)) continue;
      notified.current.add(r.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL EXECUTIVE KPI",
        message: `${r.title} · score ${r.score} · ${r.region} · tenant ${r.tenantId}`,
        forgeStatus: "failed",
        userId: r.userId,
        actionLabel: "Open Reports",
      });
    }
  }, [reports, push]);

  const filtered =
    filter === "all" ? reports : reports.filter((r) => r.type === filter);
  const selected = reports.find((r) => r.id === selectedId) ?? filtered[0];

  const generateReport = () => {
    const score = clamp(55 + Math.floor(Math.random() * 40));
    const critical = score < 70;
    const report: ExecutiveReportLocal = {
      id: `rpt-${seq.current++}`,
      type: genType,
      title: `${TYPE_LABEL[genType]} · generated ${seq.current}`,
      summary: `Generated ${genType} executive report`,
      status: critical ? "critical" : "ready",
      score,
      region: "GLOBAL",
      tenantId: TENANT_ID,
      kpis: [
        {
          id: "g1",
          label: "Primary score",
          value: score,
          critical,
          series: [score - 12, score - 8, score - 5, score - 3, score - 2, score - 1, score].map(
            clamp,
          ),
        },
        { id: "g2", label: "Critical flags", value: critical ? 2 : 0, critical },
      ],
      highlights: critical
        ? ["Critical KPI threshold breached"]
        : ["Report within industrial targets"],
      timestamp: new Date().toISOString(),
      userId: 1,
    };
    setReports((prev) => [report, ...prev]);
    setSelectedId(report.id);
  };

  const exportReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: r.status === "critical" ? "critical" : "exported",
              exportedAt: new Date().toISOString(),
              timestamp: new Date().toISOString(),
            }
          : r,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Executive Reporting Suite
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#b8b8b8]">
              Dashboards · KPI summaries · compliance · incidents · risk · workforce ·
              equipment · predictive — export-ready angular layouts.
            </p>
          </div>
          <div className="flex gap-2 text-[#1E6FB8]">
            <AnvilIcon />
            <ForgeBoltIcon />
            <ShieldGridIcon />
            <HeatEdgeIcon />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Reports" value={String(analytics.totalReports)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalCount)}
            critical={analytics.criticalCount > 0}
          />
          <Metric label="Exported" value={String(analytics.exportedCount)} />
          <Metric label="Readiness" value={`${analytics.executiveReadinessScore}%`} />
        </div>

        <div className="mt-4">
          <VeriForgeProgressBar
            label={`Executive readiness · avg score ${analytics.averageScore}`}
            value={analytics.executiveReadinessScore}
          />
        </div>
        <MetaLine region="GLOBAL" tenantId={TENANT_ID} timestamp={analytics.timestamp} />
      </VeriForgeFrame>

      <div className="flex flex-wrap items-end gap-3 border border-[#424242] bg-[#151515] p-3">
        <div className="min-w-[180px] flex-1">
          <VeriForgeSelect
            label="Generate type"
            value={genType}
            onChange={(e) => setGenType(e.target.value as ReportType)}
            options={TYPES.map((t) => ({ label: TYPE_LABEL[t], value: t }))}
          />
        </div>
        <VeriForgeButton onClick={generateReport}>Generate report</VeriForgeButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
            filter === "all"
              ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
              : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
          )}
        >
          All
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={cn(
              "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
              filter === t
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
                : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
            )}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {filtered.map((r) => {
            const critical =
              r.status === "critical" || r.kpis.some((k) => k.critical) || r.score < 70;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  "w-full border text-left",
                  "bg-[linear-gradient(160deg,#1A1A1A_0%,#121212_48%,#242424_100%)]",
                  selectedId === r.id || critical
                    ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242]",
                )}
              >
                <div className="border-b border-[#424242] bg-[linear-gradient(90deg,#2a2a2a_0%,#1A1A1A_40%,#3a1515_100%)] px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon type={r.type} />
                      <div>
                        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                          {r.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#8a8a8a]">
                          {TYPE_LABEL[r.type]}
                        </p>
                      </div>
                    </div>
                    <StatusChip status={r.status} />
                  </div>
                  {critical ? (
                    <div className="mt-2 h-0.5 w-24 bg-[#1E6FB8] shadow-[0_0_10px_rgba(30, 111, 184,.6)]" />
                  ) : (
                    <div className="mt-2 h-0.5 w-16 bg-[#424242]" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#b8b8b8]">{r.summary}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {r.kpis.map((k) => (
                      <div
                        key={k.id}
                        className={cn(
                          "border px-2 py-2",
                          k.critical
                            ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)]"
                            : "border-[#424242] bg-[#1f1f1f]",
                        )}
                      >
                        <p className="text-[9px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                          {k.label}
                        </p>
                        <p className="mt-1 font-[var(--vf-font-primary)] text-sm text-[#FAFAFA]">
                          {k.value}
                          {k.unit ? (
                            <span className="ml-0.5 text-[10px] text-[#8a8a8a]">{k.unit}</span>
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>
                  {r.kpis.find((k) => k.series)?.series ? (
                    <div className="mt-3">
                      <Sparkline
                        series={r.kpis.find((k) => k.series)!.series!}
                        critical={critical}
                      />
                    </div>
                  ) : null}
                  <MetaLine
                    region={r.region}
                    tenantId={r.tenantId}
                    timestamp={r.timestamp}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <aside className="space-y-4">
          {selected ? (
            <div
              className={cn(
                "border bg-[#1A1A1A] p-4",
                selected.status === "critical" || selected.score < 70
                  ? "border-[#1E6FB8] shadow-[0_0_14px_rgba(30, 111, 184,.3)]"
                  : "border-[#424242]",
              )}
            >
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
                Export layout
              </p>
              <p className="mt-2 font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.12em] text-[#FAFAFA]">
                {selected.title}
              </p>
              <p className="mt-1 text-xs text-[#b8b8b8]">{selected.summary}</p>
              <div className="mt-3">
                <VeriForgeProgressBar label="Report score" value={selected.score} />
              </div>
              <ul className="mt-3 space-y-1 text-xs text-[#b8b8b8]">
                {selected.highlights.map((h) => (
                  <li key={h}>· {h}</li>
                ))}
              </ul>
              <div className="mt-4">
                <VeriForgeButton onClick={() => exportReport(selected.id)}>
                  Export report
                </VeriForgeButton>
              </div>
              {selected.exportedAt ? (
                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                  Exported · {selected.exportedAt.slice(0, 19)}Z
                </p>
              ) : null}
              <MetaLine
                region={selected.region}
                tenantId={selected.tenantId}
                timestamp={selected.timestamp}
              />
            </div>
          ) : null}

          {/* Incident matrix */}
          <div className="border border-[#424242] bg-[#1A1A1A] p-4">
            <p className={cn(veriforgeTypography.heading, "text-[10px] text-[#d0d0d0]")}>
              Incident matrix
            </p>
            <div className="mt-3 grid grid-cols-4 gap-1">
              {INCIDENT_MATRIX.map((c) => (
                <div
                  key={c.sev}
                  className={cn(
                    "border p-2 text-center",
                    c.sev === "Crit"
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)]"
                      : "border-[#424242]",
                  )}
                >
                  <p className="text-[9px] uppercase text-[#8a8a8a]">{c.sev}</p>
                  <p className="font-[var(--vf-font-primary)] text-sm text-[#FAFAFA]">
                    {c.count}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk matrix */}
          <div className="border border-[#424242] bg-[#1A1A1A] p-4">
            <p className={cn(veriforgeTypography.heading, "text-[10px] text-[#d0d0d0]")}>
              Risk matrix
            </p>
            <div className="mt-3 grid grid-cols-3 gap-1">
              {RISK_CELLS.map((c) => (
                <div
                  key={c.label}
                  className={cn(
                    "border p-2",
                    "bg-[linear-gradient(145deg,#1A1A1A_0%,#242424_100%)]",
                    c.score >= 70
                      ? "border-[#1E6FB8] shadow-[0_0_8px_rgba(30, 111, 184,.35)]"
                      : "border-[#424242]",
                  )}
                >
                  <p className="text-[9px] uppercase text-[#8a8a8a]">{c.label}</p>
                  <p className="font-[var(--vf-font-primary)] text-sm text-[#FAFAFA]">
                    {c.score}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Workforce readiness strip */}
      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Workforce readiness
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(["Training", "Verification", "Compliance"] as const).map((label, i) => {
            const values = [74, 71, 62];
            const v = values[i];
            const low = v < 70;
            return (
              <div
                key={label}
                className={cn(
                  "border p-4",
                  low
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)] shadow-[0_0_14px_rgba(30, 111, 184,.35)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
                  {label}
                </p>
                <p className="mt-2 font-[var(--vf-font-primary)] text-2xl text-[#FAFAFA]">
                  {v}%
                </p>
                <VeriForgeProgressBar label="Readiness" value={v} />
              </div>
            );
          })}
        </div>
      </VeriForgeFrame>

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Report types
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <span
              key={t}
              className="border border-[#424242] bg-[#151515] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]"
            >
              {TYPE_LABEL[t]}
            </span>
          ))}
        </div>
        <VeriForgeDivider className="my-4" />
        <p className="text-xs text-[#8a8a8a]">
          Rules: metadata (timestamp · region · tenantId) on every report · critical KPIs
          fire red metallic notifications · export-ready angular layouts · sync{" "}
          <code className="text-[#cfcfcf]">veriforge.reports.analytics</code>
        </p>
      </VeriForgeFrame>
    </div>
  );
}
