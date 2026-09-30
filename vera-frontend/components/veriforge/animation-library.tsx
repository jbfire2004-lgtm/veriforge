"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";
import { veriforgeTokens } from "./tokens";

export type AnimationPrimitive =
  | "angularSlide"
  | "metallicFade"
  | "redGlowPulse"
  | "bevelShift"
  | "industrialDrop";

export type AnimationComponent =
  | "buttons"
  | "cards"
  | "panels"
  | "modals"
  | "workflow"
  | "charts";

export type AnimationWeight = "fast" | "medium" | "heavy";
export type AnimationSignal = "active" | "critical" | "neutral" | "intentional";

export type AnimationSpecLocal = {
  id: string;
  name: string;
  category: "primitive" | AnimationComponent;
  primitive?: AnimationPrimitive;
  description: string;
  durationMs: number;
  weight: AnimationWeight;
  easing: string;
  cssClass: string;
  signal: AnimationSignal;
  principles: string[];
};

export type AnimationAnalyticsSnapshot = {
  totalSpecs: number;
  playCount: number;
  criticalPlays: number;
  primitiveCount: number;
  componentCount: number;
  averageDurationMs: number;
  animationCoverageScore: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.animation.analytics";

const PRIMITIVES: AnimationPrimitive[] = [
  "angularSlide",
  "metallicFade",
  "redGlowPulse",
  "bevelShift",
  "industrialDrop",
];

const COMPONENTS: AnimationComponent[] = [
  "buttons",
  "cards",
  "panels",
  "modals",
  "workflow",
  "charts",
];

export const VERIFORGE_ANIMATION_SPECS: AnimationSpecLocal[] = [
  {
    id: "an-prim-slide",
    name: "Angular Slide",
    category: "primitive",
    primitive: "angularSlide",
    description: "Linear, sharp directional movement — no curves",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-angular-slide",
    signal: "intentional",
    principles: ["Angular movement", "Precision timing"],
  },
  {
    id: "an-prim-fade",
    name: "Metallic Fade",
    category: "primitive",
    primitive: "metallicFade",
    description: "Gradient fade from steel-grey to black",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-anim-metallic-fade",
    signal: "neutral",
    principles: ["Metallic transitions", "Heavy industrial weight"],
  },
  {
    id: "an-prim-glow",
    name: "Red Glow Pulse",
    category: "primitive",
    primitive: "redGlowPulse",
    description: "Critical activation pulse in forge red",
    durationMs: 1000,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-anim-red-glow-pulse",
    signal: "critical",
    principles: ["Red glow activation", "Heavy industrial weight"],
  },
  {
    id: "an-prim-bevel",
    name: "Bevel Shift",
    category: "primitive",
    primitive: "bevelShift",
    description: "Metallic edge highlight movement",
    durationMs: 1400,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-anim-bevel-shift",
    signal: "active",
    principles: ["Metallic transitions", "Angular movement"],
  },
  {
    id: "an-prim-drop",
    name: "Industrial Drop",
    category: "primitive",
    primitive: "industrialDrop",
    description: "Heavy downward motion with angular deceleration",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-industrial-drop",
    signal: "intentional",
    principles: ["Heavy industrial weight", "Precision timing"],
  },
  {
    id: "an-btn-hover",
    name: "Button Hover Glow",
    category: "buttons",
    description: "Red metallic glow on hover",
    durationMs: 150,
    weight: "fast",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-btn-hover",
    signal: "active",
    principles: ["Red glow activation", "Fast activation"],
  },
  {
    id: "an-btn-press",
    name: "Button Angular Press",
    category: "buttons",
    description: "Angular compression on press",
    durationMs: 150,
    weight: "fast",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-btn-press",
    signal: "intentional",
    principles: ["Angular movement", "Precision timing"],
  },
  {
    id: "an-btn-release",
    name: "Button Steel Rebound",
    category: "buttons",
    description: "Steel-grey rebound on release",
    durationMs: 150,
    weight: "fast",
    easing: veriforgeTokens.motion.easeRebound,
    cssClass: "vf-anim-btn-rebound",
    signal: "neutral",
    principles: ["Metallic transitions", "Precision timing"],
  },
  {
    id: "an-card-hover",
    name: "Card Angular Lift",
    category: "cards",
    description: "Angular lift + metallic shadow expansion",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-card-lift",
    signal: "intentional",
    principles: ["Angular movement", "Metallic transitions"],
  },
  {
    id: "an-card-active",
    name: "Card Active Glow",
    category: "cards",
    description: "Red glow pulse for active state",
    durationMs: 1000,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-anim-card-active",
    signal: "critical",
    principles: ["Red glow activation"],
  },
  {
    id: "an-card-dismiss",
    name: "Card Angular Dismiss",
    category: "cards",
    description: "Angular slide-out dismiss",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-card-dismiss",
    signal: "intentional",
    principles: ["Angular movement"],
  },
  {
    id: "an-panel-in",
    name: "Panel Slide-In",
    category: "panels",
    description: "Angular direction + metallic fade",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-panel-in",
    signal: "intentional",
    principles: ["Angular movement", "Metallic transitions"],
  },
  {
    id: "an-panel-expand",
    name: "Panel Expand Bevel",
    category: "panels",
    description: "Bevel shift + red accent reveal",
    durationMs: 280,
    weight: "medium",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-anim-panel-expand",
    signal: "active",
    principles: ["Metallic transitions", "Red glow activation"],
  },
  {
    id: "an-modal-open",
    name: "Modal Industrial Drop",
    category: "modals",
    description: "Industrial drop + metallic fade",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-modal-open",
    signal: "intentional",
    principles: ["Heavy industrial weight", "Metallic transitions"],
  },
  {
    id: "an-modal-close",
    name: "Modal Angular Collapse",
    category: "modals",
    description: "Angular collapse on close",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-modal-close",
    signal: "intentional",
    principles: ["Angular movement", "Heavy industrial weight"],
  },
  {
    id: "an-wf-activate",
    name: "Node Activation Glow",
    category: "workflow",
    description: "Red glow pulse on node activation",
    durationMs: 150,
    weight: "fast",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-node-activate",
    signal: "active",
    principles: ["Red glow activation"],
  },
  {
    id: "an-wf-connect",
    name: "Metallic Connector Draw",
    category: "workflow",
    description: "Metallic line draw between nodes",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-connector-draw",
    signal: "neutral",
    principles: ["Metallic transitions"],
  },
  {
    id: "an-wf-error",
    name: "Node Error Shake",
    category: "workflow",
    description: "Angular shake + red flash",
    durationMs: 400,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-node-error",
    signal: "critical",
    principles: ["Angular movement", "Red glow activation"],
  },
  {
    id: "an-chart-line",
    name: "Metallic Line Draw",
    category: "charts",
    description: "Metallic stroke animation",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-chart-line",
    signal: "neutral",
    principles: ["Metallic transitions", "Precision timing"],
  },
  {
    id: "an-chart-bar",
    name: "Angular Bar Rise",
    category: "charts",
    description: "Angular upward bar motion",
    durationMs: 500,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeAngular,
    cssClass: "vf-anim-chart-bar",
    signal: "intentional",
    principles: ["Angular movement"],
  },
  {
    id: "an-chart-kpi",
    name: "KPI Red Pulse",
    category: "charts",
    description: "Red highlight pulse for critical KPIs",
    durationMs: 1200,
    weight: "heavy",
    easing: veriforgeTokens.motion.easeIndustrial,
    cssClass: "vf-anim-kpi-pulse",
    signal: "critical",
    principles: ["Red glow activation"],
  },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeAnimationAnalytics(
  playCount: number,
  criticalPlays: number,
): AnimationAnalyticsSnapshot {
  const primitiveCount = VERIFORGE_ANIMATION_SPECS.filter(
    (s) => s.category === "primitive",
  ).length;
  const componentCount = VERIFORGE_ANIMATION_SPECS.length - primitiveCount;
  const averageDurationMs = clamp(
    VERIFORGE_ANIMATION_SPECS.reduce((s, a) => s + a.durationMs, 0) /
      VERIFORGE_ANIMATION_SPECS.length,
  );
  const animationCoverageScore = clamp(
    (VERIFORGE_ANIMATION_SPECS.length / 21) * 70 + Math.min(playCount, 30),
  );
  return {
    totalSpecs: VERIFORGE_ANIMATION_SPECS.length,
    playCount,
    criticalPlays,
    primitiveCount,
    componentCount,
    averageDurationMs,
    animationCoverageScore,
    timestamp: new Date().toISOString(),
  };
}

export function persistAnimationAnalytics(snapshot: AnimationAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:animation-analytics", { detail: snapshot }),
  );
}

export function readAnimationAnalytics(): AnimationAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnimationAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useAnimationAnalyticsSync(
  fallback: AnimationAnalyticsSnapshot = computeAnimationAnalytics(0, 0),
) {
  const [analytics, setAnalytics] = React.useState<AnimationAnalyticsSnapshot>(
    () => readAnimationAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as AnimationAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<AnimationAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:animation-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:animation-analytics",
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

function SignalChip({ signal }: { signal: AnimationSignal }) {
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

type FilterKey = "all" | "primitive" | AnimationComponent;

export function VeriForgeIndustrialAnimationLibrary() {
  const { push } = useVeriForgeNotifications();
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [playCount, setPlayCount] = React.useState(0);
  const [criticalPlays, setCriticalPlays] = React.useState(0);
  const [demoKey, setDemoKey] = React.useState(0);
  const [btnPhase, setBtnPhase] = React.useState<"idle" | "press" | "rebound">("idle");
  const [cardActive, setCardActive] = React.useState(false);
  const [cardDismiss, setCardDismiss] = React.useState(false);
  const [panelKey, setPanelKey] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalClosing, setModalClosing] = React.useState(false);
  const [nodeActive, setNodeActive] = React.useState(false);
  const [nodeError, setNodeError] = React.useState(false);
  const [connectorKey, setConnectorKey] = React.useState(0);
  const [chartKey, setChartKey] = React.useState(0);

  const analytics = React.useMemo(
    () => computeAnimationAnalytics(playCount, criticalPlays),
    [playCount, criticalPlays],
  );

  React.useEffect(() => {
    persistAnimationAnalytics(analytics);
  }, [analytics]);

  const filtered = VERIFORGE_ANIMATION_SPECS.filter((s) => {
    if (filter === "all") return true;
    if (filter === "primitive") return s.category === "primitive";
    return s.category === filter;
  });

  const recordPlay = (spec: AnimationSpecLocal) => {
    setPlayCount((n) => n + 1);
    if (spec.signal === "critical") {
      setCriticalPlays((n) => n + 1);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL ANIMATION SIGNAL",
        message: `${spec.name} — red glow / error path activated.`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Animations",
      });
    }
  };

  const replay = (spec: AnimationSpecLocal) => {
    recordPlay(spec);
    setDemoKey((k) => k + 1);

    if (spec.category === "buttons") {
      if (spec.id === "an-btn-press") {
        setBtnPhase("press");
        window.setTimeout(() => setBtnPhase("rebound"), 160);
        window.setTimeout(() => setBtnPhase("idle"), 320);
      } else if (spec.id === "an-btn-release") {
        setBtnPhase("rebound");
        window.setTimeout(() => setBtnPhase("idle"), 180);
      }
    }
    if (spec.category === "cards") {
      if (spec.id === "an-card-active") setCardActive(true);
      if (spec.id === "an-card-dismiss") {
        setCardDismiss(true);
        window.setTimeout(() => setCardDismiss(false), 320);
      }
    }
    if (spec.category === "panels") setPanelKey((k) => k + 1);
    if (spec.category === "modals") {
      if (spec.id === "an-modal-open") {
        setModalClosing(false);
        setModalOpen(true);
      }
      if (spec.id === "an-modal-close") {
        setModalClosing(true);
        window.setTimeout(() => {
          setModalOpen(false);
          setModalClosing(false);
        }, 520);
      }
    }
    if (spec.category === "workflow") {
      if (spec.id === "an-wf-activate") {
        setNodeActive(true);
        setNodeError(false);
      }
      if (spec.id === "an-wf-connect") setConnectorKey((k) => k + 1);
      if (spec.id === "an-wf-error") {
        setNodeError(true);
        setNodeActive(false);
        window.setTimeout(() => setNodeError(false), 450);
      }
    }
    if (spec.category === "charts") setChartKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Industrial Animation Library
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#b8b8b8]">
              Angular · metallic · red-glow · 120–600ms · cubic-bezier industrial easing
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
          <Metric label="Specs" value={String(analytics.totalSpecs)} />
          <Metric label="Plays" value={String(analytics.playCount)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalPlays)}
            critical={analytics.criticalPlays > 0}
          />
          <Metric label="Coverage" value={`${analytics.animationCoverageScore}%`} />
        </div>

        <div className="mt-4">
          <VeriForgeProgressBar
            label={`Library coverage · primitives ${analytics.primitiveCount} · components ${analytics.componentCount}`}
            value={analytics.animationCoverageScore}
          />
        </div>
      </VeriForgeFrame>

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
        <button
          type="button"
          onClick={() => setFilter("primitive")}
          className={cn(
            "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
            filter === "primitive"
              ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
              : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
          )}
        >
          Primitives
        </button>
        {COMPONENTS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
              filter === c
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
                : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Spec grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((spec) => (
          <div
            key={spec.id}
            className={cn(
              "border p-4 bg-[linear-gradient(160deg,#1A1A1A_0%,#121212_50%,#242424_100%)]",
              spec.signal === "critical"
                ? "border-[#1E6FB8]"
                : "border-[#424242]",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                {spec.name}
              </p>
              <SignalChip signal={spec.signal} />
            </div>
            <p className="mt-2 text-xs text-[#b8b8b8]">{spec.description}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
              {spec.weight} · {spec.durationMs}ms · {spec.cssClass}
            </p>
            <div className="mt-3">
              <VeriForgeButton size="sm" onClick={() => replay(spec)}>
                Play
              </VeriForgeButton>
            </div>
          </div>
        ))}
      </div>

      {/* Live demos */}
      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Live demos
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Primitives */}
          <div className="space-y-3 border border-[#424242] bg-[#151515] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              Motion primitives
            </p>
            <div key={`prim-${demoKey}`} className="grid gap-2">
              {PRIMITIVES.map((p) => {
                const spec = VERIFORGE_ANIMATION_SPECS.find((s) => s.primitive === p);
                return (
                  <div
                    key={p}
                    className={cn(
                      "border border-[#424242] px-3 py-3 text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]",
                      spec?.cssClass,
                    )}
                  >
                    {spec?.name ?? p}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 border border-[#424242] bg-[#151515] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              1 · Buttons
            </p>
            <button
              type="button"
              className={cn(
                "vf-anim-btn rounded-[3px] border border-[#1F2328] bg-[#2A2E33] px-5 py-3 font-[var(--vf-font-primary)] text-xs font-medium tracking-[0.02em] text-[#F4F6F8] transition hover:-translate-y-px hover:bg-[#3B3F45]",
                btnPhase === "press" && "vf-anim-btn-press",
                btnPhase === "rebound" && "vf-anim-btn-rebound",
              )}
              onMouseDown={() => {
                setBtnPhase("press");
                recordPlay(VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-btn-press")!);
              }}
              onMouseUp={() => {
                setBtnPhase("rebound");
                recordPlay(VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-btn-release")!);
                window.setTimeout(() => setBtnPhase("idle"), 180);
              }}
            >
              Forge action
            </button>
            <p className="text-[10px] text-[#8a8a8a]">
              Hover glow · press compression · steel rebound
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-3 border border-[#424242] bg-[#151515] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              2 · Cards
            </p>
            {!cardDismiss ? (
              <div
                className={cn(
                  "vf-anim-card border border-[#424242] bg-[#1f1f1f] p-4",
                  cardActive && "vf-anim-card-active",
                )}
              >
                <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                  Angular card
                </p>
                <p className="mt-1 text-xs text-[#9f9f9f]">Lift · glow · dismiss</p>
                <div className="mt-3 flex gap-2">
                  <VeriForgeButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setCardActive((v) => !v);
                      recordPlay(
                        VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-card-active")!,
                      );
                    }}
                  >
                    Toggle active
                  </VeriForgeButton>
                  <VeriForgeButton
                    size="sm"
                    onClick={() => {
                      setCardDismiss(true);
                      recordPlay(
                        VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-card-dismiss")!,
                      );
                      window.setTimeout(() => setCardDismiss(false), 320);
                    }}
                  >
                    Dismiss
                  </VeriForgeButton>
                </div>
              </div>
            ) : (
              <div className="vf-anim-card-dismiss border border-[#424242] bg-[#1f1f1f] p-4 opacity-50">
                Dismissing…
              </div>
            )}
          </div>

          {/* Panels */}
          <div className="space-y-3 border border-[#424242] bg-[#151515] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              3 · Panels
            </p>
            <div key={`panel-${panelKey}`} className="vf-anim-panel-in border border-[#424242] bg-[#1A1A1A] p-4">
              <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                Panel slide-in
              </p>
              <div className="vf-anim-panel-accent mt-3 w-28" />
              <div className="vf-anim-panel-expand mt-3 border border-[#424242] p-2 text-[10px] uppercase text-[#9f9f9f]">
                Bevel expand + red accent
              </div>
            </div>
            <VeriForgeButton
              size="sm"
              variant="secondary"
              onClick={() => {
                setPanelKey((k) => k + 1);
                recordPlay(VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-panel-in")!);
              }}
            >
              Replay panel
            </VeriForgeButton>
          </div>

          {/* Modals */}
          <div className="space-y-3 border border-[#424242] bg-[#151515] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              4 · Modals
            </p>
            <div className="flex gap-2">
              <VeriForgeButton
                size="sm"
                onClick={() => {
                  setModalClosing(false);
                  setModalOpen(true);
                  recordPlay(VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-modal-open")!);
                }}
              >
                Open modal
              </VeriForgeButton>
              <VeriForgeButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  setModalClosing(true);
                  recordPlay(VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-modal-close")!);
                  window.setTimeout(() => {
                    setModalOpen(false);
                    setModalClosing(false);
                  }, 520);
                }}
              >
                Close
              </VeriForgeButton>
            </div>
            {modalOpen ? (
              <div
                className={cn(
                  "border border-[#1E6FB8] bg-[#1A1A1A] p-4 shadow-[0_0_20px_rgba(30, 111, 184,.35)]",
                  modalClosing ? "vf-anim-modal-close" : "vf-anim-modal-open",
                )}
              >
                <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                  Industrial modal
                </p>
                <p className="mt-1 text-xs text-[#9f9f9f]">Drop open · angular collapse</p>
              </div>
            ) : null}
          </div>

          {/* Workflow */}
          <div className="space-y-3 border border-[#424242] bg-[#151515] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              5 · Workflow nodes
            </p>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center border border-[#424242] bg-[#1f1f1f] text-[10px] text-[#FAFAFA]",
                  nodeActive && "vf-anim-node-activate",
                  nodeError && "vf-anim-node-error",
                )}
              >
                A
              </div>
              <div key={`conn-${connectorKey}`} className="vf-anim-connector-draw flex-1" />
              <div className="flex h-10 w-10 items-center justify-center border border-[#424242] bg-[#1f1f1f] text-[10px] text-[#FAFAFA]">
                B
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <VeriForgeButton
                size="sm"
                onClick={() => {
                  setNodeActive(true);
                  setNodeError(false);
                  setConnectorKey((k) => k + 1);
                  recordPlay(
                    VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-wf-activate")!,
                  );
                }}
              >
                Activate
              </VeriForgeButton>
              <VeriForgeButton
                size="sm"
                variant="warning"
                onClick={() => {
                  setNodeError(true);
                  setNodeActive(false);
                  recordPlay(VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-wf-error")!);
                  window.setTimeout(() => setNodeError(false), 450);
                }}
              >
                Error
              </VeriForgeButton>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-3 border border-[#424242] bg-[#151515] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              6 · Charts
            </p>
            <div key={`chart-${chartKey}`}>
              <svg viewBox="0 0 120 48" className="h-16 w-full" aria-hidden>
                <polyline
                  className="vf-anim-chart-line"
                  fill="none"
                  stroke="#424242"
                  strokeWidth="2"
                  points="0,36 20,28 40,30 60,18 80,22 100,10 120,14"
                />
                <polyline
                  className="vf-anim-chart-line"
                  fill="none"
                  stroke="#1E6FB8"
                  strokeWidth="2"
                  points="0,40 20,34 40,32 60,24 80,20 100,12 120,8"
                />
              </svg>
              <div className="mt-2 flex items-end gap-2">
                {[40, 55, 35, 70, 50].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "vf-anim-chart-bar w-6 bg-[linear-gradient(180deg,#8a8a8a_0%,#424242_100%)]",
                      i === 3 && "vf-anim-kpi-pulse bg-[#1E6FB8]",
                    )}
                    style={{ height: h }}
                  />
                ))}
              </div>
            </div>
            <VeriForgeButton
              size="sm"
              variant="secondary"
              onClick={() => {
                setChartKey((k) => k + 1);
                recordPlay(VERIFORGE_ANIMATION_SPECS.find((s) => s.id === "an-chart-line")!);
              }}
            >
              Replay charts
            </VeriForgeButton>
          </div>
        </div>
      </VeriForgeFrame>

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Timing rules
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#b8b8b8]">
          <li>Fast 120–180ms — buttons, icons</li>
          <li>Medium 240–320ms — cards, panels</li>
          <li>Heavy 400–600ms — modals, workflows, charts</li>
          <li>
            Easing · angular {veriforgeTokens.motion.easeAngular} · industrial{" "}
            {veriforgeTokens.motion.easeIndustrial} · rebound{" "}
            {veriforgeTokens.motion.easeRebound}
          </li>
        </ul>
        <VeriForgeDivider className="my-4" />
        <p className="text-xs text-[#8a8a8a]">
          CSS classes under <code className="text-[#cfcfcf]">vf-anim-*</code> in{" "}
          <code className="text-[#cfcfcf]">tokens.css</code> · sync{" "}
          <code className="text-[#cfcfcf]">veriforge.animation.analytics</code>
        </p>
      </VeriForgeFrame>
    </div>
  );
}
