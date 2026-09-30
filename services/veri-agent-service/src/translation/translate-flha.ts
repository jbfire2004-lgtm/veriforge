import { loadAbstractionConfig } from "./load-config";
import {
  abstractTaskType,
  classifyMitigationType,
  inferEnergyType,
  inferHazardCategory,
  normalizeRisk,
} from "./classify";
import {
  newRedactionAcc,
  sanitizeText,
  truncate,
} from "./sanitize";
import type {
  AbstractionLevel,
  FlhaDocument,
  FlhaHazardPromptItem,
  FlhaPrompt,
  MitigationType,
  TranslationContext,
} from "./types";

function resolveLevel(ctx: TranslationContext): AbstractionLevel {
  return ctx.abstractionLevel ?? "strict";
}

function uniqueMitigationTypes(
  controls: string[],
  max: number,
): MitigationType[] {
  const out: MitigationType[] = [];
  const seen = new Set<MitigationType>();
  for (const c of controls) {
    const t = classifyMitigationType(c);
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

function abstractHazardSummary(
  cleanedDescription: string,
  category: FlhaHazardPromptItem["category"],
  energyType: string,
  risk: FlhaHazardPromptItem["riskLevel"],
  preferCategoryOnly: boolean,
  maxChars: number,
): string {
  if (preferCategoryOnly) {
    return truncate(
      `${category} hazard (${energyType}), residual risk ${risk}`,
      maxChars,
    );
  }
  return truncate(cleanedDescription, maxChars);
}

/**
 * Convert a full FLHA into a minimal, identifier-free prompt structure.
 * Does not make policy decisions — only abstraction + redaction respect.
 */
export function translateFlhaToPrompt(
  flha: FlhaDocument,
  context: TranslationContext,
): FlhaPrompt {
  const level = resolveLevel(context);
  const cfg = loadAbstractionConfig(level);
  const acc = newRedactionAcc();

  const hazards: FlhaHazardPromptItem[] = [];

  if (flha.hazards?.length) {
    for (const h of flha.hazards.slice(0, cfg.flha.maxHazards)) {
      const rawDesc = h.description ?? "";
      const cleaned = sanitizeText(rawDesc, acc);
      const energyType = h.energyType ?? inferEnergyType(cleaned);
      const category =
        (h.category as FlhaHazardPromptItem["category"] | undefined) ??
        inferHazardCategory(cleaned, energyType);
      const riskLevel = normalizeRisk(h.residualRisk);
      const controlTexts = [
        ...(h.controls ?? []),
        ...(h.mitigations ?? []),
      ].map((c) => sanitizeText(c, acc));

      hazards.push({
        category,
        energyType,
        riskLevel,
        mitigationTypes: uniqueMitigationTypes(
          controlTexts,
          cfg.flha.maxMitigationTypes,
        ),
        summary: abstractHazardSummary(
          cleaned,
          category,
          energyType,
          riskLevel,
          cfg.flha.preferCategoryOnlySummary,
          cfg.flha.maxHazardSummaryChars,
        ),
      });
    }
  } else if (
    cfg.flha.allowNarrativeSentences &&
    flha.narrative?.trim()
  ) {
    const narrative = sanitizeText(flha.narrative, acc);
    const sentences = narrative
      .split(/[.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 12)
      .slice(0, cfg.flha.maxNarrativeSentences);

    for (const s of sentences) {
      const energyType = inferEnergyType(s);
      const category = inferHazardCategory(s, energyType);
      hazards.push({
        category,
        energyType,
        riskLevel: "medium",
        mitigationTypes: [],
        summary: abstractHazardSummary(
          s,
          category,
          energyType,
          "medium",
          cfg.flha.preferCategoryOnlySummary,
          cfg.flha.maxHazardSummaryChars,
        ),
      });
    }
  }

  if (!hazards.length) {
    const title = sanitizeText(flha.title ?? "General task hazard review", acc);
    hazards.push({
      category: "other",
      energyType: "unspecified",
      riskLevel: "medium",
      mitigationTypes: [],
      summary: abstractHazardSummary(
        title,
        "other",
        "unspecified",
        "medium",
        cfg.flha.preferCategoryOnlySummary,
        cfg.flha.maxHazardSummaryChars,
      ),
    });
  }

  const taskTypes = [
    ...new Set(
      (flha.tasks ?? [])
        .map((t) => abstractTaskType(sanitizeText(t, acc)))
        .slice(0, cfg.flha.maxTaskTypes),
    ),
  ];

  const systemHint =
    "You are a construction safety analyst. Use only abstracted hazard categories, risk levels, and mitigation types. Do not invent personal names, locations, or company identifiers. Return JSON only.";

  const payload = {
    taskTypes,
    hazards: hazards.map((h) => ({
      category: h.category,
      energyType: h.energyType,
      riskLevel: h.riskLevel,
      mitigationTypes: h.mitigationTypes,
      summary: h.summary,
    })),
  };

  const userPrompt = [
    "Analyze the following abstracted FLHA hazards.",
    "Preserve categories and risk levels; suggest control gaps only in generic terms.",
    JSON.stringify(payload),
  ].join("\n\n");

  return {
    systemHint,
    userPrompt,
    hazards,
    taskTypes,
    abstractionLevel: level,
    redactionCount: acc.count,
    rulesApplied: [...acc.rulesApplied],
  };
}
