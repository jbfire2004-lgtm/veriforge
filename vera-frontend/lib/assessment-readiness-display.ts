import type {
  SgaeAssessmentResult,
  SgaeCategory,
  SgaeComplianceAssessment,
  SgaeRoadmapItem,
  SpceAssessmentResult,
  SpceCorrectiveAction,
  SpceRequirementResult,
} from "./assessment-engines-types";

const PRIORITY_ORDER: Record<"High" | "Medium" | "Low", number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const SGAE_CATEGORIES: SgaeCategory[] = [
  "Policy",
  "Procedure",
  "Training",
  "FieldPractice",
  "Records",
];

export function assessmentStatusTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  const normalized = status.toLowerCase();
  if (
    normalized.includes("reject") ||
    normalized.includes("not acceptable") ||
    normalized.includes("notacceptable") ||
    normalized.includes("weak") ||
    normalized.includes("fail")
  ) {
    return "danger";
  }
  if (
    normalized.includes("conditional") ||
    normalized.includes("moderate") ||
    normalized.includes("developing")
  ) {
    return "warning";
  }
  if (normalized.includes("accept") || normalized.includes("strong")) {
    return "success";
  }
  return "neutral";
}

export function formatAssessmentEvaluatedAt(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

export type AssessmentTrendPoint = { evaluatedAt: string; score: number };

export function assessmentHistoryToTrend(
  rows: Array<{ evaluatedAt: string; overallScore: number }>,
): AssessmentTrendPoint[] {
  return rows.map((row) => ({
    evaluatedAt: row.evaluatedAt,
    score: row.overallScore,
  }));
}

export function buildAssessmentScoreTrend(points: AssessmentTrendPoint[]) {
  if (!points.length) {
    return { points: [], delta: null as number | null, direction: null as "up" | "down" | "flat" | null };
  }
  if (points.length < 2) {
    return { points, delta: null, direction: null };
  }
  const latest = points[points.length - 1]!.score;
  const previous = points[points.length - 2]!.score;
  const delta = latest - previous;
  return {
    points,
    delta,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  } as const;
}

export function isSpceRequirementGap(req: SpceRequirementResult): boolean {
  return (
    req.status !== "Accepted" ||
    req.existenceStatus === "Missing" ||
    req.score < 100
  );
}

export function spceGapsFromResult(
  result: SpceAssessmentResult,
): SpceRequirementResult[] {
  return [...result.requirementResults]
    .filter(isSpceRequirementGap)
    .sort((a, b) => a.score - b.score);
}

export function spceCategoryScores(
  result: SpceAssessmentResult,
): Array<{ category: string; score: number; count: number }> {
  const buckets = new Map<string, { total: number; count: number }>();
  for (const req of result.requirementResults) {
    const row = buckets.get(req.category) ?? { total: 0, count: 0 };
    row.total += req.score;
    row.count += 1;
    buckets.set(req.category, row);
  }
  return [...buckets.entries()]
    .map(([category, { total, count }]) => ({
      category,
      score: Math.round(total / count),
      count,
    }))
    .sort((a, b) => a.score - b.score);
}

export function spceRecommendationsFromResult(
  result: SpceAssessmentResult,
): SpceCorrectiveAction[] {
  return [...result.correctiveActions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );
}

export function spceGapSummary(req: SpceRequirementResult): string {
  const issues: string[] = [];
  if (req.existenceStatus === "Missing") issues.push("missing submission");
  if (req.currencyStatus === "Outdated") issues.push("outdated document");
  if (req.structureStatus !== "Complete") {
    issues.push(`${req.structureStatus.toLowerCase()} structure`);
  }
  if (req.legislationStatus === "NotReferenced") {
    issues.push("legislation not referenced");
  }
  if (req.trainingAlignmentStatus === "NotAligned") {
    issues.push("training not aligned");
  }
  if (req.fieldAlignmentStatus === "NotAligned") {
    issues.push("field practice not aligned");
  }
  return issues.length ? issues.join("; ") : req.status;
}

export function smartGapCategoryEntries(result: SgaeAssessmentResult) {
  return SGAE_CATEGORIES.map((category) => ({
    category,
    score: result.categoryScores[category] ?? 0,
    notes: result.categoryNotes[category],
  }));
}

export function isSmartGapCategoryGap(score: number): boolean {
  return score < 85;
}

export function smartGapGapsFromResult(result: SgaeAssessmentResult) {
  const categoryGaps = smartGapCategoryEntries(result)
    .filter((row) => isSmartGapCategoryGap(row.score))
    .map((row) => ({
      kind: "category" as const,
      label: row.category,
      score: row.score,
      detail: row.notes ?? `Category score ${row.score}% is below target.`,
    }));

  const complianceGaps: Array<{
    kind: "compliance";
    label: string;
    score: number;
    detail: string;
  }> = [];

  for (const [label, block] of [
    ["Legislative compliance", result.legislativeCompliance],
    ["Hiring client compliance", result.hiringClientCompliance],
  ] as const) {
    if (block.assessment !== "Strong") {
      complianceGaps.push({
        kind: "compliance",
        label,
        score: complianceAssessmentScore(block),
        detail: block.notes,
      });
    }
  }

  return [...categoryGaps, ...complianceGaps];
}

function complianceAssessmentScore(block: SgaeComplianceAssessment): number {
  if (block.assessment === "Strong") return 100;
  if (block.assessment === "Moderate") return 70;
  return 40;
}

export function smartGapRecommendationsFromResult(
  result: SgaeAssessmentResult,
): SgaeRoadmapItem[] {
  return [...result.correctiveActionRoadmap].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );
}

export function parseSpceAssessmentResult(raw: unknown): SpceAssessmentResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<SpceAssessmentResult>;
  if (
    typeof r.overallScore !== "number" ||
    typeof r.overallStatus !== "string" ||
    !Array.isArray(r.requirementResults)
  ) {
    return null;
  }
  return r as SpceAssessmentResult;
}

export function parseSmartGapAssessmentResult(
  raw: unknown,
): SgaeAssessmentResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<SgaeAssessmentResult>;
  if (
    typeof r.overallGapScore !== "number" ||
    typeof r.overallStatus !== "string" ||
    !r.categoryScores
  ) {
    return null;
  }
  return r as SgaeAssessmentResult;
}
