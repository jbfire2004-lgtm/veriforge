"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type SoundCategory =
  | "ui"
  | "workflow"
  | "notification"
  | "verification"
  | "incident"
  | "equipment"
  | "motion";

export type SoundSignal = "neutral" | "success" | "warning" | "critical" | "failure";
export type SoundWeight = "light" | "medium" | "heavy";

export type SoundCueId =
  | "metalClick"
  | "steelShimmer"
  | "metalLift"
  | "forgePing"
  | "metalSweep"
  | "metalSnapAlert"
  | "redAlertStrike"
  | "steelPulse"
  | "softMetalTap"
  | "ascendChime"
  | "descendAngular"
  | "redAlertPulse"
  | "heavyImpact"
  | "redSirenPulse"
  | "steelBeacon"
  | "metalTick"
  | "metalSnap"
  | "steelPing"
  | "metalGlide"
  | "industrialThud"
  | "steelLineSweep";

export type SoundSpecLocal = {
  id: string;
  category: SoundCategory;
  name: string;
  description: string;
  cue: SoundCueId;
  durationMs: number;
  weight: SoundWeight;
  signal: SoundSignal;
  principles: string[];
};

export type SoundAnalyticsSnapshot = {
  totalSounds: number;
  playCount: number;
  criticalPlays: number;
  categoryCounts: Record<SoundCategory, number>;
  soundCoverageScore: number;
  muted: boolean;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.sounds.analytics";

const CATEGORIES: SoundCategory[] = [
  "ui",
  "workflow",
  "notification",
  "verification",
  "incident",
  "equipment",
  "motion",
];

const CATEGORY_LABEL: Record<SoundCategory, string> = {
  ui: "UI Interaction",
  workflow: "Workflow",
  notification: "Notifications",
  verification: "Verification",
  incident: "Incidents",
  equipment: "Equipment",
  motion: "Motion",
};

export const VERIFORGE_SOUND_SPECS: SoundSpecLocal[] = [
  {
    id: "snd-ui-tap",
    category: "ui",
    name: "Button Tap",
    description: "Short metallic click",
    cue: "metalClick",
    durationMs: 80,
    weight: "light",
    signal: "neutral",
    principles: ["Angular tonality", "Precision timing"],
  },
  {
    id: "snd-ui-hover",
    category: "ui",
    name: "Hover Shimmer",
    description: "Faint steel shimmer",
    cue: "steelShimmer",
    durationMs: 160,
    weight: "light",
    signal: "neutral",
    principles: ["Metallic resonance", "Steel-grey resonance"],
  },
  {
    id: "snd-ui-card",
    category: "ui",
    name: "Card Lift",
    description: "Angular metallic lift tone",
    cue: "metalLift",
    durationMs: 220,
    weight: "medium",
    signal: "neutral",
    principles: ["Angular tonality", "Metallic resonance"],
  },
  {
    id: "snd-wf-node",
    category: "workflow",
    name: "Node Activation",
    description: "Sharp forged-metal ping",
    cue: "forgePing",
    durationMs: 140,
    weight: "medium",
    signal: "success",
    principles: ["Metallic resonance", "Sharp transients"],
  },
  {
    id: "snd-wf-connect",
    category: "workflow",
    name: "Connection Draw",
    description: "Metallic sweep",
    cue: "metalSweep",
    durationMs: 420,
    weight: "medium",
    signal: "neutral",
    principles: ["Metallic resonance", "Precision timing"],
  },
  {
    id: "snd-wf-error",
    category: "workflow",
    name: "Workflow Error",
    description: "Angular metallic snap + red-alert tone",
    cue: "metalSnapAlert",
    durationMs: 380,
    weight: "heavy",
    signal: "critical",
    principles: ["Red-alert urgency", "Angular tonality"],
  },
  {
    id: "snd-ntf-critical",
    category: "notification",
    name: "Critical Alert",
    description: "Red-alert metallic strike",
    cue: "redAlertStrike",
    durationMs: 450,
    weight: "heavy",
    signal: "critical",
    principles: ["Red-alert urgency", "Heavy industrial weight"],
  },
  {
    id: "snd-ntf-warning",
    category: "notification",
    name: "Warning Pulse",
    description: "Steel-grey pulse",
    cue: "steelPulse",
    durationMs: 320,
    weight: "medium",
    signal: "warning",
    principles: ["Steel-grey resonance", "Precision timing"],
  },
  {
    id: "snd-ntf-info",
    category: "notification",
    name: "Info Tap",
    description: "Soft metallic tap",
    cue: "softMetalTap",
    durationMs: 100,
    weight: "light",
    signal: "neutral",
    principles: ["Metallic resonance", "Precision timing"],
  },
  {
    id: "snd-ver-pass",
    category: "verification",
    name: "forgeCheck Pass",
    description: "Ascending metallic chime",
    cue: "ascendChime",
    durationMs: 480,
    weight: "medium",
    signal: "success",
    principles: ["Warm metallic chimes", "Metallic resonance"],
  },
  {
    id: "snd-ver-fail",
    category: "verification",
    name: "forgeCheck Fail",
    description: "Descending angular tone",
    cue: "descendAngular",
    durationMs: 420,
    weight: "medium",
    signal: "failure",
    principles: ["Angular descending tones", "Sharp transients"],
  },
  {
    id: "snd-ver-expiry",
    category: "verification",
    name: "Compliance Expiry",
    description: "Red-alert pulse",
    cue: "redAlertPulse",
    durationMs: 600,
    weight: "heavy",
    signal: "critical",
    principles: ["Red-alert urgency", "Rising metallic pitch"],
  },
  {
    id: "snd-inc-alert",
    category: "incident",
    name: "Incident Alert",
    description: "Heavy metallic impact",
    cue: "heavyImpact",
    durationMs: 500,
    weight: "heavy",
    signal: "critical",
    principles: ["Heavy industrial weight", "Metallic hits"],
  },
  {
    id: "snd-inc-emergency",
    category: "incident",
    name: "Emergency Siren",
    description: "Repeating red-alert siren pulse",
    cue: "redSirenPulse",
    durationMs: 1200,
    weight: "heavy",
    signal: "critical",
    principles: ["Red-alert urgency", "Repeating pulse"],
  },
  {
    id: "snd-inc-muster",
    category: "incident",
    name: "Muster Beacon",
    description: "Steel-grey beacon tone",
    cue: "steelBeacon",
    durationMs: 700,
    weight: "medium",
    signal: "warning",
    principles: ["Steel-grey resonance", "Precision timing"],
  },
  {
    id: "snd-eq-pass",
    category: "equipment",
    name: "Inspection Pass",
    description: "Metallic tick",
    cue: "metalTick",
    durationMs: 90,
    weight: "light",
    signal: "success",
    principles: ["Metallic resonance", "Precision timing"],
  },
  {
    id: "snd-eq-defect",
    category: "equipment",
    name: "Defect Found",
    description: "Angular metallic snap",
    cue: "metalSnap",
    durationMs: 200,
    weight: "medium",
    signal: "failure",
    principles: ["Angular tonality", "Metallic clanks"],
  },
  {
    id: "snd-eq-gps",
    category: "equipment",
    name: "GPS Check-in",
    description: "Steel resonance ping",
    cue: "steelPing",
    durationMs: 260,
    weight: "light",
    signal: "neutral",
    principles: ["Metallic resonance", "Steel-grey resonance"],
  },
  {
    id: "snd-mot-panel",
    category: "motion",
    name: "Panel Slide",
    description: "Metallic glide",
    cue: "metalGlide",
    durationMs: 320,
    weight: "medium",
    signal: "neutral",
    principles: ["Metallic scrapes", "Precision timing"],
  },
  {
    id: "snd-mot-modal",
    category: "motion",
    name: "Modal Drop",
    description: "Heavy industrial thud",
    cue: "industrialThud",
    durationMs: 380,
    weight: "heavy",
    signal: "neutral",
    principles: ["Heavy industrial weight", "Low-mid emphasis"],
  },
  {
    id: "snd-mot-chart",
    category: "motion",
    name: "Chart Sweep",
    description: "Steel line sweep",
    cue: "steelLineSweep",
    durationMs: 500,
    weight: "medium",
    signal: "neutral",
    principles: ["Metallic resonance", "Precision timing"],
  },
];

/* ── Web Audio forged-metal engine ───────────────────────────────────────── */

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) sharedCtx = new AC();
  return sharedCtx;
}

