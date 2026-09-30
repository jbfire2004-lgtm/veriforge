import type {
  SifHecaAccessPlane,
  SifHecaEnergyExposure,
  SifHecaEnergyKey,
  SifHecaHubDashboard,
  SifHecaOpenAction,
  SifHecaQueueItem,
  TrendPoint,
} from "./types";
import { SIF_HECA_ENERGY_KEYS } from "./types";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function series(
  seed: string,
  months: number,
  base: number,
  drift: number,
  noise: number,
): TrendPoint[] {
  const out: TrendPoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const n = (hash(`${seed}:${period}`) % 1000) / 1000;
    const t = months - i;
    const value = Math.max(
      0,
      Math.min(100, base + drift * (t / months) + (n - 0.5) * noise),
    );
    out.push({ period, value: Math.round(value * 10) / 10 });
  }
  return out;
}

function scopeLabel(plane: SifHecaAccessPlane): string {
  if (plane === "company") return "Company scope";
  if (plane === "subcontractor") return "Subcontractor scope";
  return "Project scope";
}

function qs(projectId: number, companyId: number) {
  return `projectId=${projectId}&companyId=${companyId}`;
}

const ENERGY_META: Record<
  SifHecaEnergyKey,
  { label: string; highEnergy: boolean }
> = {
  gravity: { label: "Gravity", highEnergy: true },
  motion: { label: "Motion", highEnergy: false },
  electrical: { label: "Electrical", highEnergy: true },
  pressure: { label: "Pressure", highEnergy: true },
  chemical: { label: "Chemical", highEnergy: false },
  thermal: { label: "Thermal", highEnergy: false },
  radiation: { label: "Radiation", highEnergy: false },
};

function buildEnergy(
  seed: string,
  scale: number,
): SifHecaEnergyExposure[] {
  const weights = [22, 14, 18, 16, 12, 10, 8];
  return SIF_HECA_ENERGY_KEYS.map((key, i) => {
    const meta = ENERGY_META[key];
    const n = (hash(`${seed}:e:${key}`) % 1000) / 1000;
    const exposurePct = Math.round(
      Math.max(4, weights[i]! * (0.75 + n * 0.5)) * 10,
    ) / 10;
    const controlScore = Math.round(
      Math.max(45, Math.min(98, 72 + (n - 0.4) * 40 + (meta.highEnergy ? -8 : 4))),
    );
    return {
      key,
      label: meta.label,
      exposurePct,
      controlScore,
      highEnergy: meta.highEnergy,
      openExposures: Math.max(
        0,
        Math.round((meta.highEnergy ? 3 : 1) * scale + n * 4),
      ),
    };
  });
}

