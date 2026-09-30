/**
 * Project Safety analytics — leading/lagging, trends, risk, industry compare.
 * All rate metrics normalized per 200,000 hours.
 */

import { pct, ratePer200k, clampScore } from "./normalize";
import { getPeerProjects, getProject, listProjects, type PeriodCounts, type ProjectFact } from "./store";
import { HOURS_DENOMINATOR } from "./types";
import type {
  CorrectiveActionAging,
  FocusAuditTrend,
  IncidentTrend,
  IndustryCompareRow,
  IntelligentInspectionTrend,
  LaggingIndicators,
  LeadingIndicators,
  ProjectRiskProfile,
  ProjectSafetySelectors,
  RateMetric,
} from "./types";

function periodOf(p: ProjectFact, period: string): PeriodCounts | undefined {
  return p.periods.find((x) => x.period === period) ?? p.periods[p.periods.length - 1];
}

function metric(
  key: string,
  label: string,
  value: number,
  unit: RateMetric["unit"],
  formula: string,
): RateMetric {
  return { key, label, value, unit, formula };
}

export function buildLeading(c: PeriodCounts): LeadingIndicators {
  return {
    observationRate: metric(
      "observation_rate",
      "Observation rate",
      ratePer200k(c.observations, c.hours),
      "per_200k",
      "(observations / hours) × 200000",
    ),
    nearMissRate: metric(
      "near_miss_rate",
      "Near-miss rate",
      ratePer200k(c.nearMisses, c.hours),
      "per_200k",
      "(near_misses / hours) × 200000",
    ),
    toolboxTalkRate: metric(
      "toolbox_talk_rate",
      "Toolbox talk rate",
      ratePer200k(c.toolboxTalks, c.hours),
      "per_200k",
      "(toolbox_talks / hours) × 200000",
    ),
    trainingCurrencyPct: metric(
      "training_currency",
      "Training currency",
      pct(c.trainingCurrent, c.trainingRequired),
      "pct",
      "(current / required) × 100",
    ),
    permitCompliancePct: metric(
      "permit_compliance",
      "Permit compliance",
      pct(c.permitsCompliant, c.permitsTotal),
      "pct",
      "(compliant / total) × 100",
    ),
    inspectionCompletionPct: metric(
      "inspection_completion",
      "Inspection completion",
      pct(c.inspectionsDone, c.inspectionsPlanned),
      "pct",
      "(done / planned) × 100",
    ),
  };
}

export function buildLagging(c: PeriodCounts): LaggingIndicators {
  return {
    trif: metric(
      "trif",
      "TRIF",
      ratePer200k(c.recordables, c.hours),
      "per_200k",
      "(recordables / hours) × 200000",
    ),
    ltif: metric(
      "ltif",
      "LTIF",
      ratePer200k(c.lostTime, c.hours),
      "per_200k",
      "(lost_time / hours) × 200000",
    ),
    severityIndex: metric(
      "severity",
      "Severity index",
      Math.round(c.severityWeight * 10) / 10,
      "score",
      "weighted severity of recordables",
    ),
    recordableRate: metric(
      "recordable_rate",
      "Recordable rate",
      ratePer200k(c.recordables, c.hours),
      "per_200k",
      "(recordables / hours) × 200000",
    ),
    firstAidRate: metric(
      "first_aid_rate",
      "First-aid rate",
      ratePer200k(c.firstAids, c.hours),
      "per_200k",
      "(first_aids / hours) × 200000",
    ),
  };
}

export function buildIncidentTrends(p: ProjectFact): IncidentTrend {
  return {
    recordables: p.periods.map((c) => ({
      period: c.period,
      value: ratePer200k(c.recordables, c.hours),
    })),
    nearMisses: p.periods.map((c) => ({
      period: c.period,
      value: ratePer200k(c.nearMisses, c.hours),
    })),
    lostTime: p.periods.map((c) => ({
      period: c.period,
      value: ratePer200k(c.lostTime, c.hours),
    })),
  };
}

export function buildFocusAuditTrends(p: ProjectFact): FocusAuditTrend[] {
  return p.periods.map((c) => ({
    period: c.period,
    auditsCompleted: c.auditsCompleted,
    findingsRate: ratePer200k(c.auditFindings, c.hours),
    criticalFindingsRate: ratePer200k(c.auditCritical, c.hours),
    closurePct: pct(c.auditClosed, Math.max(1, c.auditFindings)),
  }));
}

export function buildIntelligentInspectionTrends(
  p: ProjectFact,
): IntelligentInspectionTrend[] {
  return p.periods.map((c) => ({
    period: c.period,
    inspectionsCompleted: c.intelligentInspections,
    aiFlaggedRate: ratePer200k(c.aiFlagged, c.hours),
    highRiskClosurePct: pct(c.highRiskClosed, c.highRiskTotal),
    coveragePct: pct(c.inspectionsDone, c.inspectionsPlanned),
  }));
}

export function buildCorrectiveAging(c: PeriodCounts): CorrectiveActionAging {
  const total = Object.values(c.caAging).reduce((a, b) => a + b, 0) || 1;
  const buckets = (
    ["0-7d", "8-30d", "31-60d", "61-90d", "90d+"] as const
  ).map((bucket) => ({
    bucket,
    count: c.caAging[bucket],
    sharePct: pct(c.caAging[bucket], total),
    ratePer200k: ratePer200k(c.caAging[bucket], c.hours),
  }));
  return {
    openCount: c.caOpen,
    overdueCount: c.caOverdue,
    avgAgeDays:
      c.caOpen > 0 ? Math.round((c.caAgeSumDays / c.caOpen) * 10) / 10 : 0,
    onTimeClosurePct: pct(c.caClosedOnTime, c.caClosedTotal),
    aging: buckets,
  };
}

