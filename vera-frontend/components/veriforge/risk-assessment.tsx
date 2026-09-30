"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type HazardCategory =
  | "physical"
  | "chemical"
  | "biological"
  | "ergonomic"
  | "psychosocial"
  | "environmental";

export type ControlType = "engineering" | "administrative" | "ppe";
export type RiskBand = "low" | "moderate" | "high" | "critical";

export type RiskControlLocal = {
  id: string;
  type: ControlType;
  name: string;
  description: string;
  implemented: boolean;
};

export type RiskActionLocal = {
  id: string;
  name: string;
  responsiblePerson: string;
  dueDate: string;
  status: "open" | "in_progress" | "done" | "overdue";
};

export type RiskEntryLocal = {
  id: string;
  hazardId: string;
  hazardType: string;
  description: string;
  location: string;
  category: HazardCategory;
  likelihood: number;
  severity: number;
  inherentScore: number;
  residualScore: number;
  band: RiskBand;
  residualBand: RiskBand;
  controls: RiskControlLocal[];
  correctiveActions: RiskActionLocal[];
  evidenceName: string | null;
  reductionPercent: number;
  timestamp: string;
  userId: number;
};

export type RiskAnalyticsSnapshot = {
  totalHazards: number;
  highRiskCount: number;
  criticalCount: number;
  averageInherent: number;
  averageResidual: number;
  controlEffectiveness: number;
  openActions: number;
  distribution: Array<{ band: RiskBand; count: number }>;
  topHazards: Array<{ hazardId: string; title: string; score: number }>;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.risk.analytics";

function clampScale(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function scoreBand(score: number): RiskBand {
  if (score >= 20) return "critical";
  if (score >= 12) return "high";
  if (score >= 6) return "moderate";
  return "low";
}

function recalculate(entry: RiskEntryLocal): RiskEntryLocal {
  const inherentScore = entry.likelihood * entry.severity;
  const implemented = entry.controls.filter((item) => item.implemented).length;
  const total = entry.controls.length;
  const controlFactor = total === 0 ? 0 : implemented / total;
  const actionBoost =
    entry.correctiveActions.filter((item) => item.status === "done").length * 0.05;
  const reduction = Math.min(0.7, controlFactor * 0.55 + actionBoost);
  const residualScore = Math.max(1, Math.round(inherentScore * (1 - reduction)));
  return {
    ...entry,
    inherentScore,
    residualScore,
    band: scoreBand(inherentScore),
    residualBand: scoreBand(residualScore),
    reductionPercent: Math.round(reduction * 100),
  };
}

export function computeRiskAnalytics(entries: RiskEntryLocal[]): RiskAnalyticsSnapshot {
  const total = entries.length;
  const bands: RiskBand[] = ["low", "moderate", "high", "critical"];
  return {
    totalHazards: total,
    highRiskCount: entries.filter((item) => item.band === "high" || item.band === "critical")
      .length,
    criticalCount: entries.filter((item) => item.band === "critical").length,
    averageInherent:
      total === 0
        ? 0
        : Math.round(entries.reduce((sum, item) => sum + item.inherentScore, 0) / total),
    averageResidual:
      total === 0
        ? 0
        : Math.round(entries.reduce((sum, item) => sum + item.residualScore, 0) / total),
    controlEffectiveness:
      total === 0
        ? 0
        : Math.round(entries.reduce((sum, item) => sum + item.reductionPercent, 0) / total),
    openActions: entries.reduce(
      (sum, item) =>
        sum + item.correctiveActions.filter((action) => action.status !== "done").length,
      0,
    ),
    distribution: bands.map((band) => ({
      band,
      count: entries.filter((item) => item.band === band).length,
    })),
    topHazards: [...entries]
      .sort((a, b) => b.inherentScore - a.inherentScore)
      .slice(0, 5)
      .map((item) => ({
        hazardId: item.hazardId,
        title: item.hazardType,
        score: item.inherentScore,
      })),
    timestamp: new Date().toISOString(),
  };
}

export function persistRiskAnalytics(snapshot: RiskAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent("veriforge:risk-analytics", { detail: snapshot }));
}

export function readRiskAnalytics(): RiskAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RiskAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useRiskAnalyticsSync(
  fallback: RiskAnalyticsSnapshot = {
    totalHazards: 2,
    highRiskCount: 1,
    criticalCount: 1,
    averageInherent: 16,
    averageResidual: 10,
    controlEffectiveness: 38,
    openActions: 2,
    distribution: [
      { band: "low", count: 0 },
      { band: "moderate", count: 1 },
      { band: "high", count: 0 },
      { band: "critical", count: 1 },
    ],
    topHazards: [{ hazardId: "hz-1", title: "Hot work spark exposure", score: 20 }],
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<RiskAnalyticsSnapshot>(
    () => readRiskAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as RiskAnalyticsSnapshot);
      } catch {
        // ignore
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<RiskAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:risk-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("veriforge:risk-analytics", onCustom as EventListener);
    };
  }, []);

  return { analytics, setAnalytics };
}

