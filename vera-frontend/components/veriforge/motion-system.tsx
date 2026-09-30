"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";
import { VeriForgeBrandMark } from "./brand-story";
import { veriforgeTokens } from "./tokens";

export type MotionCategory =
  | "logo"
  | "button"
  | "panel"
  | "card"
  | "workflow"
  | "notification"
  | "chart";

export type MotionWeight = "fast" | "medium" | "heavy";
export type MotionSignal = "active" | "critical" | "neutral" | "intentional";

export type MotionSpecLocal = {
  id: string;
  category: MotionCategory;
  name: string;
  description: string;
  durationMs: number;
  weight: MotionWeight;
  easing: string;
  cssClass: string;
  signal: MotionSignal;
  principles: string[];
};

export type MotionAnalyticsSnapshot = {
  totalSpecs: number;
  playCount: number;
  criticalPlays: number;
  averageDurationMs: number;
  motionCoverageScore: number;
  categoryCounts: Record<MotionCategory, number>;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.motion.analytics";

const CATEGORIES: MotionCategory[] = [
  "logo",
  "button",
  "panel",
  "card",
  "workflow",
  "notification",
  "chart",
];

export const VERIFORGE_MOTION_SPECS: MotionSpecLocal[] = [
  {
    id: "mot-logo-glow",
    category: "logo",
    name: "Forged V Red Glow",
    description: "Emblem glows forge red with industrial pulse",
    durationMs: 1800,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-motion-logo-glow",
    signal: "active",
    principles: ["Red glow activation", "Heavy industrial weight"],
  },
  {
    id: "mot-logo-shine",
    category: "logo",
    name: "Metallic Shine Sweep",
    description: "Angular metallic shine across forged V",
    durationMs: 1600,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-motion-logo-shine",
    signal: "neutral",
    principles: ["Metallic transitions", "Angular movement"],
  },
  {
    id: "mot-logo-expand",
    category: "logo",
    name: "Angular Expansion",
    description: "Logo expands with angular skew settle",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-logo",
    signal: "intentional",
    principles: ["Angular movement", "Precision timing"],
  },
  {
    id: "mot-btn-glow",
    category: "button",
    name: "Red Metallic Hover Glow",
    description: "Primary CTA glow on hover",
    durationMs: 150,
    weight: "fast",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-btn",
    signal: "active",
    principles: ["Red glow activation", "Fast activation"],
  },
  {
    id: "mot-btn-press",
    category: "button",
    name: "Angular Press",
    description: "Press skew + translate with rebound",
    durationMs: 150,
    weight: "fast",
    easing: veriforgeTokens.motion.easeRebound,
    cssClass: "vf-motion-btn-rebound",
    signal: "intentional",
    principles: ["Angular movement", "Steel-grey rebound"],
  },
  {
    id: "mot-panel-slide",
    category: "panel",
    name: "Angular Slide-In",
    description: "Panel enters with metallic fade",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-panel",
    signal: "intentional",
    principles: ["Angular movement", "Metallic transitions"],
  },
  {
    id: "mot-panel-accent",
    category: "panel",
    name: "Red Accent Line Reveal",
    description: "Forge-red rule scales in from left",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-accent-line",
    signal: "active",
    principles: ["Red glow activation", "Precision timing"],
  },
  {
    id: "mot-card-lift",
    category: "card",
    name: "Angular Lift Hover",
    description: "Card lifts with metallic shadow expansion",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-card",
    signal: "intentional",
    principles: ["Angular movement", "Metallic transitions"],
  },
  {
    id: "mot-card-active",
    category: "card",
    name: "Active Red Glow",
    description: "Active card border + red metallic glow",
    durationMs: 150,
    weight: "fast",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-card-active",
    signal: "active",
    principles: ["Red glow = active or critical"],
  },
  {
    id: "mot-wf-node",
    category: "workflow",
    name: "Node Activation",
    description: "Angular node scale + glow",
    durationMs: 150,
    weight: "fast",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-node",
    signal: "active",
    principles: ["Angular node activation", "Precision timing"],
  },
  {
    id: "mot-wf-connector",
    category: "workflow",
    name: "Connector Pulse",
    description: "Metallic connector pulse between nodes",
    durationMs: 1100,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-motion-connector",
    signal: "neutral",
    principles: ["Metallic connector pulse"],
  },
  {
    id: "mot-notif-drop",
    category: "notification",
    name: "Angular Drop-In",
    description: "Notification drops in with angular settle",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-notif",
    signal: "intentional",
    principles: ["Angular drop-in"],
  },
  {
    id: "mot-notif-critical",
    category: "notification",
    name: "Critical Red Flash",
    description: "Red metallic flash for critical alerts",
    durationMs: 900,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-motion-notif-critical",
    signal: "critical",
    principles: ["Red metallic flash", "Red glow = critical"],
  },
  {
    id: "mot-chart-line",
    category: "chart",
    name: "Metallic Line Draw",
    description: "SVG stroke draws with industrial easing",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-line",
    signal: "intentional",
    principles: ["Metallic line draw", "Heavy industrial motions"],
  },
  {
    id: "mot-chart-bar",
    category: "chart",
    name: "Angular Bar Rise",
    description: "Bars rise from baseline",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-motion-bar",
    signal: "intentional",
    principles: ["Angular bar rise"],
  },
  {
    id: "mot-chart-kpi",
    category: "chart",
    name: "Critical KPI Pulse",
    description: "Red highlight pulse for critical KPIs",
    durationMs: 1200,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-motion-kpi-pulse",
    signal: "critical",
    principles: ["Red highlight pulse", "Red glow = critical"],
  },
];

export function computeMotionAnalytics(
  playCount: number,
  criticalPlays: number,
  specs: MotionSpecLocal[] = VERIFORGE_MOTION_SPECS,
): MotionAnalyticsSnapshot {
  const categoryCounts = Object.fromEntries(
    CATEGORIES.map((c) => [c, specs.filter((s) => s.category === c).length]),
  ) as Record<MotionCategory, number>;
  const covered = CATEGORIES.filter((c) => categoryCounts[c] > 0).length;
  return {
    totalSpecs: specs.length,
    playCount,
    criticalPlays,
    averageDurationMs:
      specs.length === 0
        ? 0
        : Math.round(specs.reduce((s, x) => s + x.durationMs, 0) / specs.length),
    motionCoverageScore: Math.round((covered / CATEGORIES.length) * 100),
    categoryCounts,
    timestamp: new Date().toISOString(),
  };
}

export function persistMotionAnalytics(snapshot: MotionAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:motion-analytics", { detail: snapshot }),
  );
}

