import type { Project } from "../translation/types";
import { abstractWorkType, normalizeEnvironment } from "../translation/classify";

export type SuggestedHazard = {
  category: string;
  energyType: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  mitigationTypes: string[];
  source: "project_context" | "general_pattern";
};

/**
 * AI-assist hazard suggestions for Review FLHA.
 * Uses only abstracted project context + general patterns —
 * NEVER contractor-specific FLHA content.
 */
export function suggestReviewHazards(input: {
  project?: Project;
  areaType?: string;
  workActivities?: string[];
}): SuggestedHazard[] {
  const suggestions: SuggestedHazard[] = [];
  const seen = new Set<string>();

  const push = (s: SuggestedHazard) => {
    const key = `${s.category}:${s.energyType}`;
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(s);
  };

  const env = normalizeEnvironment(input.project?.environment);
  const workType = abstractWorkType(input.project?.workType);
  const activities = (input.workActivities ?? []).map((a) => a.toLowerCase());
  const area = (input.areaType ?? "").toLowerCase();
  const conditions = (input.project?.conditions ?? []).map((c) =>
    c.toLowerCase(),
  );

  // General construction patterns
  push({
    category: "fall",
    energyType: "gravitational",
    riskLevel: "high",
    summary: "fall hazard (gravitational), residual risk high",
    mitigationTypes: ["engineering", "ppe", "administrative"],
    source: "general_pattern",
  });

  push({
    category: "struck_by",
    energyType: "kinetic",
    riskLevel: "medium",
    summary: "struck_by hazard (kinetic), residual risk medium",
    mitigationTypes: ["administrative", "ppe"],
    source: "general_pattern",
  });

  if (
    env === "outdoor" ||
    conditions.some((c) => /wind|weather|ice|rain/.test(c))
  ) {
    push({
      category: "environmental",
      energyType: "environmental",
      riskLevel: "medium",
      summary: "environmental hazard (weather/site conditions), residual risk medium",
      mitigationTypes: ["administrative", "ppe"],
      source: "project_context",
    });
  }

  if (env === "indoor" || /confined|enclosed|indoor/.test(area)) {
    push({
      category: "caught_in",
      energyType: "mechanical",
      riskLevel: "medium",
      summary: "caught_in / confined-space awareness (mechanical), residual risk medium",
      mitigationTypes: ["administrative", "engineering"],
      source: "project_context",
    });
  }

  if (
    workType === "industrial" ||
    workType === "maintenance" ||
    activities.some((a) => /electric|loto|panel/.test(a)) ||
    /electrical|energized/.test(area)
  ) {
    push({
      category: "electrical",
      energyType: "electrical",
      riskLevel: "high",
      summary: "electrical hazard (electrical), residual risk high",
      mitigationTypes: ["elimination", "engineering", "ppe"],
      source: "project_context",
    });
  }

  if (
    activities.some((a) => /excav|trench|dig/.test(a)) ||
    /excav|trench/.test(area)
  ) {
    push({
      category: "fall",
      energyType: "gravitational",
      riskLevel: "critical",
      summary: "excavation / trench collapse awareness (gravitational), residual risk critical",
      mitigationTypes: ["engineering", "administrative"],
      source: "project_context",
    });
  }

  if (
    activities.some((a) => /hot.?work|weld|cut/.test(a)) ||
    conditions.some((c) => /hot.?work/.test(c))
  ) {
    push({
      category: "thermal",
      energyType: "thermal",
      riskLevel: "high",
      summary: "thermal / hot-work hazard (thermal), residual risk high",
      mitigationTypes: ["administrative", "ppe", "engineering"],
      source: "project_context",
    });
  }

  if (input.project?.trade?.toLowerCase().includes("chem")) {
    push({
      category: "chemical",
      energyType: "chemical",
      riskLevel: "high",
      summary: "chemical exposure hazard (chemical), residual risk high",
      mitigationTypes: ["ppe", "engineering", "administrative"],
      source: "project_context",
    });
  }

  return suggestions.slice(0, 8);
}