function seedEntries(): RiskEntryLocal[] {
  return [
    recalculate({
      id: "risk-hz-1",
      hazardId: "hz-1",
      hazardType: "Hot work spark exposure",
      description: "Open flame near combustible storage during night shift.",
      location: "Bay 4 · Weld Cell",
      category: "physical",
      likelihood: 4,
      severity: 5,
      inherentScore: 20,
      residualScore: 20,
      band: "critical",
      residualBand: "critical",
      controls: [
        {
          id: "ctl-1",
          type: "engineering",
          name: "Spark containment screen",
          description: "Install fixed metallic spark barrier.",
          implemented: false,
        },
        {
          id: "ctl-2",
          type: "administrative",
          name: "Hot work permit",
          description: "Require signed permit before ignition.",
          implemented: true,
        },
        {
          id: "ctl-3",
          type: "ppe",
          name: "FR clothing",
          description: "Mandatory FR coveralls in cell.",
          implemented: true,
        },
      ],
      correctiveActions: [
        {
          id: "act-1",
          name: "Install spark screen",
          responsiblePerson: "M. Ortega",
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
          status: "open",
        },
      ],
      evidenceName: "bay4-hotwork.jpg",
      reductionPercent: 0,
      timestamp: new Date().toISOString(),
      userId: 1,
    }),
    recalculate({
      id: "risk-hz-2",
      hazardId: "hz-2",
      hazardType: "Solvent vapor inhalation",
      description: "Degreaser use without local exhaust.",
      location: "Paint Prep",
      category: "chemical",
      likelihood: 3,
      severity: 3,
      inherentScore: 9,
      residualScore: 9,
      band: "moderate",
      residualBand: "moderate",
      controls: [
        {
          id: "ctl-4",
          type: "engineering",
          name: "Local exhaust ventilation",
          description: "Capture hood at degrease station.",
          implemented: true,
        },
        {
          id: "ctl-5",
          type: "ppe",
          name: "Organic vapor respirator",
          description: "Half-mask with OV cartridges.",
          implemented: false,
        },
        {
          id: "ctl-6",
          type: "administrative",
          name: "SDS review gate",
          description: "Confirm SDS acknowledgment before use.",
          implemented: true,
        },
      ],
      correctiveActions: [
        {
          id: "act-2",
          name: "Issue respirators + fit test",
          responsiblePerson: "S. Kim",
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
          status: "in_progress",
        },
      ],
      evidenceName: null,
      reductionPercent: 0,
      timestamp: new Date().toISOString(),
      userId: 1,
    }),
  ];
}

export function RiskBandBadge({ band }: { band: RiskBand }) {
  const styles: Record<RiskBand, string> = {
    low: "border-[#4a654a] bg-[rgba(74,101,74,.2)] text-[#b8e0b8]",
    moderate: "border-[#6a5a2a] bg-[rgba(120,100,40,.2)] text-[#f0e0a8]",
    high: "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9] shadow-[0_0_10px_rgba(30, 111, 184,.35)]",
    critical:
      "border-[#1E6FB8] bg-[rgba(30, 111, 184,.3)] text-[#ffd0d0] shadow-[0_0_14px_rgba(30, 111, 184,.5)]",
  };
  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
        styles[band],
      )}
    >
      {band}
    </span>
  );
}

