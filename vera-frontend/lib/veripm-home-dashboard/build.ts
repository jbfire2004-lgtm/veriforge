/**
 * Build VeriPM homepage dashboard payload (deterministic demo analytics).
 */

import type {
  HomeAccessPlane,
  HomeInsight,
  HomeKpis,
  HomeQuickLink,
  TrendPoint,
  TrendWindowMonths,
  VeriPmHomeDashboard,
} from "./types";

const HOURS = 200_000 as const;

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
      base + drift * (t / months) + (n - 0.5) * noise,
    );
    out.push({ period, value: Math.round(value * 100) / 100 });
  }
  return out;
}

function planeScale(plane: HomeAccessPlane): number {
  if (plane === "company") return 4.2;
  if (plane === "subcontractor") return 0.55;
  return 1;
}

function buildKpis(plane: HomeAccessPlane, seed: string): HomeKpis {
  const s = planeScale(plane);
  const h = hash(seed);
  const incidentCount = Math.round((8 + (h % 7)) * s);
  const nearMissCount = Math.round((18 + (h % 15)) * s);
  const hoursWorked = Math.round((42_000 + (h % 20_000)) * Math.max(s, 0.8));
  const incidentRatePer200k =
    Math.round(((incidentCount / Math.max(hoursWorked, 1)) * HOURS) * 100) / 100;
  const leadingIndicatorScore = Math.min(
    100,
    Math.round(72 + (h % 22) - (plane === "subcontractor" ? 4 : 0)),
  );
  const openCorrectiveActions = Math.round((12 + (h % 18)) * s);
  const correctiveMedianAgeDays = 10 + (h % 16);

  return {
    incidentCount,
    incidentRatePer200k,
    nearMissCount,
    leadingIndicatorScore,
    openCorrectiveActions,
    correctiveMedianAgeDays,
    deltas: {
      incidentCount: plane === "company" ? -3 : -1,
      incidentRatePer200k: -0.14,
      nearMissCount: plane === "subcontractor" ? 2 : 1,
      leadingIndicatorScore: 3.2,
      openCorrectiveActions: -2,
      correctiveMedianAgeDays: 1.5,
    },
  };
}

function buildInsights(
  plane: HomeAccessPlane,
  kpis: HomeKpis,
): HomeInsight[] {
  const rateDown = kpis.deltas.incidentRatePer200k < 0;
  const scope =
    plane === "company"
      ? "your company"
      : plane === "subcontractor"
        ? "your contracted scope"
        : "your project";

  return [
    {
      id: "period-summary",
      tone: rateDown ? "positive" : "caution",
      headline: rateDown
        ? `Incident rate improved on ${scope}`
        : `Incident rate needs attention on ${scope}`,
      body: rateDown
        ? `This period, ${scope} saw a ${Math.abs(kpis.deltas.incidentRatePer200k).toFixed(2)} /200k drop in recordable rate, with leading indicator score at ${kpis.leadingIndicatorScore}. Near-miss reporting remains active (${kpis.nearMissCount}), which is a healthy leading signal.`
        : `Recordable pressure is elevated relative to the prior period. Prioritize closing ${kpis.openCorrectiveActions} open corrective actions (median age ${kpis.correctiveMedianAgeDays}d) and increase inspection coverage.`,
      confidence: 0.82,
    },
    {
      id: "emerging-hazard",
      tone: "caution",
      headline: "Emerging hazard: access & ladder findings",
      body: "Inspection findings cluster on temporary access and ladder use. Pair a focused inspection blitz with a short safety meeting on ladder safety this week.",
      confidence: 0.76,
    },
    {
      id: "action-aging",
      tone: kpis.correctiveMedianAgeDays > 21 ? "alert" : "neutral",
      headline:
        kpis.correctiveMedianAgeDays > 21
          ? "Corrective action aging is elevated"
          : "Corrective action aging is within target",
      body: `Median days open is ${kpis.correctiveMedianAgeDays}. ${
        kpis.correctiveMedianAgeDays > 21
          ? "Escalate owners on actions older than 30 days and verify field evidence."
          : "Keep verifying close-outs so effectiveness reviews stay on schedule."
      }`,
      confidence: 0.88,
    },
  ];
}

