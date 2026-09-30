/**
 * FieldOS operations analytics + AI anomaly detection.
 */

import { breadcrumbs, childrenOf, getRegion } from "./geo";
import { MIN_SAMPLE, pct, ratePer200k } from "./normalize";
import {
  getFacts,
  getRevision,
  HAZARD_KEYS,
  NEAR_MISS_KEYS,
  PERIODS,
  SKILLS,
  type FieldFact,
} from "./store";
import type {
  AnomalyDetection,
  CompetencySignal,
  EquipmentAlert,
  FieldOpsDashboard,
  FieldOpsSelectors,
  HazardPattern,
  InspectionTrend,
  NearMissAnalytics,
  RegionalRiskTrend,
} from "./types";

const HAZARD_LABELS: Record<string, string> = {
  gravity: "Gravity / falls",
  electrical: "Electrical",
  mechanical: "Mechanical",
  vehicle: "Vehicle / mobile",
  chemical: "Chemical",
  weather: "Weather / environment",
};

const NEAR_MISS_LABELS: Record<string, string> = {
  struck_by: "Struck-by",
  fall_potential: "Fall potential",
  energy_release: "Energy release",
  vehicle: "Vehicle",
  ergonomic: "Ergonomic",
};

function sumHours(facts: FieldFact[]) {
  return facts.reduce((s, f) => s + f.hours, 0);
}

function uniqueCrews(facts: FieldFact[]) {
  return new Set(facts.map((f) => f.crewToken)).size;
}

export function buildInspectionTrends(
  regionCode: string,
): InspectionTrend[] {
  return PERIODS.map((period) => {
    const facts = getFacts({ period, regionCode });
    const hours = sumHours(facts);
    const completed = facts.reduce((s, f) => s + f.inspectionsCompleted, 0);
    const planned = facts.reduce((s, f) => s + f.inspectionsPlanned, 0);
    const openFindings = facts.reduce((s, f) => s + f.openFindings, 0);
    return {
      period,
      completed,
      openFindings,
      completionRatePct: pct(completed, planned),
      ratePer200k: ratePer200k(completed, hours),
    };
  });
}

