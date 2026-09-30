import type {
  TrainingAccessPlane,
  TrainingGap,
  TrainingHubDashboard,
  TrendPoint,
} from "./types";
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

function scopeLabel(plane: TrainingAccessPlane): string {
  if (plane === "company") return "Company scope";
  if (plane === "subcontractor") return "Subcontractor scope";
  return "Project scope";
}

function q(projectId: number, companyId: number) {
  return `projectId=${projectId}&companyId=${companyId}`;
}

export function buildTrainingHub(input: {
  plane?: TrainingAccessPlane;
  role?: string | null;
  projectId?: number;
  companyId?: number;
  focus?: string | null;
}): TrainingHubDashboard {
  const plane =
    input.plane ?? (resolveVeriPmPlane(input.role) as TrainingAccessPlane);
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const seed = `train:${plane}:${companyId}:${projectId}`;
  const h = hash(seed);
  const scale = plane === "company" ? 4 : plane === "subcontractor" ? 0.5 : 1;
  const qs = q(projectId, companyId);

  const gaps: TrainingGap[] = [
    {
      id: "gap-loto",
      title: "Energy isolation (LOTO) refresher",
      reason: "Open investigations + inspection focus on isolation verification",
      linkedRootCause: "LOTO verification skipped",
      peopleAffected: Math.round((6 + (h % 8)) * Math.max(scale, 0.8)),
      urgency: "high",
      href: `/core/training-competency?${qs}&module=loto`,
    },
    {
      id: "gap-ladder",
      title: "Ladder & temporary access competency",
      reason: "Meeting topics and findings cluster on access controls",
      linkedRootCause: "Housekeeping / access design",
      peopleAffected: Math.round((4 + (h % 6)) * Math.max(scale, 0.8)),
      urgency: "medium",
      href: `/core/training-competency?${qs}&module=access`,
    },
    {
      id: "gap-lift",
      title: "Lift exclusion & spotter roles",
      reason: "Near-miss chain → corrective → meeting → inspection",
      linkedRootCause: "Exclusion zone not enforced",
      peopleAffected: Math.round((5 + (h % 5)) * Math.max(scale, 0.8)),
      urgency: "high",
      href: `/core/training-competency?${qs}&module=lifts`,
    },
    {
      id: "gap-ppe",
      title: "PPE for cutting / grinding",
      reason: "Preventive action + industry peer signal",
      linkedRootCause: "PPE compliance drift",
      peopleAffected: Math.round((3 + (h % 4)) * Math.max(scale, 0.8)),
      urgency: "low",
      href: `/core/training-competency?${qs}&module=ppe`,
    },
  ];

  if (input.focus === "loto") {
    const idx = gaps.findIndex((g) => g.id === "gap-loto");
    if (idx > 0) {
      const [m] = gaps.splice(idx, 1);
      gaps.unshift(m!);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    revision: h % 10_000,
    plane,
    scopeLabel: scopeLabel(plane),
    projectId,
    companyId,
    periodLabel: "Current period vs prior",
    kpis: {
      complianceRate: Math.min(99, 82 + (h % 14)),
      openGaps: gaps.length,
      expiringSoon: Math.round((5 + (h % 7)) * scale),
      refreshersAssigned: Math.round((8 + (h % 6)) * scale),
      deltas: {
        complianceRate: 1.8,
        openGaps: -1,
      },
    },
    complianceTrend: series(`${seed}:comp`, 12, 80, 8, 4),
    gaps,
    links: {
      incidents: `/pm/incidents?${qs}`,
      actions: `/pm/action-management?${qs}`,
      meetings: `/pm/safety-meetings?${qs}`,
      inspections: `/pm/inspections?${qs}`,
      coreTraining: `/core/training-competency?${qs}`,
    },
    rules: { neverEmpty: true, planeIsolated: true },
  };
}
