/**
 * Project-scale and company-scale analytics — planes isolated by default.
 */

import {
  HECA_KEYS,
  LEADING_COMPANY,
  LEADING_PROJECT,
  MIN_SAMPLE,
  mean,
  pct,
  ratePer200k,
} from "./normalize";
import { getFacts, getRevision, REGIONS, type DualFact } from "./store";
import type {
  CompanyScaleDashboard,
  CorrectiveActionsBlock,
  DualScaleSnapshot,
  DualSelectors,
  FocusIndustry,
  LaggingRates,
  LeadingIndicator,
  ProjectScaleDashboard,
  RiskProfile,
} from "./types";

function uniqueTokens(facts: DualFact[]) {
  return new Set(facts.map((f) => f.token));
}

function buildRates(facts: DualFact[]): LaggingRates {
  const tokens = uniqueTokens(facts);
  if (tokens.size < MIN_SAMPLE) {
    return {
      trif: null,
      ltif: null,
      severityIndex: null,
      suppressed: true,
      entityCount: null,
    };
  }
  const hours = facts.reduce((s, f) => s + f.hours, 0);
  return {
    trif: ratePer200k(
      facts.reduce((s, f) => s + f.recordables, 0),
      hours,
    ),
    ltif: ratePer200k(
      facts.reduce((s, f) => s + f.lostTime, 0),
      hours,
    ),
    severityIndex: mean(facts.map((f) => f.severityWeight)),
    suppressed: false,
    entityCount: tokens.size,
  };
}

function buildHeca(facts: DualFact[]): {
  slices: Array<{ category: string; ratePct: number }>;
  suppressed: boolean;
} {
  const tokens = uniqueTokens(facts);
  if (tokens.size < MIN_SAMPLE) {
    return { slices: [], suppressed: true };
  }
  const slices = HECA_KEYS.map((category) => ({
    category,
    ratePct: mean(facts.map((f) => f.heca[category])) ?? 0,
  }));
  return { slices, suppressed: false };
}

function buildLeading(
  facts: DualFact[],
  defs: ReadonlyArray<{ key: string; label: string }>,
): LeadingIndicator[] {
  const tokens = uniqueTokens(facts);
  const suppressed = tokens.size < MIN_SAMPLE;
  return defs.map((d) => ({
    key: d.key,
    label: d.label,
    score: suppressed
      ? null
      : mean(facts.map((f) => f.leading[d.key] ?? 0)),
    suppressed,
  }));
}

function buildCorrective(facts: DualFact[]): CorrectiveActionsBlock {
  const tokens = uniqueTokens(facts);
  if (tokens.size < MIN_SAMPLE) {
    return {
      openAvg: null,
      overdueAvg: null,
      onTimeClosurePct: null,
      aging: (
        ["0-7d", "8-30d", "31-60d", "61-90d", "90d+"] as const
      ).map((bucket) => ({
        bucket,
        count: null,
        sharePct: null,
        ratePer200k: null,
        suppressed: true,
      })),
      suppressed: true,
    };
  }
  const hours = facts.reduce((s, f) => s + f.hours, 0);
  const openAvg = mean(facts.map((f) => f.caOpen ?? 0));
  const overdueAvg = mean(facts.map((f) => f.caOverdue ?? 0));
  const closedOnTime = facts.reduce((s, f) => s + (f.caClosedOnTime ?? 0), 0);
  const closedTotal = facts.reduce((s, f) => s + (f.caClosedTotal ?? 0), 0);
  const bucketTotals: Record<string, number> = {
    "0-7d": 0,
    "8-30d": 0,
    "31-60d": 0,
    "61-90d": 0,
    "90d+": 0,
  };
  for (const f of facts) {
    if (!f.caAging) continue;
    for (const [k, v] of Object.entries(f.caAging)) {
      bucketTotals[k] = (bucketTotals[k] ?? 0) + v;
    }
  }
  const totalAging = Object.values(bucketTotals).reduce((a, b) => a + b, 0) || 1;
  return {
    openAvg,
    overdueAvg,
    onTimeClosurePct: pct(closedOnTime, closedTotal),
    aging: (["0-7d", "8-30d", "31-60d", "61-90d", "90d+"] as const).map(
      (bucket) => ({
        bucket,
        count: bucketTotals[bucket] ?? 0,
        sharePct: pct(bucketTotals[bucket] ?? 0, totalAging),
        ratePer200k: ratePer200k(bucketTotals[bucket] ?? 0, hours),
        suppressed: false,
      }),
    ),
    suppressed: false,
  };
}

function buildRisk(
  rates: LaggingRates,
  leading: LeadingIndicator[],
  ca: CorrectiveActionsBlock,
): RiskProfile {
  if (rates.suppressed) {
    return {
      score: null,
      band: null,
      confidence: null,
      drivers: [],
      suppressed: true,
    };
  }
  const leadingAvg =
    mean(
      leading
        .filter((l) => l.score != null)
        .map((l) => l.score as number),
    ) ?? 60;
  const leadingGap = Math.max(0, 80 - leadingAvg);
  const trifP = (rates.trif ?? 0) * 10;
  const ltifP = (rates.ltif ?? 0) * 14;
  const caP = (ca.overdueAvg ?? 0) * 3;
  const score = Math.max(
    0,
    Math.min(100, Math.round(22 + trifP + ltifP + leadingGap * 0.45 + caP)),
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
    confidence: 0.7,
    drivers: [
      { code: "trif", label: "TRIF pressure", weight: Math.round(trifP * 10) / 10 },
      { code: "ltif", label: "LTIF pressure", weight: Math.round(ltifP * 10) / 10 },
      {
        code: "leading_gap",
        label: "Leading-indicator gap",
        weight: Math.round(leadingGap * 10) / 10,
      },
      {
        code: "ca_overdue",
        label: "Corrective action overdue",
        weight: Math.round(caP * 10) / 10,
      },
    ].sort((a, b) => b.weight - a.weight),
    suppressed: false,
  };
}