function tone(
  ctx: AudioContext,
  {
    type = "square",
    freq,
    freqEnd,
    start,
    dur,
    gain = 0.12,
    filterFreq = 2400,
  }: {
    type?: OscillatorType;
    freq: number;
    freqEnd?: number;
    start: number;
    dur: number;
    gain?: number;
    filterFreq?: number;
  },
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = filterFreq;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, start + dur);
  }
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(filt);
  filt.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noiseBurst(
  ctx: AudioContext,
  start: number,
  dur: number,
  gain = 0.08,
  filterFreq = 1800,
) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = filterFreq;
  filt.Q.value = 1.4;
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(ctx.destination);
  src.start(start);
  src.stop(start + dur + 0.02);
}

export function playVeriForgeCue(cue: SoundCueId): number {
  const ctx = getAudioContext();
  if (!ctx) return 0;
  if (ctx.state === "suspended") void ctx.resume();
  const t = ctx.currentTime;

  switch (cue) {
    case "metalClick":
      noiseBurst(ctx, t, 0.04, 0.1, 3200);
      tone(ctx, { type: "square", freq: 1800, start: t, dur: 0.06, gain: 0.08, filterFreq: 4000 });
      return 80;
    case "steelShimmer":
      tone(ctx, { type: "triangle", freq: 2400, freqEnd: 3200, start: t, dur: 0.14, gain: 0.04, filterFreq: 5000 });
      tone(ctx, { type: "sine", freq: 3600, freqEnd: 4200, start: t + 0.02, dur: 0.12, gain: 0.025, filterFreq: 6000 });
      return 160;
    case "metalLift":
      tone(ctx, { type: "sawtooth", freq: 220, freqEnd: 480, start: t, dur: 0.2, gain: 0.07, filterFreq: 1600 });
      noiseBurst(ctx, t, 0.08, 0.05, 1200);
      return 220;
    case "forgePing":
      tone(ctx, { type: "square", freq: 880, start: t, dur: 0.12, gain: 0.1, filterFreq: 3000 });
      tone(ctx, { type: "sine", freq: 1760, start: t, dur: 0.1, gain: 0.05, filterFreq: 4000 });
      return 140;
    case "metalSweep":
      tone(ctx, { type: "sawtooth", freq: 180, freqEnd: 900, start: t, dur: 0.4, gain: 0.06, filterFreq: 2000 });
      noiseBurst(ctx, t, 0.35, 0.04, 900);
      return 420;
    case "metalSnapAlert":
      noiseBurst(ctx, t, 0.06, 0.14, 2800);
      tone(ctx, { type: "square", freq: 420, freqEnd: 900, start: t + 0.05, dur: 0.28, gain: 0.12, filterFreq: 2200 });
      return 380;
    case "redAlertStrike":
      noiseBurst(ctx, t, 0.08, 0.16, 800);
      tone(ctx, { type: "square", freq: 160, start: t, dur: 0.18, gain: 0.16, filterFreq: 900 });
      tone(ctx, { type: "sawtooth", freq: 520, freqEnd: 1100, start: t + 0.1, dur: 0.3, gain: 0.1, filterFreq: 2400 });
      return 450;
    case "steelPulse":
      tone(ctx, { type: "triangle", freq: 340, start: t, dur: 0.12, gain: 0.08, filterFreq: 1200 });
      tone(ctx, { type: "triangle", freq: 340, start: t + 0.16, dur: 0.12, gain: 0.06, filterFreq: 1200 });
      return 320;
    case "softMetalTap":
      tone(ctx, { type: "sine", freq: 1200, start: t, dur: 0.08, gain: 0.05, filterFreq: 2500 });
      return 100;
    case "ascendChime":
      tone(ctx, { type: "triangle", freq: 523, start: t, dur: 0.18, gain: 0.08, filterFreq: 3000 });
      tone(ctx, { type: "triangle", freq: 659, start: t + 0.12, dur: 0.18, gain: 0.08, filterFreq: 3000 });
      tone(ctx, { type: "triangle", freq: 784, start: t + 0.24, dur: 0.22, gain: 0.09, filterFreq: 3200 });
      return 480;
    case "descendAngular":
      tone(ctx, { type: "square", freq: 700, freqEnd: 180, start: t, dur: 0.38, gain: 0.1, filterFreq: 1800 });
      noiseBurst(ctx, t + 0.05, 0.1, 0.06, 1400);
      return 420;
    case "redAlertPulse":
      for (let i = 0; i < 3; i++) {
        tone(ctx, {
          type: "sawtooth",
          freq: 400 + i * 40,
          freqEnd: 900 + i * 60,
          start: t + i * 0.18,
          dur: 0.16,
          gain: 0.1,
          filterFreq: 2200,
        });
      }
      return 600;
    case "heavyImpact":
      noiseBurst(ctx, t, 0.12, 0.18, 400);
      tone(ctx, { type: "sine", freq: 70, freqEnd: 40, start: t, dur: 0.4, gain: 0.2, filterFreq: 300 });
      tone(ctx, { type: "square", freq: 220, start: t, dur: 0.1, gain: 0.08, filterFreq: 800 });
      return 500;
    case "redSirenPulse":
      for (let i = 0; i < 4; i++) {
        tone(ctx, {
          type: "sawtooth",
          freq: 480,
          freqEnd: 960,
          start: t + i * 0.28,
          dur: 0.22,
          gain: 0.11,
          filterFreq: 2600,
        });
        tone(ctx, {
          type: "sawtooth",
          freq: 960,
          freqEnd: 480,
          start: t + i * 0.28 + 0.12,
          dur: 0.14,
          gain: 0.09,
          filterFreq: 2600,
        });
      }
      return 1200;
    case "steelBeacon":
      tone(ctx, { type: "sine", freq: 560, start: t, dur: 0.2, gain: 0.07, filterFreq: 2000 });
      tone(ctx, { type: "sine", freq: 560, start: t + 0.35, dur: 0.25, gain: 0.06, filterFreq: 2000 });
      return 700;
    case "metalTick":
      tone(ctx, { type: "square", freq: 2100, start: t, dur: 0.05, gain: 0.06, filterFreq: 4500 });
      return 90;
    case "metalSnap":
      noiseBurst(ctx, t, 0.05, 0.12, 2600);
      tone(ctx, { type: "square", freq: 600, freqEnd: 200, start: t, dur: 0.16, gain: 0.09, filterFreq: 2000 });
      return 200;
    case "steelPing":
      tone(ctx, { type: "sine", freq: 990, start: t, dur: 0.22, gain: 0.07, filterFreq: 3500 });
      tone(ctx, { type: "triangle", freq: 1485, start: t, dur: 0.18, gain: 0.03, filterFreq: 4000 });
      return 260;
    case "metalGlide":
      tone(ctx, { type: "sawtooth", freq: 140, freqEnd: 420, start: t, dur: 0.3, gain: 0.05, filterFreq: 1400 });
      noiseBurst(ctx, t, 0.28, 0.035, 700);
      return 320;
    case "industrialThud":
      tone(ctx, { type: "sine", freq: 55, freqEnd: 35, start: t, dur: 0.35, gain: 0.22, filterFreq: 200 });
      noiseBurst(ctx, t, 0.1, 0.1, 350);
      return 380;
    case "steelLineSweep":
      tone(ctx, { type: "triangle", freq: 300, freqEnd: 1400, start: t, dur: 0.48, gain: 0.06, filterFreq: 2800 });
      return 500;
    default:
      return 0;
  }
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeSoundAnalytics(
  playCount: number,
  criticalPlays: number,
  muted = false,
): SoundAnalyticsSnapshot {
  const categoryCounts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<
    SoundCategory,
    number
  >;
  for (const s of VERIFORGE_SOUND_SPECS) categoryCounts[s.category] += 1;
  const covered = CATEGORIES.filter((c) => categoryCounts[c] > 0).length;
  const soundCoverageScore = clamp(
    (covered / CATEGORIES.length) * 70 + Math.min(playCount, 30),
  );
  return {
    totalSounds: VERIFORGE_SOUND_SPECS.length,
    playCount,
    criticalPlays,
    categoryCounts,
    soundCoverageScore,
    muted,
    timestamp: new Date().toISOString(),
  };
}

export function persistSoundAnalytics(snapshot: SoundAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:sounds-analytics", { detail: snapshot }),
  );
}

