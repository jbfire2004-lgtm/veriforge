/**
 * Training & Competency analytics: trends, gaps, heatmaps, correlation, risk.
 */

import { breadcrumbs, childrenOf, getRegion } from "./geo";
import { MIN_SAMPLE, pct, ratePer200k } from "./normalize";
import {
  getCohorts,
  getRevision,
  PERIODS,
  SKILLS,
  type CohortFact,
  type ExpiryBucket,
} from "./store";
import type {
  CompetencyGap,
  CompetencyIncidentCorrelation,
  CompletionTrend,
  ExpiryHeatCell,
  SkillRegionSlice,
  TrainingCompetencyDashboard,
  TrainingCompetencySelectors,
  WorkforceRiskScore,
} from "./types";

const BUCKETS: ExpiryBucket[] = ["0-30d", "31-60d", "61-90d", "91-180d", "expired"];

function uniqueWorkers(cohorts: CohortFact[], skillCode?: string): Set<string> {
  const set = new Set<string>();
  for (const c of cohorts) {
    for (const s of c.skills) {
      if (skillCode && s.skillCode !== skillCode) continue;
      for (const t of s.workerTokens) set.add(t);
    }
  }
  return set;
}

export function buildCompletionTrends(regionCode: string): CompletionTrend[] {
  return PERIODS.map((period) => {
    const rows = getCohorts({ period, regionCode });
    const assigned = rows.reduce((s, r) => s + r.assigned, 0);
    const completed = rows.reduce((s, r) => s + r.completed, 0);
    const overdue = rows.reduce((s, r) => s + r.overdue, 0);
    return {
      period,
      assigned,
      completed,
      completionPct: pct(completed, assigned),
      overduePct: pct(overdue, assigned),
    };
  });
}

export function buildCompetencyGaps(
  regionCode: string,
  period: string,
): CompetencyGap[] {
  const rows = getCohorts({ period, regionCode });
  return SKILLS.map((sk) => {
    const skills = rows.flatMap((r) =>
      r.skills.filter((s) => s.skillCode === sk.code),
    );
    const current = skills.reduce((a, s) => a + s.current, 0);
    const required = skills.reduce((a, s) => a + s.required, 0);
    const workers = uniqueWorkers(rows, sk.code);
    const suppressed = workers.size < MIN_SAMPLE;
    const currentPct = pct(current, required);
    return {
      skillCode: sk.code,
      label: sk.label,
      requiredPct: 100,
      currentPct,
      gapPct: Math.max(0, Math.round((100 - currentPct) * 10) / 10),
      anonymizedWorkerCount: suppressed ? null : workers.size,
      suppressed,
    };
  }).sort((a, b) => b.gapPct - a.gapPct);
}

export function buildExpiryHeatmap(
  regionCode: string,
  period: string,
): ExpiryHeatCell[] {
  const rows = getCohorts({ period, regionCode });
  const cells: ExpiryHeatCell[] = [];
  let maxCount = 1;
  for (const sk of SKILLS) {
    for (const bucket of BUCKETS) {
      const count = rows.reduce((sum, r) => {
        const s = r.skills.find((x) => x.skillCode === sk.code);
        return sum + (s?.expiry[bucket] ?? 0);
      }, 0);
      maxCount = Math.max(maxCount, count);
      cells.push({
        skillCode: sk.code,
        skillLabel: sk.label,
        bucket,
        count,
        intensity: 0,
      });
    }
  }
  for (const c of cells) {
    c.intensity = Math.round((c.count / maxCount) * 1000) / 1000;
  }
  return cells;
}

export function buildSkillByRegion(
  regionCode: string,
  period: string,
): SkillRegionSlice[] {
  const kids = childrenOf(regionCode);
  const targets = kids.length
    ? kids
    : [getRegion(regionCode)!].filter(Boolean);
  const out: SkillRegionSlice[] = [];
  for (const node of targets) {
    const rows = getCohorts({ period, regionCode: node.code });
    for (const sk of SKILLS) {
      const skills = rows.flatMap((r) =>
        r.skills.filter((s) => s.skillCode === sk.code),
      );
      const current = skills.reduce((a, s) => a + s.current, 0);
      const required = skills.reduce((a, s) => a + s.required, 0);
      const workers = uniqueWorkers(rows, sk.code);
      const suppressed = workers.size < MIN_SAMPLE;
      out.push({
        skillCode: sk.code,
        skillLabel: sk.label,
        regionCode: node.code,
        regionLabel: node.label,
        currentPct: pct(current, required),
        workerCount: suppressed ? null : workers.size,
        suppressed,
      });
    }
  }
  return out;
}