export function readMotionAnalytics(): MotionAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MotionAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useMotionAnalyticsSync(
  fallback: MotionAnalyticsSnapshot = computeMotionAnalytics(0, 0),
) {
  const [analytics, setAnalytics] = React.useState<MotionAnalyticsSnapshot>(
    () => readMotionAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as MotionAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<MotionAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:motion-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("veriforge:motion-analytics", onCustom as EventListener);
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

function SignalChip({ signal }: { signal: MotionSignal }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        signal === "critical" || signal === "active"
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
          : signal === "intentional"
            ? "border-[#424242] bg-[#1f1f1f] text-[#cfcfcf]"
            : "border-[#424242] bg-[#151515] text-[#9f9f9f]",
      )}
    >
      {signal}
    </span>
  );
}

export function VeriForgeIndustrialMotionSystem() {
  const { push } = useVeriForgeNotifications();
  const [category, setCategory] = React.useState<MotionCategory>("logo");
  const [playCount, setPlayCount] = React.useState(0);
  const [criticalPlays, setCriticalPlays] = React.useState(0);
  const [logoKey, setLogoKey] = React.useState(0);
  const [panelKey, setPanelKey] = React.useState(0);
  const [cardActive, setCardActive] = React.useState(false);
  const [workflowKey, setWorkflowKey] = React.useState(0);
  const [notifKey, setNotifKey] = React.useState(0);
  const [notifOut, setNotifOut] = React.useState(false);
  const [chartKey, setChartKey] = React.useState(0);
  const [activeNode, setActiveNode] = React.useState(1);

  const analytics = React.useMemo(
    () => computeMotionAnalytics(playCount, criticalPlays),
    [playCount, criticalPlays],
  );

  React.useEffect(() => {
    persistMotionAnalytics(analytics);
  }, [analytics]);

  const recordPlay = (spec: MotionSpecLocal) => {
    setPlayCount((n) => n + 1);
    if (spec.signal === "critical") {
      setCriticalPlays((n) => n + 1);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL MOTION SIGNAL",
        message: `${spec.name} — red metallic critical path.`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Motion",
      });
    }
  };

  const specs = VERIFORGE_MOTION_SPECS.filter((s) => s.category === category);

  const replayLogo = () => {
    setLogoKey((k) => k + 1);
    recordPlay(VERIFORGE_MOTION_SPECS.find((s) => s.id === "mot-logo-expand")!);
  };

  const replayPanel = () => {
    setPanelKey((k) => k + 1);
    recordPlay(VERIFORGE_MOTION_SPECS.find((s) => s.id === "mot-panel-slide")!);
  };

  const replayWorkflow = () => {
    setWorkflowKey((k) => k + 1);
    setActiveNode(0);
    window.setTimeout(() => setActiveNode(1), 120);
    window.setTimeout(() => setActiveNode(2), 280);
    window.setTimeout(() => setActiveNode(3), 440);
    recordPlay(VERIFORGE_MOTION_SPECS.find((s) => s.id === "mot-wf-node")!);
  };

  const replayNotif = (critical: boolean) => {
    setNotifOut(false);
    setNotifKey((k) => k + 1);
    recordPlay(
      VERIFORGE_MOTION_SPECS.find((s) =>
        critical ? s.id === "mot-notif-critical" : s.id === "mot-notif-drop",
      )!,
    );
  };

  const fadeNotif = () => {
    setNotifOut(true);
  };

  const replayChart = () => {
    setChartKey((k) => k + 1);
    recordPlay(VERIFORGE_MOTION_SPECS.find((s) => s.id === "mot-chart-bar")!);
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Industrial UX Motion System
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Angular movement · metallic transitions · red glow · industrial weight · precision
              timing
            </p>
            <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
            <div className="border border-[#424242] bg-[#1f1f1f] px-2 py-1">
              Fast
              <br />
              <span className="text-[#FAFAFA]">{veriforgeTokens.motion.durationFast}</span>
            </div>
            <div className="border border-[#424242] bg-[#1f1f1f] px-2 py-1">
              Medium
              <br />
              <span className="text-[#FAFAFA]">{veriforgeTokens.motion.durationMedium}</span>
            </div>
            <div className="border border-[#424242] bg-[#1f1f1f] px-2 py-1">
              Heavy
              <br />
              <span className="text-[#FAFAFA]">{veriforgeTokens.motion.durationHeavy}</span>
            </div>
          </div>
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Specs" value={String(analytics.totalSpecs)} />
          <Metric label="Plays" value={String(analytics.playCount)} />
          <Metric
            label="Critical Plays"
            value={String(analytics.criticalPlays)}
            critical={analytics.criticalPlays > 0}
          />
          <Metric label="Coverage" value={`${analytics.motionCoverageScore}%`} />
        </div>
        <div className="mt-3">
          <VeriForgeProgressBar
            label="Motion Coverage Score"
            value={analytics.motionCoverageScore}
          />
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
          Red glow = active/critical · Metallic fade = neutral · Angular = intentional · Easing:{" "}
          {veriforgeTokens.motion.easeAngular}
        </p>
      </VeriForgeFrame>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "border px-3 py-1.5 font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em]",
              category === c
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#FAFAFA] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                : "border-[#424242] bg-[#1f1f1f] text-[#aaaaaa]",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Spec list */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
          Motion Specs — {category}
        </h3>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-2 md:grid-cols-2">
          {specs.map((spec) => (
            <div
              key={spec.id}
              className={cn(
                "border px-3 py-2",
                spec.signal === "critical"
                  ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)]"
                  : "border-[#424242] bg-[#1f1f1f]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-[#FAFAFA]">{spec.name}</p>
                <SignalChip signal={spec.signal} />
              </div>
              <p className="mt-1 text-xs text-[#aaaaaa]">{spec.description}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                {spec.weight} · {spec.durationMs}ms · {spec.cssClass}
              </p>
            </div>
          ))}
        </div>
      </VeriForgeFrame>

      {/* 1. Logo Motion */}
      {category === "logo" ? (
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Logo Motion
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="flex flex-wrap items-center gap-6">
            <div
              key={logoKey}
              className="vf-motion-logo vf-motion-logo-glow vf-motion-logo-shine relative"
            >
              <VeriForgeBrandMark />
            </div>
            <div className="space-y-2 text-sm text-[#cfcfcf]">
              <p>Red glow · metallic shine sweep · angular expansion</p>
              <VeriForgeButton onClick={replayLogo}>Replay Logo Motion</VeriForgeButton>
            </div>
          </div>
        </VeriForgeFrame>
      ) : null}

      {/* 2. Button Motion */}
      {category === "button" ? (
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Button Motion
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={cn(
                "vf-motion-btn rounded-[3px] border border-[#1F2328] bg-[#2A2E33] px-5 py-3 font-[var(--vf-font-primary)] text-xs font-medium tracking-[0.02em] text-[#F4F6F8] transition hover:-translate-y-px hover:bg-[#3B3F45]",
              )}
              onClick={() =>
                recordPlay(VERIFORGE_MOTION_SPECS.find((s) => s.id === "mot-btn-press")!)
              }
            >
              Hover · Press · Rebound
            </button>
            <VeriForgeButton
              variant="secondary"
              className="vf-motion-btn vf-motion-btn-rebound"
              onClick={() =>
                recordPlay(VERIFORGE_MOTION_SPECS.find((s) => s.id === "mot-btn-glow")!)
              }
            >
              Steel Secondary
            </VeriForgeButton>
          </div>
          <p className="mt-3 text-xs text-[#aaaaaa]">
            Red metallic glow on hover · angular press · steel-grey rebound
          </p>
        </VeriForgeFrame>
      ) : null}

      {/* 3. Panel Motion */}
      {category === "panel" ? (
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3. Panel Motion
          </h3>
          <VeriForgeDivider className="my-3" />
          <VeriForgeButton className="mb-3" onClick={replayPanel}>
            Replay Panel Slide
          </VeriForgeButton>
          <div
            key={panelKey}
            className="vf-motion-panel border border-[#424242] bg-[linear-gradient(160deg,#1A1A1A_0%,#121212_48%,#242424_100%)] p-4"
          >
            <p className="text-sm text-[#FAFAFA]">Angular slide-in panel</p>
            <div className="vf-motion-accent-line mt-3 w-28" />
            <p className="mt-2 text-xs text-[#aaaaaa]">
              Metallic gradient fade · red accent line reveal
            </p>
          </div>
        </VeriForgeFrame>
      ) : null}

      {/* 4. Card Motion */}
      {category === "card" ? (
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. Card Motion
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setCardActive(n === 2);
                  recordPlay(
                    VERIFORGE_MOTION_SPECS.find((s) =>
                      n === 2 ? s.id === "mot-card-active" : s.id === "mot-card-lift",
                    )!,
                  );
                }}
                className={cn(
                  "vf-motion-card border border-[#424242] bg-[#1f1f1f] p-4 text-left",
                  cardActive && n === 2 && "vf-motion-card-active",
                )}
              >
                <p className="text-sm text-[#FAFAFA]">Card {n}</p>
                <p className="mt-1 text-xs text-[#aaaaaa]">
                  Hover for angular lift · click for active glow
                </p>
              </button>
            ))}
          </div>
        </VeriForgeFrame>
      ) : null}

      {/* 5. Workflow Motion */}
      {category === "workflow" ? (
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. Workflow Motion
          </h3>
          <VeriForgeDivider className="my-3" />
          <VeriForgeButton className="mb-4" onClick={replayWorkflow}>
            Activate Nodes
          </VeriForgeButton>
          <div key={workflowKey} className="flex items-center gap-0">
            {[1, 2, 3].map((n, idx) => (
              <React.Fragment key={n}>
                <div
                  className={cn(
                    "grid h-12 w-12 place-items-center border text-xs uppercase",
                    activeNode >= n
                      ? "vf-motion-node border-[#1E6FB8] bg-[rgba(30, 111, 184,.25)] text-[#ffc9c9]"
                      : "border-[#424242] bg-[#1f1f1f] text-[#8f8f8f]",
                    activeNode === n && n === 3 && "shadow-[0_0_16px_rgba(30, 111, 184,.55)]",
                  )}
                >
                  {n}
                </div>
                {idx < 2 ? (
                  <div
                    className={cn(
                      "h-0.5 w-10 bg-[#424242]",
                      activeNode > n && "vf-motion-connector bg-[#1E6FB8]",
                    )}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#aaaaaa]">
            Angular node activation · metallic connector pulse · red glow for active/failed
          </p>
        </VeriForgeFrame>
      ) : null}

      {/* 6. Notification Motion */}
      {category === "notification" ? (
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. Notification Motion
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 flex flex-wrap gap-2">
            <VeriForgeButton onClick={() => replayNotif(false)}>Drop-In</VeriForgeButton>
            <VeriForgeButton onClick={() => replayNotif(true)}>Critical Flash</VeriForgeButton>
            <VeriForgeButton variant="secondary" onClick={fadeNotif}>
              Steel Fade-Out
            </VeriForgeButton>
          </div>
          <div
            key={notifKey}
            className={cn(
              "border border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] p-3",
              notifOut ? "vf-motion-notif-out" : "vf-motion-notif-critical",
            )}
          >
            <p className="text-sm text-[#FAFAFA]">CRITICAL FIELD ALERT</p>
            <p className="text-xs text-[#ffc9c9]">
              Angular drop-in · red metallic flash · steel-grey fade-out
            </p>
          </div>
        </VeriForgeFrame>
      ) : null}

      {/* 7. Chart Motion */}
      {category === "chart" ? (
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            7. Chart Motion
          </h3>
          <VeriForgeDivider className="my-3" />
          <VeriForgeButton className="mb-4" onClick={replayChart}>
            Replay Chart Motion
          </VeriForgeButton>
          <div key={chartKey} className="grid gap-4 md:grid-cols-2">
            <div className="border border-[#424242] bg-[#151515] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                Metallic line draw
              </p>
              <svg viewBox="0 0 120 48" className="h-16 w-full" aria-hidden>
                <polyline
                  className="vf-motion-line"
                  fill="none"
                  stroke="#1E6FB8"
                  strokeWidth="2"
                  points="0,40 20,28 40,32 60,18 80,22 100,8 120,14"
                />
              </svg>
            </div>
            <div className="border border-[#424242] bg-[#151515] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                Angular bar rise · KPI pulse
              </p>
              <div className="flex h-16 items-end gap-2">
                {[40, 65, 35, 80, 55].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "vf-motion-bar w-6 bg-[linear-gradient(180deg,#8a8a8a_0%,#424242_100%)]",
                      i === 3 && "vf-motion-kpi-pulse bg-[#1E6FB8]",
                    )}
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </VeriForgeFrame>
      ) : null}

      <div className="border border-[#424242] bg-[#151515] p-3 text-xs text-[#cfcfcf]">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffc9c9]">
          Timing & Interaction Rules
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Fast activation 120–180ms · Medium 240–320ms · Heavy 400–600ms</li>
          <li>Easing: cubic-bezier with angular acceleration</li>
          <li>Red glow = active or critical · Metallic fade = neutral · Angular = intentional</li>
          <li>Respects prefers-reduced-motion</li>
        </ul>
      </div>

      <div className="flex gap-3 text-[#1E6FB8]">
        <AnvilIcon />
        <ForgeBoltIcon />
        <ShieldGridIcon />
        <HeatEdgeIcon />
      </div>
    </div>
  );
}