export function buildHazardPatterns(
  regionCode: string,
  period: string,
): HazardPattern[] {
  const facts = getFacts({ period, regionCode });
  const prevPeriod =
    PERIODS[Math.max(0, PERIODS.indexOf(period) - 1)] ?? period;
  const prev = getFacts({ period: prevPeriod, regionCode });
  const hours = sumHours(facts);
  const prevHours = sumHours(prev);
  const totals: Record<string, number> = {};
  const prevTotals: Record<string, number> = {};
  for (const h of HAZARD_KEYS) {
    totals[h] = facts.reduce((s, f) => s + (f.hazards[h] ?? 0), 0);
    prevTotals[h] = prev.reduce((s, f) => s + (f.hazards[h] ?? 0), 0);
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  return HAZARD_KEYS.map((h) => {
    const rate = ratePer200k(totals[h]!, hours);
    const prevRate = ratePer200k(prevTotals[h]!, prevHours);
    return {
      hazardClass: h,
      label: HAZARD_LABELS[h] ?? h,
      count: totals[h]!,
      ratePer200k: rate,
      sharePct: pct(totals[h]!, sum),
      trendDelta: Math.round((rate - prevRate) * 100) / 100,
    };
  }).sort((a, b) => b.ratePer200k - a.ratePer200k);
}

export function buildNearMissAnalytics(
  regionCode: string,
  period: string,
): NearMissAnalytics {
  const facts = getFacts({ period, regionCode });
  const hours = sumHours(facts);
  const totals: Record<string, number> = {};
  for (const k of NEAR_MISS_KEYS) {
    totals[k] = facts.reduce((s, f) => s + (f.nearMisses[k] ?? 0), 0);
  }
  const totalCount = Object.values(totals).reduce((a, b) => a + b, 0);
  const highPotential = facts.reduce((s, f) => s + f.highPotentialNearMisses, 0);
  const trend = PERIODS.map((p) => {
    const rows = getFacts({ period: p, regionCode });
    const h = sumHours(rows);
    const c = rows.reduce(
      (s, f) =>
        s + Object.values(f.nearMisses).reduce((a, b) => a + b, 0),
      0,
    );
    return {
      period: p,
      value: c,
      ratePer200k: ratePer200k(c, h),
    };
  });
  return {
    totalRate: ratePer200k(totalCount, hours),
    byCategory: NEAR_MISS_KEYS.map((k) => ({
      category: k,
      label: NEAR_MISS_LABELS[k] ?? k,
      ratePer200k: ratePer200k(totals[k]!, hours),
      sharePct: pct(totals[k]!, totalCount || 1),
    })),
    trend,
    highPotentialPct: pct(highPotential, totalCount || 1),
  };
}

export function buildEquipmentAlerts(
  regionCode: string,
  period: string,
): EquipmentAlert[] {
  const facts = getFacts({ period, regionCode });
  const hours = sumHours(facts) || 1;
  const out: EquipmentAlert[] = [];
  for (const f of facts) {
    for (const a of f.equipAlerts) {
      out.push({
        token: a.token,
        equipmentClass: a.equipmentClass,
        severity: a.severity,
        message: a.message,
        regionCode: f.regionCode,
        detectedAt: new Date().toISOString(),
        rateSignal: ratePer200k(1, hours / Math.max(1, facts.length)),
      });
    }
  }
  return out.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function buildCompetencySignals(
  regionCode: string,
  period: string,
): CompetencySignal[] {
  const facts = getFacts({ period, regionCode });
  return SKILLS.map((s) => {
    const rows = facts.flatMap((f) =>
      f.competency.filter((c) => c.skillBand === s.band),
    );
    const current = rows.reduce((a, r) => a + r.current, 0);
    const required = rows.reduce((a, r) => a + r.required, 0);
    const expiring = rows.reduce((a, r) => a + r.expiring30d, 0);
    const tokens = new Set(rows.flatMap((r) => r.workerTokens));
    const suppressed = tokens.size < MIN_SAMPLE;
    return {
      skillBand: s.band,
      label: s.label,
      currentPct: pct(current, required),
      expiring30dPct: pct(expiring, required),
      gapScore: Math.max(0, Math.round(100 - pct(current, required))),
      anonymizedWorkerCount: suppressed ? null : tokens.size,
      suppressed,
    };
  });
}

export function buildRegionalRiskTrends(
  regionCode: string,
  period: string,
): RegionalRiskTrend[] {
  const kids = childrenOf(regionCode);
  const targets = kids.length ? kids : [getRegion(regionCode)!].filter(Boolean);
  return targets.map((node) => {
    const facts = getFacts({ period, regionCode: node.code });
    const crews = uniqueCrews(facts);
    const suppressed = crews < MIN_SAMPLE;
    if (suppressed) {
      return {
        regionCode: node.code,
        label: node.label,
        level: node.level,
        riskScore: 0,
        band: "low" as const,
        trifProxy: 0,
        hazardRate: 0,
        entityCount: null,
        suppressed: true,
      };
    }
    const hours = sumHours(facts);
    const findings = facts.reduce((s, f) => s + f.openFindings, 0);
    const hazards = facts.reduce(
      (s, f) => s + Object.values(f.hazards).reduce((a, b) => a + b, 0),
      0,
    );
    const near = facts.reduce(
      (s, f) => s + Object.values(f.nearMisses).reduce((a, b) => a + b, 0),
      0,
    );
    const trifProxy = ratePer200k(findings, hours);
    const hazardRate = ratePer200k(hazards, hours);
    const nearRate = ratePer200k(near, hours);
    const riskScore = Math.max(
      0,
      Math.min(100, Math.round(20 + trifProxy * 8 + hazardRate * 0.35 + nearRate * 0.5)),
    );
    return {
      regionCode: node.code,
      label: node.label,
      level: node.level,
      riskScore,
      band:
        riskScore >= 75
          ? "critical"
          : riskScore >= 55
            ? "elevated"
            : riskScore >= 35
              ? "moderate"
              : "low",
      trifProxy,
      hazardRate,
      entityCount: crews,
      suppressed: false,
    };
  });
}

export function detectAnomalies(
  regionCode: string,
  period: string,
): AnomalyDetection[] {
  const near = buildNearMissAnalytics(regionCode, period);
  const hazards = buildHazardPatterns(regionCode, period);
  const inspections = buildInspectionTrends(regionCode);
  const out: AnomalyDetection[] = [];

  const latest = near.trend[near.trend.length - 1];
  const prev = near.trend[near.trend.length - 2];
  if (latest && prev && latest.ratePer200k > prev.ratePer200k * 1.25) {
    out.push({
      id: "anom-nm-spike",
      kind: "spike",
      severity: "high",
      metric: "near_miss_rate",
      headline: "Near-miss rate spike detected",
      detail: `Near-miss rate rose from ${prev.ratePer200k} to ${latest.ratePer200k} per 200k hours in ${period}.`,
      regionCode,
      period,
      score: Math.min(100, Math.round((latest.ratePer200k / Math.max(0.1, prev.ratePer200k)) * 40)),
      confidence: 0.74,
    });
  }

  const topHazard = hazards[0];
  if (topHazard && topHazard.trendDelta > 2) {
    out.push({
      id: "anom-hazard-drift",
      kind: "drift",
      severity: "medium",
      metric: topHazard.hazardClass,
      headline: `${topHazard.label} hazard drift`,
      detail: `${topHazard.label} rate increased by ${topHazard.trendDelta} per 200k vs prior period.`,
      regionCode,
      period,
      score: Math.min(100, Math.round(50 + topHazard.trendDelta * 5)),
      confidence: 0.66,
    });
  }

  const inspLatest = inspections[inspections.length - 1];
  const inspPrev = inspections[inspections.length - 2];
  if (
    inspLatest &&
    inspPrev &&
    inspLatest.completionRatePct < inspPrev.completionRatePct - 8
  ) {
    out.push({
      id: "anom-insp-drop",
      kind: "drop",
      severity: "medium",
      metric: "inspection_completion",
      headline: "Inspection completion drop",
      detail: `Completion fell from ${inspPrev.completionRatePct}% to ${inspLatest.completionRatePct}%.`,
      regionCode,
      period,
      score: Math.min(
        100,
        Math.round(40 + (inspPrev.completionRatePct - inspLatest.completionRatePct)),
      ),
      confidence: 0.7,
    });
  }

  const criticalEquip = buildEquipmentAlerts(regionCode, period).filter(
    (a) => a.severity === "critical",
  );
  if (criticalEquip.length >= 2) {
    out.push({
      id: "anom-equip-cluster",
      kind: "cluster",
      severity: "high",
      metric: "equipment_alerts",
      headline: "Critical equipment alert cluster",
      detail: `${criticalEquip.length} critical anonymized equipment alerts in the selected region band.`,
      regionCode,
      period,
      score: Math.min(100, 55 + criticalEquip.length * 8),
      confidence: 0.71,
    });
  }

  if (!out.length) {
    out.push({
      id: "anom-baseline",
      kind: "drift",
      severity: "low",
      metric: "baseline",
      headline: "No material anomalies",
      detail: "Field signals within expected peer bands for the selected region.",
      regionCode,
      period,
      score: 12,
      confidence: 0.55,
    });
  }

  return out;
}

export function buildFieldOpsDashboard(
  partial?: Partial<FieldOpsSelectors>,
): FieldOpsDashboard {
  const selectors: FieldOpsSelectors = {
    regionCode: partial?.regionCode || "GLB",
    period: partial?.period || "2026-Q2",
  };
  const node = getRegion(selectors.regionCode) ?? getRegion("GLB")!;
  selectors.regionCode = node.code;

  return {
    generatedAt: new Date().toISOString(),
    revision: getRevision(),
    selectors,
    breadcrumbs: breadcrumbs(selectors.regionCode),
    children: childrenOf(selectors.regionCode),
    inspectionTrends: buildInspectionTrends(selectors.regionCode),
    hazardPatterns: buildHazardPatterns(selectors.regionCode, selectors.period),
    nearMiss: buildNearMissAnalytics(selectors.regionCode, selectors.period),
    equipmentAlerts: buildEquipmentAlerts(selectors.regionCode, selectors.period),
    competencySignals: buildCompetencySignals(
      selectors.regionCode,
      selectors.period,
    ),
    regionalRiskTrends: buildRegionalRiskTrends(
      selectors.regionCode,
      selectors.period,
    ),
    anomalies: detectAnomalies(selectors.regionCode, selectors.period),
    rules: {
      normalized: true,
      anonymized: true,
      hoursDenominator: 200000,
      minSample: MIN_SAMPLE,
      regionalDrilldown: true,
    },
  };
}