/** AI correlation: competency % vs incident rate (pearson-like across skills). */
export function buildCorrelations(
  regionCode: string,
  period: string,
): CompetencyIncidentCorrelation[] {
  const rows = getCohorts({ period, regionCode });
  const hours = rows.reduce((s, r) => s + r.hours, 0);
  const points = SKILLS.map((sk) => {
    const skills = rows.flatMap((r) =>
      r.skills.filter((s) => s.skillCode === sk.code),
    );
    const current = skills.reduce((a, s) => a + s.current, 0);
    const required = skills.reduce((a, s) => a + s.required, 0);
    const competencyPct = pct(current, required);
    // Proxy: skills with larger gaps attract more of the incident mass
    const gap = Math.max(0, 100 - competencyPct);
    const share = gap / Math.max(1, SKILLS.reduce((s, x) => {
      const sks = rows.flatMap((r) => r.skills.filter((z) => z.skillCode === x.code));
      const cur = sks.reduce((a, z) => a + z.current, 0);
      const req = sks.reduce((a, z) => a + z.required, 0);
      return s + Math.max(0, 100 - pct(cur, req));
    }, 0));
    const incidents = rows.reduce((s, r) => s + r.incidents, 0);
    const incidentRatePer200k = ratePer200k(incidents * share, hours);
    return { sk, competencyPct, incidentRatePer200k };
  });

  const n = points.length;
  const meanC = points.reduce((s, p) => s + p.competencyPct, 0) / n;
  const meanI = points.reduce((s, p) => s + p.incidentRatePer200k, 0) / n;
  let num = 0;
  let denC = 0;
  let denI = 0;
  for (const p of points) {
    const dc = p.competencyPct - meanC;
    const di = p.incidentRatePer200k - meanI;
    num += dc * di;
    denC += dc * dc;
    denI += di * di;
  }
  const pearson =
    denC > 0 && denI > 0 ? num / Math.sqrt(denC * denI) : 0;

  return points
    .map((p) => {
      const local =
        Math.round(
          (pearson * 0.6 +
            ((meanC - p.competencyPct) / 50) *
              ((p.incidentRatePer200k - meanI) / Math.max(0.1, meanI))) *
            100,
        ) / 100;
      const strength = Math.max(-1, Math.min(1, Math.round(local * 100) / 100));
      return {
        skillCode: p.sk.code,
        skillLabel: p.sk.label,
        competencyPct: p.competencyPct,
        incidentRatePer200k: p.incidentRatePer200k,
        correlationStrength: strength,
        insight:
          strength < -0.3
            ? `Higher ${p.sk.label} competency associates with lower incident pressure.`
            : strength > 0.3
              ? `${p.sk.label} gaps align with elevated incident rates — prioritize refreshers.`
              : `${p.sk.label} shows weak coupling to incident rates in this region/period.`,
      };
    })
    .sort((a, b) => a.correlationStrength - b.correlationStrength);
}

export function buildWorkforceRisk(
  gaps: CompetencyGap[],
  trends: CompletionTrend[],
  correlations: CompetencyIncidentCorrelation[],
): WorkforceRiskScore {
  const latest = trends[trends.length - 1];
  const avgGap =
    gaps.reduce((s, g) => s + g.gapPct, 0) / Math.max(1, gaps.length);
  const overdue = latest?.overduePct ?? 0;
  const completionGap = Math.max(0, 95 - (latest?.completionPct ?? 0));
  const corrPressure = correlations
    .filter((c) => c.correlationStrength > 0.25)
    .reduce((s, c) => s + c.incidentRatePer200k * 2, 0);

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(18 + avgGap * 0.55 + overdue * 0.4 + completionGap * 0.5 + corrPressure),
    ),
  );

  return {
    score,
    band:
      score >= 75
        ? "critical"
        : score >= 55
          ? "elevated"
          : score >= 35
            ? "moderate"
            : "low",
    confidence: 0.69,
    drivers: [
      { code: "competency_gap", label: "Average competency gap", weight: Math.round(avgGap * 10) / 10 },
      { code: "overdue", label: "Training overdue %", weight: overdue },
      { code: "completion", label: "Completion shortfall", weight: Math.round(completionGap * 10) / 10 },
      {
        code: "incident_link",
        label: "Competency–incident pressure",
        weight: Math.round(corrPressure * 10) / 10,
      },
    ].sort((a, b) => b.weight - a.weight),
  };
}

export function buildTrainingCompetencyDashboard(
  partial?: Partial<TrainingCompetencySelectors>,
): TrainingCompetencyDashboard {
  const selectors: TrainingCompetencySelectors = {
    regionCode: partial?.regionCode || "GLB",
    period: partial?.period || "2026-Q2",
  };
  const node = getRegion(selectors.regionCode) ?? getRegion("GLB")!;
  selectors.regionCode = node.code;

  const completionTrends = buildCompletionTrends(selectors.regionCode);
  const competencyGaps = buildCompetencyGaps(
    selectors.regionCode,
    selectors.period,
  );
  const correlations = buildCorrelations(
    selectors.regionCode,
    selectors.period,
  );
  const workforceRisk = buildWorkforceRisk(
    competencyGaps,
    completionTrends,
    correlations,
  );
  const topGap = competencyGaps[0];
  const baseRate =
    correlations[0]?.incidentRatePer200k ?? 1.2 + workforceRisk.score / 80;
  const riskForecast = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const predicted =
      Math.round((baseRate + i * 0.05 + (topGap?.gapPct ?? 0) / 200) * 100) / 100;
    return {
      period,
      predictedIncidentRate: predicted,
      bandLow: Math.round((predicted - 0.2) * 100) / 100,
      bandHigh: Math.round((predicted + 0.3) * 100) / 100,
      primaryGapSkill: topGap?.label ?? "General competency",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    revision: getRevision(),
    selectors,
    breadcrumbs: breadcrumbs(selectors.regionCode),
    children: childrenOf(selectors.regionCode),
    completionTrends,
    competencyGaps,
    expiryHeatmap: buildExpiryHeatmap(selectors.regionCode, selectors.period),
    skillByRegion: buildSkillByRegion(selectors.regionCode, selectors.period),
    correlations,
    workforceRisk,
    riskForecast,
    links: {
      jhaFlha: "/pm/jha-flha",
      meetings: "/pm/safety-meetings",
      training: "/pm/training",
      incidents: "/pm/incidents",
      inspections: "/pm/inspections",
    },
    rules: {
      anonymized: true,
      regionalDrilldown: true,
      minSample: MIN_SAMPLE,
      hoursDenominator: 200000,
    },
  };
}