export function buildProjectDashboard(args: {
  industry: FocusIndustry;
  period: string;
  regionCode: string;
}): ProjectScaleDashboard {
  const facts = getFacts({
    plane: "project",
    industry: args.industry,
    period: args.period,
    regionCode: args.regionCode,
  });
  const rates = buildRates(facts);
  const heca = buildHeca(facts);
  const leading = buildLeading(facts, LEADING_PROJECT);
  const correctiveActions = buildCorrective(facts);
  return {
    plane: "project",
    industry: args.industry,
    period: args.period,
    heca: heca.slices,
    hecaSuppressed: heca.suppressed,
    rates,
    leading,
    correctiveActions,
    riskProfile: buildRisk(rates, leading, correctiveActions),
  };
}

export function buildCompanyDashboard(args: {
  industry: FocusIndustry;
  period: string;
  regionCode: string;
}): CompanyScaleDashboard {
  const facts = getFacts({
    plane: "company",
    industry: args.industry,
    period: args.period,
    regionCode: args.regionCode,
  });
  const rates = buildRates(facts);
  const heca = buildHeca(facts);
  const leadingMaturity = buildLeading(facts, LEADING_COMPANY);

  const periods = ["2025-Q4", "2026-Q1", "2026-Q2"];
  const competencyTrends = periods.map((period) => {
    const rows = getFacts({
      plane: "company",
      industry: args.industry,
      period,
      regionCode: args.regionCode,
    });
    const tokens = uniqueTokens(rows);
    if (tokens.size < MIN_SAMPLE) {
      return {
        period,
        currentPct: null,
        gapPct: null,
        suppressed: true,
      };
    }
    const current = rows.reduce((s, f) => s + (f.competencyCurrent ?? 0), 0);
    const required = rows.reduce((s, f) => s + (f.competencyRequired ?? 0), 0);
    const currentPct = pct(current, required);
    return {
      period,
      currentPct,
      gapPct: Math.max(0, Math.round((100 - currentPct) * 10) / 10),
      suppressed: false,
    };
  });

  const regionalPerformance = REGIONS.map((regionCode) => {
    const rows = getFacts({
      plane: "company",
      industry: args.industry,
      period: args.period,
      regionCode,
    });
    const r = buildRates(rows);
    const lead = buildLeading(rows, LEADING_COMPANY);
    const leadingMaturityAvg = mean(
      lead.filter((l) => l.score != null).map((l) => l.score as number),
    );
    return {
      regionCode,
      label:
        regionCode === "CA-AB"
          ? "Alberta"
          : regionCode === "CA-BC"
            ? "British Columbia"
            : regionCode === "CA-ON"
              ? "Ontario"
              : regionCode === "US-TX"
                ? "Texas"
                : "Nevada",
      trif: r.trif,
      ltif: r.ltif,
      leadingMaturity: r.suppressed ? null : leadingMaturityAvg,
      entityCount: r.entityCount,
      suppressed: r.suppressed,
    };
  });

  return {
    plane: "company",
    industry: args.industry,
    period: args.period,
    heca: heca.slices,
    hecaSuppressed: heca.suppressed,
    rates,
    leadingMaturity,
    competencyTrends,
    regionalPerformance,
  };
}

export function buildDualScaleSnapshot(
  partial?: Partial<DualSelectors>,
): DualScaleSnapshot {
  const selectors: DualSelectors = {
    industry: partial?.industry ?? "construction",
    period: partial?.period ?? "2026-Q2",
    regionCode: partial?.regionCode ?? "GLB",
    crossPlaneOptIn: !!partial?.crossPlaneOptIn,
  };

  const project = buildProjectDashboard(selectors);
  const company = buildCompanyDashboard(selectors);

  let blended: DualScaleSnapshot["blended"] = null;
  if (selectors.crossPlaneOptIn) {
    const facts = [
      ...getFacts({
        plane: "project",
        industry: selectors.industry,
        period: selectors.period,
        regionCode: selectors.regionCode,
      }),
      ...getFacts({
        plane: "company",
        industry: selectors.industry,
        period: selectors.period,
        regionCode: selectors.regionCode,
      }),
    ];
    blended = {
      rates: buildRates(facts),
      note: "Cross-plane blend enabled by explicit opt-in. Project and company facts remain stored separately.",
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    revision: getRevision(),
    selectors,
    project,
    company,
    blended,
    rules: {
      planesIsolated: !selectors.crossPlaneOptIn,
      crossPlaneOptIn: selectors.crossPlaneOptIn,
      minSample: MIN_SAMPLE,
      hoursDenominator: 200000,
    },
  };
}