export function buildSifHecaHub(input: {
  plane?: SifHecaAccessPlane;
  role?: string | null;
  projectId?: number;
  companyId?: number;
}): SifHecaHubDashboard {
  const plane =
    input.plane ?? (resolveVeriPmPlane(input.role) as SifHecaAccessPlane);
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const seed = `sifheca:${plane}:${companyId}:${projectId}`;
  const h = hash(seed);
  const scale = plane === "company" ? 3.2 : plane === "subcontractor" ? 0.6 : 1;
  const q = qs(projectId, companyId);

  const energyBreakdown = buildEnergy(seed, scale);
  const sifExposures = energyBreakdown.reduce((s, e) => s + e.openExposures, 0);
  const hecaCompleted = Math.round((18 + (h % 14)) * Math.max(scale, 0.7));
  const openActions = Math.round((5 + (h % 7)) * Math.max(scale, 0.8));
  const ccvRate = Math.round(
    energyBreakdown.reduce((s, e) => s + e.controlScore, 0) /
      energyBreakdown.length,
  );

  const queue: SifHecaQueueItem[] = [
    {
      id: "evt-gravity-1",
      title: "Scaffold deck edge — fall potential",
      status: "review_required",
      sifCategory: "critical",
      hecaLabel: "Balance / fall",
      highEnergy: true,
      href: `/pm/sif-heca/evaluate?${q}`,
    },
    {
      id: "evt-elec-1",
      title: "Live panel work — temporary power",
      status: "open",
      sifCategory: "high",
      hecaLabel: "Tools / equipment",
      highEnergy: true,
      href: `/pm/sif-heca/evaluate?${q}`,
    },
    {
      id: "evt-pressure-1",
      title: "Pneumatic test — stored energy",
      status: "in_progress",
      sifCategory: "high",
      hecaLabel: "Line of fire",
      highEnergy: true,
      href: `/pm/sif-heca/evaluate?${q}`,
    },
    {
      id: "evt-motion-1",
      title: "Repetitive lift — body position",
      status: "completed",
      sifCategory: "medium",
      hecaLabel: "Body position",
      highEnergy: false,
      href: `/pm/sif-heca/evaluate?${q}`,
    },
  ];

  const openActionRows: SifHecaOpenAction[] = [
    {
      id: "act-1",
      title: "Verify edge protection before next lift",
      source: "SIF exposure · gravity",
      dueLabel: "Due in 2 days",
      overdue: false,
      href: `/pm/action-management?${q}&source=heca`,
    },
    {
      id: "act-2",
      title: "Confirm LOTO isolation points on panel B",
      source: "HECA · electrical",
      dueLabel: "Overdue 1 day",
      overdue: true,
      href: `/pm/action-management?${q}&source=heca`,
    },
    {
      id: "act-3",
      title: "Field verify exclusion zone for pressure test",
      source: "Critical control",
      dueLabel: "Due today",
      overdue: false,
      href: `/pm/action-management?${q}&source=heca`,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    revision: h % 10_000,
    plane,
    scopeLabel: scopeLabel(plane),
    projectId,
    companyId,
    periodLabel: "Last 90 days",
    kpis: {
      sifExposures,
      hecaCompleted,
      openActions,
      criticalControlVerificationRate: ccvRate,
      deltas: {
        sifExposures: -Math.round(1 + (h % 3)),
        hecaCompleted: Math.round(2 + (h % 4)),
        openActions: Math.round((h % 3) - 1),
        criticalControlVerificationRate: Math.round(1 + (h % 4)),
      },
    },
    energyBreakdown,
    verificationTrend: series(`${seed}:ccv`, 12, ccvRate - 8, 10, 8),
    sifTrend: series(`${seed}:sif`, 12, 18, -4, 6),
    queue,
    openActions: openActionRows,
    insights: [
      {
        id: "ins-gravity",
        tone: "alert",
        headline: "Gravity exposures lead the SIF profile",
        body: "Prioritize critical control verification on fall protection and exclusion zones before high-elevation work.",
        href: `/pm/sif-heca/evaluate?${q}`,
      },
      {
        id: "ins-ccv",
        tone: ccvRate >= 80 ? "positive" : "caution",
        headline: `Critical control verification at ${ccvRate}%`,
        body:
          ccvRate >= 80
            ? "Verification rate is healthy — sustain FieldOS check-ins on high-energy tasks."
            : "Verification is below target — push overdue HECA actions into Action Management.",
        href: `/pm/action-management?${q}`,
      },
      {
        id: "ins-intel",
        tone: "neutral",
        headline: "Cross-link Safety Intelligence for peer SIF rates",
        body: "Compare project SIF exposure density against industry peers in Safety Intelligence.",
        href: `/pm/safety-intelligence?${q}`,
      },
    ],
    links: {
      smsCore: `/pm/sms?${q}`,
      actionManagement: `/pm/action-management?${q}`,
      fieldOs: `/field?${q}`,
      safetyHub: `/pm/safety-hub?${q}`,
      emergencyResponse: `/pm/emergency-response?${q}`,
      safetyIntelligence: `/pm/safety-intelligence?${q}`,
      projects: `/pm/projects?${q}`,
      evaluate: `/pm/sif-heca/evaluate?${q}`,
      jhaFlha: `/pm/jha-flha?${q}`,
    },
    rules: { neverEmpty: true, planeIsolated: true },
  };
}