export function buildRiskProfile(
  leading: LeadingIndicators,
  lagging: LaggingIndicators,
  ca: CorrectiveActionAging,
): ProjectRiskProfile {
  const trifPressure = lagging.trif.value * 12;
  const ltifPressure = lagging.ltif.value * 18;
  const leadingGap =
    Math.max(0, 85 - leading.trainingCurrencyPct.value) * 0.35 +
    Math.max(0, 90 - leading.permitCompliancePct.value) * 0.4 +
    Math.max(0, 20 - leading.nearMissRate.value) * 0.5;
  const caPressure = ca.overdueCount * 4 + Math.max(0, ca.avgAgeDays - 21) * 0.6;
  const score = clampScore(28 + trifPressure + ltifPressure + leadingGap + caPressure);

  const drivers = [
    { code: "trif", label: "TRIF pressure", weight: roundW(trifPressure) },
    { code: "ltif", label: "LTIF pressure", weight: roundW(ltifPressure) },
    { code: "leading_gap", label: "Leading-indicator gap", weight: roundW(leadingGap) },
    { code: "ca_aging", label: "Corrective action aging", weight: roundW(caPressure) },
  ].sort((a, b) => b.weight - a.weight);

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
    confidence: 0.68,
    drivers,
  };
}

function roundW(n: number) {
  return Math.round(n * 10) / 10;
}

const MIN_PEER = 3;

export function buildIndustryComparison(args: {
  project: ProjectFact;
  period: string;
  leading: LeadingIndicators;
  lagging: LaggingIndicators;
  crossCategoryOptIn: boolean;
}): IndustryCompareRow[] {
  const peers = getPeerProjects({
    projectType: args.project.projectType,
    region: args.project.region,
    scale: args.project.scale,
    excludeToken: args.project.token,
    crossCategoryOptIn: args.crossCategoryOptIn,
  });

  const suppressed = peers.length < MIN_PEER;

  const peerMeans = (() => {
    if (suppressed) return null;
    const rows = peers
      .map((p) => periodOf(p, args.period))
      .filter((x): x is PeriodCounts => !!x);
    if (!rows.length) return null;
    const avg = (fn: (c: PeriodCounts) => number) =>
      Math.round((rows.reduce((s, c) => s + fn(c), 0) / rows.length) * 100) / 100;
    return {
      trif: avg((c) => ratePer200k(c.recordables, c.hours)),
      ltif: avg((c) => ratePer200k(c.lostTime, c.hours)),
      nearMiss: avg((c) => ratePer200k(c.nearMisses, c.hours)),
      observation: avg((c) => ratePer200k(c.observations, c.hours)),
      training: avg((c) => pct(c.trainingCurrent, c.trainingRequired)),
      permit: avg((c) => pct(c.permitsCompliant, c.permitsTotal)),
    };
  })();

  const row = (
    metric: string,
    label: string,
    projectValue: number,
    industryValue: number | null,
    unit: IndustryCompareRow["unit"],
  ): IndustryCompareRow => ({
    metric,
    label,
    projectValue,
    industryValue: suppressed ? null : industryValue,
    delta:
      suppressed || industryValue == null
        ? null
        : Math.round((projectValue - industryValue) * 100) / 100,
    suppressed,
    unit,
  });

  return [
    row("trif", "TRIF", args.lagging.trif.value, peerMeans?.trif ?? null, "per_200k"),
    row("ltif", "LTIF", args.lagging.ltif.value, peerMeans?.ltif ?? null, "per_200k"),
    row(
      "near_miss",
      "Near-miss rate",
      args.leading.nearMissRate.value,
      peerMeans?.nearMiss ?? null,
      "per_200k",
    ),
    row(
      "observations",
      "Observation rate",
      args.leading.observationRate.value,
      peerMeans?.observation ?? null,
      "per_200k",
    ),
    row(
      "training",
      "Training currency",
      args.leading.trainingCurrencyPct.value,
      peerMeans?.training ?? null,
      "pct",
    ),
    row(
      "permits",
      "Permit compliance",
      args.leading.permitCompliancePct.value,
      peerMeans?.permit ?? null,
      "pct",
    ),
  ];
}

export function resolveProject(selectors: Partial<ProjectSafetySelectors>): {
  project: ProjectFact;
  selectors: ProjectSafetySelectors;
} {
  const all = listProjects();
  let project =
    (selectors.projectToken && getProject(selectors.projectToken)) || undefined;

  if (!project) {
    const candidates = all.filter((p) => {
      if (selectors.projectType && p.projectType !== selectors.projectType) return false;
      if (selectors.region && p.region !== selectors.region) return false;
      if (selectors.scale && p.scale !== selectors.scale) return false;
      return true;
    });
    project =
      candidates[0] ??
      all.find((p) => p.projectType === selectors.projectType) ??
      all[0]!;
  }

  return {
    project,
    selectors: {
      projectToken: project.token,
      projectType: project.projectType,
      region: project.region,
      scale: project.scale,
      period: selectors.period ?? "2026-Q2",
      crossCategoryOptIn: !!selectors.crossCategoryOptIn,
    },
  };
}

export { HOURS_DENOMINATOR, periodOf };
