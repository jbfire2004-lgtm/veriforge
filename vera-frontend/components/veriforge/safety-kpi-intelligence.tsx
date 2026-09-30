"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type KpiCategory =
  | "training"
  | "verification"
  | "compliance"
  | "incident"
  | "field"
  | "culture";

export type TrendDirection = "up" | "down" | "flat";
export type AlertSeverity = "critical" | "warning" | "info";
export type ReportStatus = "draft" | "ready" | "exported";

export type SafetyKpiLocal = {
  id: string;
  name: string;
  category: KpiCategory;
  formula: string;
  target: number | null;
  currentValue: number;
  score: number;
  baseline: number;
  forecastValue: number;
  trend: TrendDirection;
  history: number[];
  timestamp: string;
  userId: number;
};

export type KpiAlertLocal = {
  id: string;
  kpiId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: KpiCategory;
  timestamp: string;
  userId: number;
};

export type KpiReportLocal = {
  id: string;
  title: string;
  category: KpiCategory | "all";
  summary: string;
  scoreAverage: number;
  status: ReportStatus;
  timestamp: string;
  userId: number;
};

export type SafetyKpiAnalyticsSnapshot = {
  totalKpis: number;
  criticalCount: number;
  averageScore: number;
  belowTarget: number;
  negativeTrends: number;
  forecastRisk: number;
  categoryScores: Record<KpiCategory, number>;
  alertCount: number;
  reportCount: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.safety-kpi.analytics";

const CATEGORIES: KpiCategory[] = [
  "training",
  "verification",
  "compliance",
  "incident",
  "field",
  "culture",
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreFromValue(current: number, target: number | null) {
  if (target === null || target <= 0) return clamp(current);
  return clamp((current / target) * 100);
}

function trendFromHistory(history: number[]): TrendDirection {
  if (history.length < 2) return "flat";
  const delta = history[history.length - 1] - history[0];
  if (delta > 2) return "up";
  if (delta < -2) return "down";
  return "flat";
}

function forecastFromHistory(history: number[], current: number) {
  if (history.length < 2) return clamp(current);
  const delta =
    (history[history.length - 1] - history[0]) / Math.max(1, history.length - 1);
  return clamp(current + delta * 2);
}

function enrich(kpi: SafetyKpiLocal): SafetyKpiLocal {
  return {
    ...kpi,
    score: scoreFromValue(kpi.currentValue, kpi.target),
    forecastValue: forecastFromHistory(kpi.history, kpi.currentValue),
    trend: trendFromHistory(kpi.history),
    timestamp: new Date().toISOString(),
  };
}

export function computeSafetyKpiAnalytics(
  kpis: SafetyKpiLocal[],
  alerts: KpiAlertLocal[],
  reports: KpiReportLocal[],
): SafetyKpiAnalyticsSnapshot {
  const categoryScores = Object.fromEntries(
    CATEGORIES.map((c) => {
      const rows = kpis.filter((k) => k.category === c);
      return [
        c,
        rows.length === 0
          ? 0
          : clamp(rows.reduce((s, k) => s + k.score, 0) / rows.length),
      ];
    }),
  ) as Record<KpiCategory, number>;

  return {
    totalKpis: kpis.length,
    criticalCount: kpis.filter((k) => k.score < 70).length,
    averageScore:
      kpis.length === 0
        ? 0
        : clamp(kpis.reduce((s, k) => s + k.score, 0) / kpis.length),
    belowTarget: kpis.filter((k) => k.target !== null && k.currentValue < k.target)
      .length,
    negativeTrends: kpis.filter((k) => k.trend === "down").length,
    forecastRisk: kpis.filter((k) => k.forecastValue < 70).length,
    categoryScores,
    alertCount: alerts.length,
    reportCount: reports.length,
    timestamp: new Date().toISOString(),
  };
}

export function persistSafetyKpiAnalytics(snapshot: SafetyKpiAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:safety-kpi-analytics", { detail: snapshot }),
  );
}

export function readSafetyKpiAnalytics(): SafetyKpiAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SafetyKpiAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useSafetyKpiAnalyticsSync(
  fallback: SafetyKpiAnalyticsSnapshot = {
    totalKpis: 12,
    criticalCount: 3,
    averageScore: 76,
    belowTarget: 8,
    negativeTrends: 6,
    forecastRisk: 3,
    categoryScores: {
      training: 84,
      verification: 78,
      compliance: 88,
      incident: 68,
      field: 70,
      culture: 90,
    },
    alertCount: 4,
    reportCount: 2,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<SafetyKpiAnalyticsSnapshot>(
    () => readSafetyKpiAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as SafetyKpiAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<SafetyKpiAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:safety-kpi-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:safety-kpi-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function seed() {
  const now = new Date().toISOString();
  const defs: Array<Omit<SafetyKpiLocal, "score" | "forecastValue" | "trend" | "timestamp" | "userId">> = [
    {
      id: "kpi-1",
      name: "Training Completion Rate",
      category: "training",
      formula: "completed / assigned * 100",
      target: 95,
      currentValue: 88,
      baseline: 90,
      history: [84, 86, 87, 88],
    },
    {
      id: "kpi-2",
      name: "Overdue Training Modules",
      category: "training",
      formula: "100 - overdue_ratio * 100",
      target: 95,
      currentValue: 72,
      baseline: 85,
      history: [90, 84, 78, 72],
    },
    {
      id: "kpi-3",
      name: "Verification Pass Rate",
      category: "verification",
      formula: "pass / total_checks * 100",
      target: 92,
      currentValue: 81,
      baseline: 88,
      history: [90, 87, 84, 81],
    },
    {
      id: "kpi-4",
      name: "Workflow Cycle Time",
      category: "verification",
      formula: "100 - normalized_hours",
      target: 85,
      currentValue: 69,
      baseline: 80,
      history: [82, 78, 73, 69],
    },
    {
      id: "kpi-5",
      name: "Document Validity",
      category: "compliance",
      formula: "valid_docs / required_docs * 100",
      target: 98,
      currentValue: 91,
      baseline: 94,
      history: [93, 92, 91, 91],
    },
    {
      id: "kpi-6",
      name: "Requirement Coverage",
      category: "compliance",
      formula: "covered / required * 100",
      target: 100,
      currentValue: 86,
      baseline: 92,
      history: [94, 91, 88, 86],
    },
    {
      id: "kpi-7",
      name: "Incident Frequency Index",
      category: "incident",
      formula: "100 - frequency_index",
      target: 90,
      currentValue: 64,
      baseline: 82,
      history: [80, 74, 69, 64],
    },
    {
      id: "kpi-8",
      name: "Incident Closure Time",
      category: "incident",
      formula: "100 - closure_days_norm",
      target: 85,
      currentValue: 71,
      baseline: 79,
      history: [78, 76, 73, 71],
    },
    {
      id: "kpi-9",
      name: "Field Task Completion",
      category: "field",
      formula: "completed_tasks / assigned * 100",
      target: 90,
      currentValue: 76,
      baseline: 84,
      history: [82, 80, 78, 76],
    },
    {
      id: "kpi-10",
      name: "Hazard Density Control",
      category: "field",
      formula: "100 - hazard_density_norm",
      target: 88,
      currentValue: 58,
      baseline: 75,
      history: [74, 68, 62, 58],
    },
    {
      id: "kpi-11",
      name: "Culture Engagement",
      category: "culture",
      formula: "engaged_workers / workforce * 100",
      target: 80,
      currentValue: 77,
      baseline: 74,
      history: [70, 72, 75, 77],
    },
    {
      id: "kpi-12",
      name: "Behavior Trend Index",
      category: "culture",
      formula: "positive_observations / total * 100",
      target: 85,
      currentValue: 83,
      baseline: 80,
      history: [78, 80, 81, 83],
    },
  ];

  const kpis = defs.map((d) =>
    enrich({
      ...d,
      score: 0,
      forecastValue: 0,
      trend: "flat",
      timestamp: now,
      userId: 1,
    }),
  );

  const alerts: KpiAlertLocal[] = kpis
    .filter((k) => k.score < 70)
    .map((k, i) => ({
      id: `ka-${i + 1}`,
      kpiId: k.id,
      title: "CRITICAL KPI DROP",
      message: `${k.name} scored ${k.score}%.`,
      severity: "critical" as const,
      category: k.category,
      timestamp: now,
      userId: 1,
    }));

  const reports: KpiReportLocal[] = [
    {
      id: "rpt-1",
      title: "Weekly Safety KPI Brief",
      category: "all",
      summary: "Training stable; verification and field hazard density trending down.",
      scoreAverage: clamp(kpis.reduce((s, k) => s + k.score, 0) / kpis.length),
      status: "ready",
      timestamp: now,
      userId: 1,
    },
    {
      id: "rpt-2",
      title: "Incident & Field Deep Dive",
      category: "incident",
      summary: "Incident frequency and hazard density require intervention.",
      scoreAverage: clamp(
        kpis
          .filter((k) => k.category === "incident")
          .reduce((s, k) => s + k.score, 0) /
          Math.max(1, kpis.filter((k) => k.category === "incident").length),
      ),
      status: "draft",
      timestamp: now,
      userId: 1,
    },
  ];

  return { kpis, alerts, reports };
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

function Sparkline({ history, negative }: { history: number[]; negative?: boolean }) {
  const max = Math.max(...history, 1);
  return (
    <div className="flex h-8 items-end gap-0.5">
      {history.map((v, i) => (
        <div
          key={`${i}-${v}`}
          className={cn(
            "w-2",
            negative ? "bg-[#1E6FB8]" : "bg-[linear-gradient(180deg,#8a8a8a_0%,#424242_100%)]",
          )}
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function VeriForgeSafetyKpiIntelligenceSystem() {
  const { push } = useVeriForgeNotifications();
  const initial = React.useMemo(() => seed(), []);
  const [kpis, setKpis] = React.useState(initial.kpis);
  const [alerts, setAlerts] = React.useState(initial.alerts);
  const [reports, setReports] = React.useState(initial.reports);
  const [selectedId, setSelectedId] = React.useState("kpi-1");
  const [filterCategory, setFilterCategory] = React.useState<KpiCategory | "all">("all");
  const notified = React.useRef<Set<string>>(
    new Set(initial.alerts.map((a) => a.kpiId)),
  );
  const seq = React.useRef(40);

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<KpiCategory>("training");
  const [formula, setFormula] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [reportTitle, setReportTitle] = React.useState("");

  const active = kpis.find((k) => k.id === selectedId) ?? kpis[0];
  const visible =
    filterCategory === "all"
      ? kpis
      : kpis.filter((k) => k.category === filterCategory);

  const analytics = React.useMemo(
    () => computeSafetyKpiAnalytics(kpis, alerts, reports),
    [kpis, alerts, reports],
  );

  React.useEffect(() => {
    persistSafetyKpiAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const kpi of kpis) {
      if (kpi.score >= 70) continue;
      if (notified.current.has(kpi.id)) continue;
      notified.current.add(kpi.id);
      const alert: KpiAlertLocal = {
        id: `ka-${seq.current++}`,
        kpiId: kpi.id,
        title: "CRITICAL KPI DROP",
        message: `${kpi.name} scored ${kpi.score}%.`,
        severity: "critical",
        category: kpi.category,
        timestamp: new Date().toISOString(),
        userId: kpi.userId,
      };
      setAlerts((prev) => [alert, ...prev]);
      push({
        category: "compliance",
        tone: "critical",
        title: alert.title,
        message: alert.message,
        forgeStatus: "failed",
        userId: kpi.userId,
        actionLabel: "Open KPIs",
      });
    }
  }, [kpis, push]);

  const defineKpi = () => {
    if (!name.trim() || !formula.trim()) return;
    const targetNum = target.trim() === "" ? null : Number(target);
    const currentValue = 55;
    const history = [51, 53, 55];
    const id = `kpi-${seq.current++}`;
    const kpi = enrich({
      id,
      name: name.trim(),
      category,
      formula: formula.trim(),
      target: Number.isFinite(targetNum as number) ? (targetNum as number) : null,
      currentValue,
      score: 0,
      baseline: currentValue,
      forecastValue: 0,
      trend: "flat",
      history,
      timestamp: new Date().toISOString(),
      userId: 1,
    });
    setKpis((prev) => [kpi, ...prev]);
    setSelectedId(id);
    if (kpi.target === null) {
      setAlerts((prev) => [
        {
          id: `ka-${seq.current++}`,
          kpiId: id,
          title: "MISSING KPI TARGET",
          message: `${kpi.name} has no target defined.`,
          severity: "warning",
          category: kpi.category,
          timestamp: new Date().toISOString(),
          userId: 1,
        },
        ...prev,
      ]);
    }
    setName("");
    setFormula("");
    setTarget("");
  };

  const bumpKpi = (id: string, delta: number) => {
    setKpis((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;
        const currentValue = clamp(k.currentValue + delta);
        const previousScore = k.score;
        const next = enrich({
          ...k,
          currentValue,
          history: [...k.history.slice(-5), currentValue],
          userId: 1,
        });
        if (next.score < 70 && next.score < previousScore) {
          notified.current.delete(id);
        }
        return next;
      }),
    );
  };

  const clearTarget = (id: string) => {
    setKpis((prev) =>
      prev.map((k) => (k.id === id ? enrich({ ...k, target: null }) : k)),
    );
    setAlerts((prev) => [
      {
        id: `ka-${seq.current++}`,
        kpiId: id,
        title: "MISSING KPI TARGET",
        message: `${active?.name ?? "KPI"} has no target defined.`,
        severity: "warning",
        category: active?.category ?? "training",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
  };

  const refreshForecast = (id: string) => {
    setKpis((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;
        const next = enrich(k);
        if (next.forecastValue < 70 && next.trend === "down") {
          notified.current.delete(id);
          setAlerts((a) => [
            {
              id: `ka-${seq.current++}`,
              kpiId: id,
              title: "CRITICAL KPI FORECAST DROP",
              message: `${next.name} forecast ${next.forecastValue}% (trend ${next.trend}).`,
              severity: "critical",
              category: next.category,
              timestamp: new Date().toISOString(),
              userId: 1,
            },
            ...a,
          ]);
          push({
            category: "compliance",
            tone: "critical",
            title: "CRITICAL KPI FORECAST DROP",
            message: `${next.name} forecast ${next.forecastValue}%.`,
            forgeStatus: "failed",
            userId: 1,
          });
        }
        return next;
      }),
    );
  };

  const createReport = () => {
    if (!reportTitle.trim()) return;
    const cat = filterCategory;
    const rows =
      cat === "all" ? kpis : kpis.filter((k) => k.category === cat);
    const scoreAverage =
      rows.length === 0
        ? 0
        : clamp(rows.reduce((s, k) => s + k.score, 0) / rows.length);
    setReports((prev) => [
      {
        id: `rpt-${seq.current++}`,
        title: reportTitle.trim(),
        category: cat,
        summary: `Export-ready ${cat} KPI report · avg score ${scoreAverage}%`,
        scoreAverage,
        status: "ready",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setReportTitle("");
  };

  const exportReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "exported", timestamp: new Date().toISOString() }
          : r,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Safety KPI Intelligence System
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Define, score, forecast, benchmark, alert, and report industrial safety KPIs.
            </p>
          </div>
          <HeatEdgeIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="KPIs" value={String(analytics.totalKpis)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalCount)}
            critical={analytics.criticalCount > 0}
          />
          <Metric
            label="Negative Trends"
            value={String(analytics.negativeTrends)}
            critical={analytics.negativeTrends > 0}
          />
          <Metric
            label="Below Target"
            value={String(analytics.belowTarget)}
            critical={analytics.belowTarget > 0}
          />
        </div>
        <div className="mt-3">
          <VeriForgeProgressBar label="Average KPI Score" value={analytics.averageScore} />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 1. KPI Definition */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. KPI Definition
          </h3>
          <VeriForgeDivider className="my-3" />
          <div
            className={cn(
              "space-y-2 border p-3",
              target.trim() === ""
                ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a1717_0%,#171717_100%)] shadow-[0_0_12px_rgba(30, 111, 184,.2)]"
                : "border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
            )}
          >
            <VeriForgeTextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <VeriForgeSelect
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as KpiCategory)}
              options={CATEGORIES.map((c) => ({
                label: c,
                value: c,
              }))}
            />
            <VeriForgeTextField
              label="Formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
            />
            <VeriForgeTextField
              label="Target (leave blank = missing)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={defineKpi}>
              Create KPI
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 2. KPI Scoring */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. KPI Scoring
          </h3>
          <VeriForgeDivider className="my-3" />
          {active ? (
            <div
              className={cn(
                "border p-3",
                active.score < 70
                  ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a1717_0%,#171717_100%)] shadow-[0_0_14px_rgba(30, 111, 184,.3)]"
                  : "border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
              )}
            >
              <p className="text-sm text-[#FAFAFA]">{active.name}</p>
              <p className="mt-1 text-xs text-[#aaaaaa]">
                {active.category} · {active.formula}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                timestamp: {active.timestamp.slice(0, 19)} · userId: {active.userId} ·
                category: {active.category}
              </p>
              <div className="mt-3">
                <VeriForgeProgressBar label="Score vs target" value={active.score} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <VeriForgeButton size="sm" onClick={() => bumpKpi(active.id, 5)}>
                  +5 Value
                </VeriForgeButton>
                <VeriForgeButton
                  size="sm"
                  variant="secondary"
                  onClick={() => bumpKpi(active.id, -5)}
                >
                  −5 Value
                </VeriForgeButton>
                <VeriForgeButton
                  size="sm"
                  variant="secondary"
                  onClick={() => clearTarget(active.id)}
                >
                  Clear Target
                </VeriForgeButton>
              </div>
              {active.target === null ? (
                <p className="mt-2 text-xs text-[#ffc9c9]">Red glow: missing target.</p>
              ) : null}
            </div>
          ) : null}
        </VeriForgeFrame>
      </div>

      {/* 3. KPI Dashboards */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3. KPI Dashboards
          </h3>
          <VeriForgeSelect
            label="Filter"
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as KpiCategory | "all")
            }
            options={[
              { label: "All categories", value: "all" },
              ...CATEGORIES.map((c) => ({ label: c, value: c })),
            ]}
          />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="mb-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          {CATEGORIES.map((c) => (
            <div key={c} className="border border-[#424242] bg-[#1f1f1f] p-2">
              <div className="mb-1 h-0.5 w-8 bg-[#1E6FB8]" />
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">{c}</p>
              <VeriForgeProgressBar
                label={`${analytics.categoryScores[c]}%`}
                value={analytics.categoryScores[c]}
              />
            </div>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((kpi) => (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setSelectedId(kpi.id)}
              className={cn(
                "border px-3 py-2 text-left",
                selectedId === kpi.id
                  ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                  : kpi.score < 70
                    ? "border-[#1E6FB8] bg-[#1f1f1f] shadow-[0_0_10px_rgba(30, 111, 184,.25)]"
                    : "border-[#424242] bg-[#1f1f1f]",
              )}
            >
              <p className="text-sm text-[#f0f0f0]">{kpi.name}</p>
              <p className="text-xs text-[#aaaaaa]">
                {kpi.category} · value {kpi.currentValue}
                {kpi.target !== null ? ` / target ${kpi.target}` : " · no target"}
              </p>
              <div className="mt-2">
                <VeriForgeProgressBar label={`Score ${kpi.score}%`} value={kpi.score} />
              </div>
            </button>
          ))}
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 4. Forecasting */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. KPI Forecasting
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-2">
            {visible.slice(0, 6).map((kpi) => (
              <div
                key={`fc-${kpi.id}`}
                className={cn(
                  "flex items-center justify-between gap-3 border px-3 py-2",
                  kpi.trend === "down"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)] shadow-[0_0_10px_rgba(30, 111, 184,.25)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#f0f0f0]">{kpi.name}</p>
                  <p className="text-xs text-[#aaaaaa]">
                    trend {kpi.trend} · forecast {kpi.forecastValue}%
                  </p>
                  <div className="mt-2">
                    <Sparkline history={kpi.history} negative={kpi.trend === "down"} />
                  </div>
                </div>
                <VeriForgeButton
                  size="sm"
                  variant="secondary"
                  onClick={() => refreshForecast(kpi.id)}
                >
                  Forecast
                </VeriForgeButton>
              </div>
            ))}
          </div>
        </VeriForgeFrame>

        {/* 5. Alerts */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. KPI Alerts
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "border px-3 py-2",
                  alert.severity === "critical"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{alert.title}</p>
                <p className="text-xs text-[#aaaaaa]">{alert.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  {alert.timestamp.slice(0, 19)} · {alert.category} · userId: {alert.userId}
                </p>
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 6. Benchmarking */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. KPI Benchmarking
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-2">
            {visible.map((kpi) => {
              const delta = kpi.currentValue - kpi.baseline;
              return (
                <div key={`bm-${kpi.id}`} className="border border-[#424242] bg-[#1f1f1f] p-3">
                  <p className="text-sm text-[#f0f0f0]">{kpi.name}</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div className="border border-[#424242] bg-[#151515] px-2 py-1">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                        Baseline
                      </p>
                      <p className="text-sm text-[#cfcfcf]">{kpi.baseline}</p>
                    </div>
                    <div
                      className={cn(
                        "border px-2 py-1",
                        delta < 0
                          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)]"
                          : "border-[#424242] bg-[#151515]",
                      )}
                    >
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                        Current
                      </p>
                      <p className="text-sm text-[#ffc9c9]">
                        {kpi.currentValue}{" "}
                        <span className="text-[10px]">
                          ({delta >= 0 ? "+" : ""}
                          {delta})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </VeriForgeFrame>

        {/* 7. Reporting */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            7. KPI Reporting
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {reports.map((rpt) => (
              <div
                key={rpt.id}
                className="border border-[#6a6a6a] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3"
              >
                <div className="mb-1 h-0.5 w-14 bg-[#1E6FB8]" />
                <p className="text-sm text-[#FAFAFA]">{rpt.title}</p>
                <p className="mt-1 text-xs text-[#aaaaaa]">{rpt.summary}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  {rpt.category} · avg {rpt.scoreAverage}% · {rpt.status} · userId:{" "}
                  {rpt.userId}
                </p>
                {rpt.status !== "exported" ? (
                  <VeriForgeButton
                    className="mt-2"
                    size="sm"
                    onClick={() => exportReport(rpt.id)}
                  >
                    Export Report
                  </VeriForgeButton>
                ) : (
                  <p className="mt-2 text-xs text-[#b8e0b8]">Export-ready layout marked exported.</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <VeriForgeTextField
                label="Report title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <VeriForgeButton onClick={createReport}>Create Report</VeriForgeButton>
            </div>
          </div>
        </VeriForgeFrame>
      </div>

      {active ? (
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8f8f8f]">
          Active KPI metadata · timestamp: {active.timestamp.slice(0, 19)} · userId:{" "}
          {active.userId} · category: {active.category}
        </p>
      ) : null}
      <div className="flex gap-3 text-[#1E6FB8]">
        <AnvilIcon />
        <ForgeBoltIcon />
        <ShieldGridIcon />
      </div>
    </div>
  );
}
