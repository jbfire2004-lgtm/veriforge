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
  IconIncidentSeverity,
  IconRiskHazard,
  IconComplianceExpiry,
  IconTrainingProgress,
  IconEquipmentDefect,
  IconFieldHazard,
  IconRiskScoring,
} from "./icons";

export type PredictionType =
  | "incident"
  | "risk"
  | "compliance"
  | "training"
  | "equipment"
  | "fieldHazard"
  | "kpiTrend";

export type ModelKind =
  | "timeSeries"
  | "riskScoring"
  | "classification"
  | "anomaly"
  | "predictiveScore";

export type ClassificationLabel = "pass" | "fail" | "critical";
export type DataDomain =
  | "training"
  | "verification"
  | "compliance"
  | "incident"
  | "equipment"
  | "fieldOps"
  | "culture";

export type PredictionLocal = {
  id: string;
  type: PredictionType;
  title: string;
  summary: string;
  score: number;
  confidence: number;
  classification: ClassificationLabel;
  modelId: string;
  modelKind: ModelKind;
  inputs: DataDomain[];
  horizonDays: number;
  series: number[];
  timestamp: string;
  userId: number;
};

export type RiskZoneLocal = {
  id: string;
  label: string;
  likelihood: number;
  severity: number;
  score: number;
  predicted: boolean;
  timestamp: string;
};

export type ModelSpecLocal = {
  id: string;
  name: string;
  kind: ModelKind;
  description: string;
  inputs: DataDomain[];
  version: string;
};