function buildQuickLinks(
  _plane: HomeAccessPlane,
  kpis: HomeKpis,
): HomeQuickLink[] {
  return [
    {
      id: "incidents",
      label: "Incidents",
      href: "/pm/incidents",
      signal: `${kpis.incidentCount} this period`,
      tone: kpis.incidentCount > 15 ? "caution" : "info",
    },
    {
      id: "actions",
      label: "Action Management",
      href: "/pm/action-management",
      signal: `${kpis.openCorrectiveActions} open · ${kpis.correctiveMedianAgeDays}d median`,
      tone: kpis.correctiveMedianAgeDays > 21 ? "alert" : "caution",
    },
    {
      id: "meetings",
      label: "Safety Meetings",
      href: "/pm/safety-meetings",
      signal: "Topics & planner",
      tone: "positive",
    },
    {
      id: "inspections",
      label: "Inspections",
      href: "/pm/inspections",
      signal: "Leading coverage",
      tone: "info",
    },
    {
      id: "training",
      label: "Training & Competency",
      href: "/pm/training",
      signal: "Gaps & expiry",
      tone: "neutral",
    },
  ];
}

function scopeLabel(plane: HomeAccessPlane): string {
  if (plane === "company") return "Company aggregate";
  if (plane === "subcontractor") return "Subcontractor scope";
  return "Project scope";
}

export function resolveHomePlane(role: string | null | undefined): HomeAccessPlane {
  const r = (role ?? "").toUpperCase();
  if (
    r.includes("CONTRACTOR") ||
    r === "CONTRACTOR_USER" ||
    r === "CONTRACTOR_ADMIN"
  ) {
    return "subcontractor";
  }
  if (
    r === "COMPANY_ADMIN" ||
    r === "SUPER_ADMIN" ||
    r === "ADMIN" ||
    r === "COMPANY_SAFETY_MANAGER"
  ) {
    return "company";
  }
  return "project";
}

export function buildVeriPmHomeDashboard(input: {
  plane?: HomeAccessPlane;
  role?: string | null;
  trendWindowMonths?: TrendWindowMonths;
  projectId?: number | null;
  companyId?: number | null;
}): VeriPmHomeDashboard {
  const plane =
    input.plane ?? resolveHomePlane(input.role ?? null);
  const months: TrendWindowMonths = input.trendWindowMonths ?? 24;
  const seed = `${plane}:${input.companyId ?? 0}:${input.projectId ?? 0}:${months}`;
  const kpis = buildKpis(plane, seed);

  const incidents = series(`${seed}:inc`, months, kpis.incidentRatePer200k + 0.4, -0.35, 0.35);
  const nearMisses = series(
    `${seed}:nm`,
    months,
    (kpis.nearMissCount / Math.max(planeScale(plane), 0.5)) * 0.12,
    0.1,
    0.5,
  );
  const safetyMeetingFrequency = series(`${seed}:mtg`, months, 3.2, 0.4, 0.6);
  const inspectionCompletion = series(`${seed}:insp`, months, 78, 12, 8);

  const insights = buildInsights(plane, kpis);
  const quickLinks = buildQuickLinks(plane, kpis);

  return {
    generatedAt: new Date().toISOString(),
    revision: hash(seed) % 10_000,
    plane,
    scopeLabel: scopeLabel(plane),
    periodLabel: "Current period vs prior",
    trendWindowMonths: months,
    hoursDenominator: HOURS,
    kpis,
    trends: {
      incidents,
      nearMisses,
      safetyMeetingFrequency,
      inspectionCompletion,
    },
    insights,
    focusAreas: [
      {
        id: "focus-ladder",
        title: "Increase ladder / access inspections",
        reason: "Recurring inspection findings on temporary access",
        href: "/pm/inspections",
      },
      {
        id: "focus-meeting",
        title: "Schedule ladder safety meeting",
        reason: "AI topic linked to findings + near-miss cluster",
        href: "/pm/safety-meetings",
      },
      {
        id: "focus-actions",
        title: "Close aging corrective actions",
        reason: `Median age ${kpis.correctiveMedianAgeDays} days — verify field evidence`,
        href: "/pm/action-management",
      },
    ],
    quickLinks,
    rules: {
      planeIsolated: true,
      ratesNormalizedPer200k: true,
      subcontractorScoped: plane === "subcontractor",
    },
  };
}