export function readSoundAnalytics(): SoundAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SoundAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useSoundAnalyticsSync(
  fallback: SoundAnalyticsSnapshot = computeSoundAnalytics(0, 0),
) {
  const [analytics, setAnalytics] = React.useState<SoundAnalyticsSnapshot>(
    () => readSoundAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as SoundAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<SoundAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:sounds-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:sounds-analytics",
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

function SignalChip({ signal }: { signal: SoundSignal }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        signal === "critical"
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.25)] text-[#ffc9c9]"
          : signal === "failure" || signal === "warning"
            ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.1)] text-[#ffb0b0]"
            : signal === "success"
              ? "border-[#424242] bg-[#1f1f1f] text-[#cfcfcf]"
              : "border-[#424242] bg-[#151515] text-[#9f9f9f]",
      )}
    >
      {signal}
    </span>
  );
}

/** Waveform visualizer bars that pulse while playing */
function WaveBars({ active, critical }: { active: boolean; critical?: boolean }) {
  return (
    <div className="flex h-8 items-end gap-0.5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 transition-all",
            critical ? "bg-[#1E6FB8]" : "bg-[#424242]",
            active && (critical ? "vf-anim-kpi-pulse" : ""),
          )}
          style={{
            height: active
              ? `${20 + ((i * 17) % 60)}%`
              : `${12 + (i % 4) * 8}%`,
            animationDelay: active ? `${i * 40}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function VeriForgeIndustrialSoundDesignSystem() {
  const { push } = useVeriForgeNotifications();
  const [filter, setFilter] = React.useState<SoundCategory | "all">("all");
  const [muted, setMuted] = React.useState(false);
  const [playCount, setPlayCount] = React.useState(0);
  const [criticalPlays, setCriticalPlays] = React.useState(0);
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const [lastPlayed, setLastPlayed] = React.useState<SoundSpecLocal | null>(null);

  const analytics = React.useMemo(
    () => computeSoundAnalytics(playCount, criticalPlays, muted),
    [playCount, criticalPlays, muted],
  );

  React.useEffect(() => {
    persistSoundAnalytics(analytics);
  }, [analytics]);

  const filtered =
    filter === "all"
      ? VERIFORGE_SOUND_SPECS
      : VERIFORGE_SOUND_SPECS.filter((s) => s.category === filter);

  const playSound = (spec: SoundSpecLocal) => {
    setLastPlayed(spec);
    setPlayCount((n) => n + 1);
    if (spec.signal === "critical") {
      setCriticalPlays((n) => n + 1);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL SOUND CUE",
        message: `${spec.name} — red-alert metallic cue fired.`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Sounds",
      });
    }
    if (muted) {
      setPlayingId(spec.id);
      window.setTimeout(() => setPlayingId(null), spec.durationMs);
      return;
    }
    const dur = playVeriForgeCue(spec.cue) || spec.durationMs;
    setPlayingId(spec.id);
    window.setTimeout(() => setPlayingId(null), dur);
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Industrial Sound Design System
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#b8b8b8]">
              Metallic resonance · angular tonality · red-alert urgency · Web Audio
              forged-metal synthesis
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
          <Metric label="Sounds" value={String(analytics.totalSounds)} />
          <Metric label="Plays" value={String(analytics.playCount)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalPlays)}
            critical={analytics.criticalPlays > 0}
          />
          <Metric label="Coverage" value={`${analytics.soundCoverageScore}%`} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <VeriForgeProgressBar
              label={`Sound coverage · ${muted ? "MUTED" : "LIVE"}`}
              value={analytics.soundCoverageScore}
            />
          </div>
          <VeriForgeButton
            size="sm"
            variant={muted ? "primary" : "secondary"}
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? "Unmute" : "Mute"}
          </VeriForgeButton>
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
        {CATEGORIES.map((c) => (
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
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((spec) => {
            const active = playingId === spec.id;
            const critical = spec.signal === "critical";
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => playSound(spec)}
                className={cn(
                  "border p-4 text-left transition",
                  "bg-[linear-gradient(160deg,#1A1A1A_0%,#121212_48%,#242424_100%)]",
                  active || critical
                    ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.35)]"
                    : "border-[#424242] hover:border-[#1E6FB8]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                    {spec.name}
                  </p>
                  <SignalChip signal={spec.signal} />
                </div>
                <p className="mt-2 text-xs text-[#b8b8b8]">{spec.description}</p>
                <div className="mt-3">
                  <WaveBars active={active} critical={critical} />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                  {spec.weight} · {spec.durationMs}ms · {spec.cue}
                </p>
              </button>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div
            className={cn(
              "border bg-[#1A1A1A] p-4",
              lastPlayed?.signal === "critical"
                ? "border-[#1E6FB8] shadow-[0_0_14px_rgba(30, 111, 184,.3)]"
                : "border-[#424242]",
            )}
          >
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Now playing
            </p>
            {lastPlayed ? (
              <div className="mt-3 space-y-3">
                <p className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.12em] text-[#FAFAFA]">
                  {lastPlayed.name}
                </p>
                <WaveBars
                  active={playingId === lastPlayed.id}
                  critical={lastPlayed.signal === "critical"}
                />
                <SignalChip signal={lastPlayed.signal} />
                <p className="text-xs text-[#b8b8b8]">{lastPlayed.description}</p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                  {CATEGORY_LABEL[lastPlayed.category]} · {lastPlayed.cue}
                </p>
                <VeriForgeButton size="sm" onClick={() => playSound(lastPlayed)}>
                  Replay
                </VeriForgeButton>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#9f9f9f]">Select a cue to forge audio.</p>
            )}
          </div>

          <div className="border border-[#424242] bg-[#1A1A1A] p-4">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              Design rules
            </p>
            <ul className="mt-3 space-y-2 text-xs text-[#b8b8b8]">
              <li>· Metallic hits, scrapes, clanks, resonant tones</li>
              <li>
                · <span className="text-[#1E6FB8]">Red-alert</span> = sharp transient +
                rising pitch
              </li>
              <li>· Neutral = steel-grey resonance</li>
              <li>· Success = warm metallic chime</li>
              <li>· Failure = angular descending tone</li>
            </ul>
          </div>
        </aside>
      </div>

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Categories
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className="border border-[#424242] bg-[#151515] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]"
            >
              {CATEGORY_LABEL[c]} · {analytics.categoryCounts[c]}
            </span>
          ))}
        </div>
        <VeriForgeDivider className="my-4" />
        <p className="text-xs text-[#8a8a8a]">
          Engine: Web Audio API · cues via <code className="text-[#cfcfcf]">playVeriForgeCue</code>{" "}
          · sync <code className="text-[#cfcfcf]">veriforge.sounds.analytics</code>
        </p>
      </VeriForgeFrame>
    </div>
  );
}