export function VeriForgeRiskMatrix({
  entries,
  activeLikelihood,
  activeSeverity,
}: {
  entries: RiskEntryLocal[];
  activeLikelihood?: number;
  activeSeverity?: number;
}) {
  const counts = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));
  for (const entry of entries) {
    counts[5 - entry.likelihood][entry.severity - 1] += 1;
  }

  return (
    <div className="border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
      <p className={cn(veriforgeTypography.heading, "mb-3 text-[11px] text-[#FAFAFA]")}>
        Risk Matrix · Likelihood × Severity
      </p>
      <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-1">
        <div />
        {[1, 2, 3, 4, 5].map((sev) => (
          <div
            key={`sev-${sev}`}
            className="text-center text-[10px] uppercase tracking-[0.08em] text-[#9f9f9f]"
          >
            S{sev}
          </div>
        ))}
        {[5, 4, 3, 2, 1].map((lik, rowIdx) => (
          <React.Fragment key={`row-${lik}`}>
            <div className="grid place-items-center pr-1 text-[10px] text-[#9f9f9f]">L{lik}</div>
            {[1, 2, 3, 4, 5].map((sev, colIdx) => {
              const score = lik * sev;
              const band = scoreBand(score);
              const count = counts[rowIdx][colIdx];
              const active = activeLikelihood === lik && activeSeverity === sev;
              const hot = band === "high" || band === "critical";
              return (
                <div
                  key={`${lik}-${sev}`}
                  className={cn(
                    "grid aspect-square place-items-center border text-[10px] font-semibold",
                    hot
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.28)] text-[#ffd0d0] shadow-[0_0_10px_rgba(30, 111, 184,.35)]"
                      : band === "moderate"
                        ? "border-[#6a5a2a] bg-[rgba(120,100,40,.18)] text-[#f0e0a8]"
                        : "border-[#424242] bg-[#1A1A1A] text-[#c8c8c8]",
                    active && "ring-1 ring-[#1E6FB8]",
                  )}
                  title={`L${lik}×S${sev}=${score}`}
                >
                  {count > 0 ? count : score}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function VeriForgeRiskAssessmentEngine() {
  const { push } = useVeriForgeNotifications();
  const [entries, setEntries] = React.useState<RiskEntryLocal[]>(() => seedEntries());
  const [selectedId, setSelectedId] = React.useState("risk-hz-1");
  const notified = React.useRef<Set<string>>(new Set(["risk-hz-1"]));
  const idSeq = React.useRef(20);

  const [hazardType, setHazardType] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [category, setCategory] = React.useState<HazardCategory>("physical");
  const [likelihood, setLikelihood] = React.useState(3);
  const [severity, setSeverity] = React.useState(3);
  const [evidenceName, setEvidenceName] = React.useState("");
  const [controlName, setControlName] = React.useState("");
  const [controlType, setControlType] = React.useState<ControlType>("engineering");
  const [actionName, setActionName] = React.useState("");
  const [actionOwner, setActionOwner] = React.useState("");
  const [actionDue, setActionDue] = React.useState("");

  const selected = entries.find((item) => item.id === selectedId) ?? entries[0];
  const analytics = React.useMemo(() => computeRiskAnalytics(entries), [entries]);

  React.useEffect(() => {
    persistRiskAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const entry of entries) {
      if (entry.band !== "high" && entry.band !== "critical") continue;
      if (notified.current.has(entry.id)) continue;
      notified.current.add(entry.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "HIGH RISK HAZARD",
        message: `${entry.hazardType} scored ${entry.inherentScore} (${entry.band}).`,
        forgeStatus: "failed",
        userId: entry.userId,
        actionLabel: "Open Risk Engine",
      });
    }
  }, [entries, push]);

  const updateSelected = (mutator: (item: RiskEntryLocal) => RiskEntryLocal) => {
    if (!selected) return;
    setEntries((prev) =>
      prev.map((item) => (item.id === selected.id ? recalculate(mutator(item)) : item)),
    );
  };

  const identify = () => {
    if (!hazardType.trim() || !description.trim() || !location.trim()) return;
    const hazardId = `hz-${idSeq.current++}`;
    const entry = recalculate({
      id: `risk-${hazardId}`,
      hazardId,
      hazardType: hazardType.trim(),
      description: description.trim(),
      location: location.trim(),
      category,
      likelihood: clampScale(likelihood),
      severity: clampScale(severity),
      inherentScore: 0,
      residualScore: 0,
      band: "low",
      residualBand: "low",
      controls: [
        {
          id: `ctl-${idSeq.current++}`,
          type: "engineering",
          name: "Engineering control",
          description: "Engineered barrier recommendation.",
          implemented: false,
        },
        {
          id: `ctl-${idSeq.current++}`,
          type: "administrative",
          name: "Administrative control",
          description: "Procedure / permit recommendation.",
          implemented: false,
        },
        {
          id: `ctl-${idSeq.current++}`,
          type: "ppe",
          name: "PPE control",
          description: "PPE last-line recommendation.",
          implemented: false,
        },
      ],
      correctiveActions: [],
      evidenceName: evidenceName.trim() || null,
      reductionPercent: 0,
      timestamp: new Date().toISOString(),
      userId: 1,
    });
    setEntries((prev) => [entry, ...prev]);
    setSelectedId(entry.id);
    setHazardType("");
    setDescription("");
    setLocation("");
    setEvidenceName("");
  };

  const applyScore = () => {
    if (!selected) return;
    updateSelected((item) => ({
      ...item,
      likelihood: clampScale(likelihood),
      severity: clampScale(severity),
    }));
  };

  const addControl = () => {
    if (!controlName.trim() || !selected) return;
    updateSelected((item) => ({
      ...item,
      controls: [
        {
          id: `ctl-${idSeq.current++}`,
          type: controlType,
          name: controlName.trim(),
          description: `${controlType} recommendation`,
          implemented: false,
        },
        ...item.controls,
      ],
    }));
    setControlName("");
  };

  const addAction = () => {
    if (!actionName.trim() || !actionOwner.trim() || !actionDue || !selected) return;
    updateSelected((item) => ({
      ...item,
      correctiveActions: [
        {
          id: `act-${idSeq.current++}`,
          name: actionName.trim(),
          responsiblePerson: actionOwner.trim(),
          dueDate: actionDue,
          status: "open",
        },
        ...item.correctiveActions,
      ],
    }));
    setActionName("");
    setActionOwner("");
    setActionDue("");
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Risk Assessment Engine
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Identify hazards, score risk, recommend controls, and track corrective actions.
            </p>
          </div>
          <ShieldGridIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Hazards" value={String(analytics.totalHazards)} />
          <Metric
            label="High / Critical"
            value={String(analytics.highRiskCount)}
            critical={analytics.highRiskCount > 0}
          />
          <Metric label="Avg Inherent" value={String(analytics.averageInherent)} />
          <Metric label="Control Effect" value={`${analytics.controlEffectiveness}%`} />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <VeriForgeProgressBar label="Risk Reduction" value={analytics.controlEffectiveness} />
          <VeriForgeProgressBar
            label="Residual vs Max (25)"
            value={Math.round((analytics.averageResidual / 25) * 100)}
          />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Hazard Identification
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeTextField
              label="Hazard Type"
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value)}
              placeholder="e.g. Hot work spark exposure"
            />
            <VeriForgeTextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <VeriForgeSelect
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as HazardCategory)}
                options={[
                  { label: "Physical", value: "physical" },
                  { label: "Chemical", value: "chemical" },
                  { label: "Biological", value: "biological" },
                  { label: "Ergonomic", value: "ergonomic" },
                  { label: "Psychosocial", value: "psychosocial" },
                  { label: "Environmental", value: "environmental" },
                ]}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeSelect
                label="Likelihood (1–5)"
                value={String(likelihood)}
                onChange={(e) => setLikelihood(Number(e.target.value))}
                options={[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))}
              />
              <VeriForgeSelect
                label="Severity (1–5)"
                value={String(severity)}
                onChange={(e) => setSeverity(Number(e.target.value))}
                options={[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) }))}
              />
            </div>
            <div className="border border-[#424242] bg-[linear-gradient(160deg,#222_0%,#171717_100%)] p-3">
              <VeriForgeTextField
                label="Evidence Upload"
                value={evidenceName}
                onChange={(e) => setEvidenceName(e.target.value)}
                placeholder="photo-or-doc-name.jpg"
              />
            </div>
            <VeriForgeButton className="w-full" onClick={identify}>
              Identify Hazard
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "mb-3 text-sm text-[#FAFAFA]")}>
            2. Risk Scoring Matrix
          </h3>
          <VeriForgeRiskMatrix
            entries={entries}
            activeLikelihood={selected?.likelihood}
            activeSeverity={selected?.severity}
          />
          {selected ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-[#b8b8b8]">
                Selected: {selected.hazardType} · L{selected.likelihood}×S{selected.severity}=
                {selected.inherentScore}
              </p>
              <VeriForgeButton variant="secondary" className="w-full" onClick={applyScore}>
                Apply Score To Selected
              </VeriForgeButton>
            </div>
          ) : null}
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. Risk Register
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-2">
            {entries.map((item) => {
              const hot = item.band === "high" || item.band === "critical";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setLikelihood(item.likelihood);
                    setSeverity(item.severity);
                  }}
                  className={cn(
                    "w-full border px-3 py-2 text-left transition",
                    selectedId === item.id
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                      : hot
                        ? "border-[#1E6FB8] bg-[#1f1f1f]"
                        : "border-[#424242] bg-[#1f1f1f] hover:border-[#6a6a6a]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-[#f0f0f0]">{item.hazardType}</p>
                      <p className="text-xs text-[#aaaaaa]">
                        {item.location} · {item.category}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                        timestamp: {item.timestamp.slice(0, 19)} · userId: {item.userId} ·
                        hazardId: {item.hazardId}
                      </p>
                    </div>
                    <div className="text-right">
                      <RiskBandBadge band={item.band} />
                      <p className="mt-1 text-xs text-[#ffb8b8]">{item.inherentScore}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </VeriForgeFrame>

        {selected ? (
          <div className="space-y-4">
            <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
              <div className="mb-3 flex items-center gap-2">
                <AnvilIcon className="text-[#1E6FB8]" />
                <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                  3. Control Recommendations · {selected.hazardType}
                </h3>
              </div>
              <div className="space-y-2">
                {selected.controls.map((control) => (
                  <div
                    key={control.id}
                    className={cn(
                      "border bg-[#1f1f1f] px-3 py-2",
                      control.implemented
                        ? "border-[#424242]"
                        : "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.28)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-[#f0f0f0]">{control.name}</p>
                        <p className="text-xs text-[#aaaaaa]">
                          {control.type} · {control.description}
                        </p>
                      </div>
                      <VeriForgeButton
                        size="sm"
                        variant={control.implemented ? "secondary" : "primary"}
                        onClick={() =>
                          updateSelected((item) => ({
                            ...item,
                            controls: item.controls.map((row) =>
                              row.id === control.id
                                ? { ...row, implemented: !row.implemented }
                                : row,
                            ),
                          }))
                        }
                      >
                        {control.implemented ? "Done" : "Missing"}
                      </VeriForgeButton>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                <VeriForgeTextField
                  label="Control Name"
                  value={controlName}
                  onChange={(e) => setControlName(e.target.value)}
                />
                <VeriForgeSelect
                  label="Type"
                  value={controlType}
                  onChange={(e) => setControlType(e.target.value as ControlType)}
                  options={[
                    { label: "Engineering", value: "engineering" },
                    { label: "Administrative", value: "administrative" },
                    { label: "PPE", value: "ppe" },
                  ]}
                />
                <div className="flex items-end">
                  <VeriForgeButton onClick={addControl}>Add</VeriForgeButton>
                </div>
              </div>
              <div className="mt-3">
                <VeriForgeProgressBar
                  label="Risk Reduction"
                  value={selected.reductionPercent}
                />
                <p className="mt-2 text-xs text-[#b8b8b8]">
                  Residual {selected.residualScore} ({selected.residualBand}) from inherent{" "}
                  {selected.inherentScore}
                </p>
              </div>
            </VeriForgeFrame>

            <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
              <div className="mb-3 flex items-center gap-2">
                <ForgeBoltIcon className="text-[#1E6FB8]" />
                <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                  4. Corrective Actions
                </h3>
              </div>
              <div className="space-y-2">
                {selected.correctiveActions.length === 0 ? (
                  <p className="text-sm text-[#b8b8b8]">No corrective actions yet.</p>
                ) : (
                  selected.correctiveActions.map((action) => (
                    <div
                      key={action.id}
                      className="border border-[#424242] bg-[#1f1f1f] px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-[#f0f0f0]">{action.name}</p>
                          <p className="text-xs text-[#aaaaaa]">
                            {action.responsiblePerson} · due {action.dueDate} · {action.status}
                          </p>
                        </div>
                        {action.status !== "done" ? (
                          <VeriForgeButton
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              updateSelected((item) => ({
                                ...item,
                                correctiveActions: item.correctiveActions.map((row) =>
                                  row.id === action.id ? { ...row, status: "done" } : row,
                                ),
                              }))
                            }
                          >
                            Complete
                          </VeriForgeButton>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 space-y-2">
                <VeriForgeTextField
                  label="Action Name"
                  value={actionName}
                  onChange={(e) => setActionName(e.target.value)}
                />
                <div className="grid gap-2 md:grid-cols-2">
                  <VeriForgeTextField
                    label="Responsible Person"
                    value={actionOwner}
                    onChange={(e) => setActionOwner(e.target.value)}
                  />
                  <VeriForgeTextField
                    label="Due Date"
                    type="date"
                    value={actionDue}
                    onChange={(e) => setActionDue(e.target.value)}
                  />
                </div>
                <VeriForgeButton className="w-full" onClick={addAction}>
                  Add Corrective Action
                </VeriForgeButton>
              </div>
            </VeriForgeFrame>
          </div>
        ) : null}
      </div>

      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="mb-3 flex items-center gap-2">
          <HeatEdgeIcon className="text-[#1E6FB8]" />
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. Analytics & Reporting
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {analytics.distribution.map((row) => (
            <div
              key={row.band}
              className={cn(
                "border bg-[#1f1f1f] px-3 py-2",
                row.band === "high" || row.band === "critical"
                  ? "border-[#1E6FB8]"
                  : "border-[#424242]",
              )}
            >
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">{row.band}</p>
              <p className="mt-1 text-lg text-[#FAFAFA]">{row.count}</p>
              <div className="mt-2 h-2 border border-[#424242] bg-[#121212]">
                <div
                  className="h-full bg-[linear-gradient(90deg,#174F86_0%,#1E6FB8_100%)]"
                  style={{
                    width: `${Math.min(100, (row.count / Math.max(analytics.totalHazards, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="border border-[#424242] bg-[#1f1f1f] p-3">
            <p className={cn(veriforgeTypography.heading, "mb-2 text-[11px] text-[#FAFAFA]")}>
              Top Hazards
            </p>
            <ul className="space-y-2">
              {analytics.topHazards.map((item) => (
                <li
                  key={item.hazardId}
                  className="flex items-center justify-between text-sm text-[#d0d0d0]"
                >
                  <span>{item.title}</span>
                  <span className="text-[#ffb8b8]">{item.score}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-[#424242] bg-[#1f1f1f] p-3">
            <p className={cn(veriforgeTypography.heading, "mb-2 text-[11px] text-[#FAFAFA]")}>
              Control Effectiveness
            </p>
            <VeriForgeProgressBar
              label="Average reduction"
              value={analytics.controlEffectiveness}
            />
            <p className="mt-2 text-xs text-[#b8b8b8]">
              Open corrective actions: {analytics.openActions}. Scores sync to dashboard and
              mobile.
            </p>
          </div>
        </div>
      </VeriForgeFrame>
    </div>
  );
}

function Metric({
  label,
  value,
  critical = false,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-[#424242] bg-[#1f1f1f] px-3 py-2",
        critical && "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.35)]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">{label}</p>
      <p className="mt-1 text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}