export type PredictiveAnalyticsSnapshot = {
  totalPredictions: number;
  criticalCount: number;
  averageScore: number;
  averageConfidence: number;
  typeCounts: Record<PredictionType, number>;
  highRiskZones: number;
  modelCount: number;
  predictiveHealthScore: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.predictive.analytics";

const TYPES: PredictionType[] = [
  "incident",
  "risk",
  "compliance",
  "training",
  "equipment",
  "fieldHazard",
  "kpiTrend",
];

const TYPE_LABEL: Record<PredictionType, string> = {
  incident: "Incident",
  risk: "Risk",
  compliance: "Compliance",
  training: "Training",
  equipment: "Equipment",
  fieldHazard: "Field Hazard",
  kpiTrend: "KPI Trend",
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function classify(score: number): ClassificationLabel {
  if (score >= 75) return "critical";
  if (score >= 50) return "fail";
  return "pass";
}

const SEED_MODELS: ModelSpecLocal[] = [
  {
    id: "mdl-ts-incident",
    name: "Incident Time-Series",
    kind: "timeSeries",
    description: "Forecasts incident probability from severity/frequency history",
    inputs: ["incident", "fieldOps", "culture"],
    version: "1.4.0",
  },
  {
    id: "mdl-risk-matrix",
    name: "Risk Scoring Matrix",
    kind: "riskScoring",
    description: "Industrial 0–100 risk score from likelihood × severity",
    inputs: ["incident", "equipment", "fieldOps"],
    version: "2.1.0",
  },
  {
    id: "mdl-clf-compliance",
    name: "Compliance Classifier",
    kind: "classification",
    description: "Pass/fail/critical lapse classification from expiry gaps",
    inputs: ["compliance", "training", "verification"],
    version: "1.2.1",
  },
  {
    id: "mdl-anom-equip",
    name: "Equipment Anomaly Detector",
    kind: "anomaly",
    description: "Detects defect/inspection anomalies for failure modeling",
    inputs: ["equipment", "fieldOps"],
    version: "1.0.3",
  },
  {
    id: "mdl-score-kpi",
    name: "KPI Predictive Scorer",
    kind: "predictiveScore",
    description: "0–100 industrial predictive score across KPI trends",
    inputs: [
      "training",
      "verification",
      "compliance",
      "incident",
      "equipment",
      "fieldOps",
      "culture",
    ],
    version: "3.0.0",
  },
];

const SEED_PREDICTIONS: PredictionLocal[] = [
  {
    id: "pred-incident-01",
    type: "incident",
    title: "Incident Probability · Cell B",
    summary: "Elevated likelihood from severity clustering and overdue CAPA",
    score: 78,
    confidence: 86,
    classification: "critical",
    modelId: "mdl-ts-incident",
    modelKind: "timeSeries",
    inputs: ["incident", "fieldOps", "culture"],
    horizonDays: 14,
    series: [42, 48, 55, 61, 68, 74, 78],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "pred-risk-01",
    type: "risk",
    title: "Site Risk Forecast",
    summary: "High-risk zone expansion on crane path and confined space",
    score: 72,
    confidence: 81,
    classification: "fail",
    modelId: "mdl-risk-matrix",
    modelKind: "riskScoring",
    inputs: ["incident", "equipment", "fieldOps"],
    horizonDays: 21,
    series: [50, 54, 58, 63, 67, 70, 72],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "pred-comp-01",
    type: "compliance",
    title: "Compliance Lapse Forecast",
    summary: "Document expiry cluster predicted within 10 days",
    score: 81,
    confidence: 90,
    classification: "critical",
    modelId: "mdl-clf-compliance",
    modelKind: "classification",
    inputs: ["compliance", "training", "verification"],
    horizonDays: 10,
    series: [35, 44, 52, 60, 68, 75, 81],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "pred-train-01",
    type: "training",
    title: "Training Failure Prediction",
    summary: "Overdue modules and low quiz scores signal fail risk",
    score: 64,
    confidence: 77,
    classification: "fail",
    modelId: "mdl-clf-compliance",
    modelKind: "classification",
    inputs: ["training", "verification"],
    horizonDays: 7,
    series: [40, 45, 50, 55, 58, 61, 64],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "pred-equip-01",
    type: "equipment",
    title: "Equipment Failure · Crane-04",
    summary: "Anomaly spike in defect rate and inspection misses",
    score: 69,
    confidence: 84,
    classification: "fail",
    modelId: "mdl-anom-equip",
    modelKind: "anomaly",
    inputs: ["equipment", "fieldOps"],
    horizonDays: 30,
    series: [30, 38, 45, 52, 58, 64, 69],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "pred-field-01",
    type: "fieldHazard",
    title: "Field Hazard Forecast",
    summary: "GPS-clustered hazard density rising on Zone 3",
    score: 58,
    confidence: 73,
    classification: "fail",
    modelId: "mdl-ts-incident",
    modelKind: "timeSeries",
    inputs: ["fieldOps", "incident"],
    horizonDays: 5,
    series: [28, 34, 40, 46, 51, 55, 58],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
  {
    id: "pred-kpi-01",
    type: "kpiTrend",
    title: "KPI Trend Analysis",
    summary: "Composite industrial score trending down across domains",
    score: 47,
    confidence: 88,
    classification: "pass",
    modelId: "mdl-score-kpi",
    modelKind: "predictiveScore",
    inputs: [
      "training",
      "verification",
      "compliance",
      "incident",
      "equipment",
      "fieldOps",
      "culture",
    ],
    horizonDays: 28,
    series: [72, 68, 64, 60, 55, 51, 47],
    timestamp: new Date().toISOString(),
    userId: 1,
  },
];

const SEED_ZONES: RiskZoneLocal[] = [
  { id: "rz-1", label: "Crane Path", likelihood: 4, severity: 5, score: 88, predicted: true, timestamp: new Date().toISOString() },
  { id: "rz-2", label: "Confined Space", likelihood: 3, severity: 5, score: 76, predicted: true, timestamp: new Date().toISOString() },
  { id: "rz-3", label: "Hot Work Bay", likelihood: 3, severity: 3, score: 52, predicted: false, timestamp: new Date().toISOString() },
  { id: "rz-4", label: "Muster Gate", likelihood: 2, severity: 2, score: 28, predicted: false, timestamp: new Date().toISOString() },
  { id: "rz-5", label: "Zone 3 Field", likelihood: 4, severity: 4, score: 80, predicted: true, timestamp: new Date().toISOString() },
  { id: "rz-6", label: "Tool Crib", likelihood: 1, severity: 2, score: 18, predicted: false, timestamp: new Date().toISOString() },
];

export function computePredictiveAnalytics(
  predictions: PredictionLocal[],
  zones: RiskZoneLocal[],
  modelCount: number,
): PredictiveAnalyticsSnapshot {
  const typeCounts = Object.fromEntries(TYPES.map((t) => [t, 0])) as Record<
    PredictionType,
    number
  >;
  for (const p of predictions) typeCounts[p.type] += 1;
  const criticalCount = predictions.filter((p) => p.classification === "critical").length;
  const averageScore =
    predictions.length === 0
      ? 0
      : clamp(predictions.reduce((s, p) => s + p.score, 0) / predictions.length);
  const averageConfidence =
    predictions.length === 0
      ? 0
      : clamp(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length);
  const highRiskZones = zones.filter((z) => z.score >= 70 || z.predicted).length;
  const predictiveHealthScore = clamp(
    100 - criticalCount * 12 - highRiskZones * 4 + averageConfidence * 0.15,
  );
  return {
    totalPredictions: predictions.length,
    criticalCount,
    averageScore,
    averageConfidence,
    typeCounts,
    highRiskZones,
    modelCount,
    predictiveHealthScore,
    timestamp: new Date().toISOString(),
  };
}

export function persistPredictiveAnalytics(snapshot: PredictiveAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:predictive-analytics", { detail: snapshot }),
  );
}

export function readPredictiveAnalytics(): PredictiveAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PredictiveAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function usePredictiveAnalyticsSync(
  fallback: PredictiveAnalyticsSnapshot = computePredictiveAnalytics(
    SEED_PREDICTIONS,
    SEED_ZONES,
    SEED_MODELS.length,
  ),
) {
  const [analytics, setAnalytics] = React.useState<PredictiveAnalyticsSnapshot>(
    () => readPredictiveAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as PredictiveAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<PredictiveAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:predictive-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:predictive-analytics",
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

function ClassChip({ label }: { label: ClassificationLabel }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        label === "critical"
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.25)] text-[#ffc9c9]"
          : label === "fail"
            ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.1)] text-[#ffb0b0]"
            : "border-[#424242] bg-[#151515] text-[#9f9f9f]",
      )}
    >
      {label}
    </span>
  );
}

function Sparkline({
  series,
  critical,
}: {
  series: number[];
  critical?: boolean;
}) {
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
        className={critical ? "vf-motion-line" : undefined}
      />
      {critical ? (
        <circle
          cx={100}
          cy={36 - (series[series.length - 1] / max) * 32}
          r="2.5"
          fill="#1E6FB8"
          className="vf-motion-kpi-pulse"
        />
      ) : null}
    </svg>
  );
}

function TypeIcon({ type, tone }: { type: PredictionType; tone?: "critical" | "neutral" }) {
  const t = tone === "critical" ? "critical" : "neutral";
  const props = { size: 22, tone: t as "critical" | "neutral" };
  switch (type) {
    case "incident":
      return <IconIncidentSeverity {...props} />;
    case "risk":
      return <IconRiskHazard {...props} />;
    case "compliance":
      return <IconComplianceExpiry {...props} />;
    case "training":
      return <IconTrainingProgress {...props} />;
    case "equipment":
      return <IconEquipmentDefect {...props} />;
    case "fieldHazard":
      return <IconFieldHazard {...props} />;
    case "kpiTrend":
      return <IconRiskScoring {...props} />;
    default:
      return <ForgeBoltIcon />;
  }
}

function pickModel(type: PredictionType, models: ModelSpecLocal[]) {
  return (
    models.find((m) =>
      type === "equipment"
        ? m.kind === "anomaly"
        : type === "risk"
          ? m.kind === "riskScoring"
          : type === "kpiTrend"
            ? m.kind === "predictiveScore"
            : type === "compliance" || type === "training"
              ? m.kind === "classification"
              : m.kind === "timeSeries",
    ) ?? models[0]
  );
}

export function VeriForgeSafetyAiPredictiveEngine() {
  const { push } = useVeriForgeNotifications();
  const [predictions, setPredictions] = React.useState<PredictionLocal[]>(SEED_PREDICTIONS);
  const [zones] = React.useState<RiskZoneLocal[]>(SEED_ZONES);
  const [models] = React.useState<ModelSpecLocal[]>(SEED_MODELS);
  const [filter, setFilter] = React.useState<PredictionType | "all">("all");
  const [runType, setRunType] = React.useState<PredictionType>("incident");
  const [selectedId, setSelectedId] = React.useState<string | null>(SEED_PREDICTIONS[0]?.id ?? null);
  const seq = React.useRef(30);
  const notified = React.useRef<Set<string>>(new Set());

  const analytics = React.useMemo(
    () => computePredictiveAnalytics(predictions, zones, models.length),
    [predictions, zones, models.length],
  );

  React.useEffect(() => {
    persistPredictiveAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const p of predictions) {
      if (p.classification !== "critical") continue;
      if (notified.current.has(p.id)) continue;
      notified.current.add(p.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL PREDICTION",
        message: `${p.title} · score ${p.score} · confidence ${p.confidence}% · ${p.modelId}`,
        forgeStatus: "failed",
        userId: p.userId,
        actionLabel: "Open Predictive",
      });
    }
  }, [predictions, push]);

  const filtered =
    filter === "all" ? predictions : predictions.filter((p) => p.type === filter);
  const selected = predictions.find((p) => p.id === selectedId) ?? filtered[0];

  const runPrediction = () => {
    const model = pickModel(runType, models);
    const base = 40 + Math.floor(Math.random() * 45) + (runType === "incident" ? 10 : 0);
    const series: number[] = [];
    let cursor = clamp(base - 30);
    for (let i = 0; i < 7; i++) {
      cursor = clamp(cursor + 3 + Math.floor(Math.random() * 6));
      series.push(cursor);
    }
    const score = series[series.length - 1];
    const prediction: PredictionLocal = {
      id: `pred-${seq.current++}`,
      type: runType,
      title: `${TYPE_LABEL[runType]} Forecast · Run ${seq.current}`,
      summary: `Model ${model.id} forecast · industrial predictive run`,
      score,
      confidence: clamp(70 + Math.floor(Math.random() * 25)),
      classification: classify(score),
      modelId: model.id,
      modelKind: model.kind,
      inputs: model.inputs,
      horizonDays: runType === "fieldHazard" ? 5 : 14,
      series,
      timestamp: new Date().toISOString(),
      userId: 1,
    };
    setPredictions((prev) => [prediction, ...prev]);
    setSelectedId(prediction.id);
  };

  const refreshSelected = () => {
    if (!selected) return;
    setPredictions((prev) =>
      prev.map((p) => {
        if (p.id !== selected.id) return p;
        const score = clamp(p.score + Math.floor(Math.random() * 11) - 4);
        return {
          ...p,
          score,
          confidence: clamp(p.confidence + Math.floor(Math.random() * 5) - 2),
          classification: classify(score),
          series: [...p.series.slice(1), score],
          timestamp: new Date().toISOString(),
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Safety AI Predictive Engine
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#b8b8b8]">
              Incident · risk · compliance · training · equipment · field hazard · KPI
              trends — with model metadata, confidence, and red-glow critical alerts.
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
          <Metric label="Predictions" value={String(analytics.totalPredictions)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalCount)}
            critical={analytics.criticalCount > 0}
          />
          <Metric label="Confidence" value={`${analytics.averageConfidence}%`} />
          <Metric label="Health" value={`${analytics.predictiveHealthScore}%`} />
        </div>

        <div className="mt-4">
          <VeriForgeProgressBar
            label={`Predictive health · high-risk zones ${analytics.highRiskZones}`}
            value={analytics.predictiveHealthScore}
          />
        </div>
      </VeriForgeFrame>

      {/* 1. Prediction Dashboard */}
      <VeriForgeFrame>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
            1 · Prediction Dashboard
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "border px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
                filter === "all"
                  ? "border-[#1E6FB8] text-[#ffc9c9]"
                  : "border-[#424242] text-[#9f9f9f]",
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
                  "border px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
                  filter === t
                    ? "border-[#1E6FB8] text-[#ffc9c9]"
                    : "border-[#424242] text-[#9f9f9f]",
                )}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const critical = p.classification === "critical";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "border p-4 text-left transition",
                  "bg-[linear-gradient(160deg,#1A1A1A_0%,#121212_48%,#242424_100%)]",
                  selectedId === p.id || critical
                    ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.35)]"
                    : "border-[#424242] hover:border-[#1E6FB8]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TypeIcon type={p.type} tone={critical ? "critical" : "neutral"} />
                    <div>
                      <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#8a8a8a]">{TYPE_LABEL[p.type]}</p>
                    </div>
                  </div>
                  <ClassChip label={p.classification} />
                </div>
                <p className="mt-3 text-xs text-[#b8b8b8]">{p.summary}</p>
                <div className="mt-3">
                  <Sparkline series={p.series} critical={critical} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                  <span>Score {p.score}</span>
                  <span>·</span>
                  <span>Conf {p.confidence}%</span>
                  <span>·</span>
                  <span>{p.modelId}</span>
                </div>
              </button>
            );
          })}
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 2. Risk Forecasting */}
        <VeriForgeFrame>
          <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
            2 · Risk Forecasting
          </p>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Angular risk matrix · metallic gradient · red glow for predicted high-risk
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {zones.map((z) => (
              <div
                key={z.id}
                className={cn(
                  "border p-3",
                  z.score >= 70 || z.predicted
                    ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a1010_0%,#1A1A1A_55%,#3a1515_100%)] shadow-[0_0_12px_rgba(30, 111, 184,.4)]"
                    : "border-[#424242] bg-[linear-gradient(145deg,#1A1A1A_0%,#242424_100%)]",
                )}
              >
                <p className="font-[var(--vf-font-primary)] text-[10px] uppercase tracking-[0.1em] text-[#FAFAFA]">
                  {z.label}
                </p>
                <p className="mt-2 text-lg text-[#FAFAFA]">{z.score}</p>
                <p className="text-[9px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                  L{z.likelihood} × S{z.severity}
                  {z.predicted ? " · predicted" : ""}
                </p>
              </div>
            ))}
          </div>
        </VeriForgeFrame>

        {/* Detail / run */}
        <VeriForgeFrame>
          <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
            Run · Refresh · Metadata
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-[160px] flex-1">
              <VeriForgeSelect
                label="Prediction type"
                value={runType}
                onChange={(e) => setRunType(e.target.value as PredictionType)}
                options={TYPES.map((t) => ({ label: TYPE_LABEL[t], value: t }))}
              />
            </div>
            <VeriForgeButton onClick={runPrediction}>Run model</VeriForgeButton>
            <VeriForgeButton variant="secondary" onClick={refreshSelected}>
              Refresh selected
            </VeriForgeButton>
          </div>

          {selected ? (
            <div
              className={cn(
                "mt-4 border p-4",
                selected.classification === "critical"
                  ? "border-[#1E6FB8] shadow-[0_0_14px_rgba(30, 111, 184,.3)]"
                  : "border-[#424242]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.12em] text-[#FAFAFA]">
                  {selected.title}
                </p>
                <ClassChip label={selected.classification} />
              </div>
              <p className="mt-2 text-xs text-[#b8b8b8]">{selected.summary}</p>
              <div className="mt-3">
                <Sparkline
                  series={selected.series}
                  critical={selected.classification === "critical"}
                />
              </div>
              <VeriForgeProgressBar
                label={`Predictive score · horizon ${selected.horizonDays}d`}
                value={selected.score}
              />
              <div className="mt-3 space-y-1 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                <p>timestamp · {selected.timestamp}</p>
                <p>modelId · {selected.modelId}</p>
                <p>confidence · {selected.confidence}%</p>
                <p>kind · {selected.modelKind}</p>
                <p>inputs · {selected.inputs.join(", ")}</p>
              </div>
            </div>
          ) : null}
        </VeriForgeFrame>
      </div>

      {/* 3–6 focused cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(["incident", "compliance", "equipment", "kpiTrend"] as PredictionType[]).map(
          (type) => {
            const row = predictions.find((p) => p.type === type);
            if (!row) return null;
            const critical = row.classification === "critical";
            const titles: Record<string, string> = {
              incident: "3 · Incident Prediction",
              compliance: "4 · Compliance Prediction",
              equipment: "5 · Equipment Failure",
              kpiTrend: "6 · KPI Trend Analysis",
            };
            return (
              <div
                key={type}
                className={cn(
                  "border p-4",
                  "bg-[linear-gradient(160deg,#1A1A1A_0%,#151515_50%,#222_100%)]",
                  critical
                    ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.4)]"
                    : "border-[#424242]",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn(veriforgeTypography.heading, "text-[10px] text-[#d0d0d0]")}>
                    {titles[type]}
                  </p>
                  <TypeIcon type={type} tone={critical ? "critical" : "neutral"} />
                </div>
                <p className="mt-3 font-[var(--vf-font-primary)] text-2xl text-[#FAFAFA]">
                  {row.score}
                  <span className="ml-1 text-xs text-[#8a8a8a]">/100</span>
                </p>
                <p className="mt-1 text-xs text-[#b8b8b8]">{row.title}</p>
                <div className="mt-3">
                  <Sparkline series={row.series} critical={critical || type === "kpiTrend"} />
                </div>
                {type === "equipment" ? (
                  <VeriForgeProgressBar label="Failure probability" value={row.score} />
                ) : null}
                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                  {row.modelId} · conf {row.confidence}%
                </p>
              </div>
            );
          },
        )}
      </div>

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          AI Models
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {models.map((m) => (
            <div key={m.id} className="border border-[#424242] bg-[#1f1f1f] p-3">
              <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                {m.name}
              </p>
              <p className="mt-1 text-xs text-[#9f9f9f]">{m.description}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                {m.kind} · v{m.version} · {m.id}
              </p>
            </div>
          ))}
        </div>
        <VeriForgeDivider className="my-4" />
        <p className="text-xs text-[#8a8a8a]">
          Data inputs: training · verification · compliance · incident · equipment ·
          fieldOps · culture. All predictions carry timestamp, modelId, and confidence.
        </p>
      </VeriForgeFrame>
    </div>
  );
}
