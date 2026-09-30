import { loadAbstractionConfig } from "./load-config";
import {
  abstractWorkType,
  normalizeEnvironment,
} from "./classify";
import {
  newRedactionAcc,
  sanitizeText,
  truncate,
} from "./sanitize";
import type {
  AbstractionLevel,
  Project,
  ProjectPrompt,
  TranslationContext,
} from "./types";

function resolveLevel(ctx: TranslationContext): AbstractionLevel {
  return ctx.abstractionLevel ?? "strict";
}

/**
 * Convert project details into minimal environment/work context.
 * Drops names, addresses, and company identifiers.
 */
export function translateProjectToPrompt(
  project: Project,
  context: TranslationContext,
): ProjectPrompt {
  const level = resolveLevel(context);
  const cfg = loadAbstractionConfig(level);
  const acc = newRedactionAcc();

  // Intentionally ignore name, companyLegalName, siteAddress, clientName
  const environment = normalizeEnvironment(project.environment);
  const workType = abstractWorkType(project.workType);

  const conditions = (project.conditions ?? [])
    .map((c) => truncate(sanitizeText(c, acc), 80))
    .filter(Boolean)
    .slice(0, cfg.project.maxConditions);

  // Notes may contain PII — sanitize heavily and only keep if relaxed + short
  if (project.notes && level === "relaxed") {
    const note = truncate(sanitizeText(project.notes, acc), 120);
    if (note && !/REDACTED/.test(note)) {
      conditions.push(`note:${note}`);
    }
  }

  const trade =
    cfg.project.includeTrade && project.trade
      ? truncate(sanitizeText(project.trade, acc), 40)
      : undefined;

  const contextBlock = {
    environment,
    workType,
    conditions: conditions.slice(0, cfg.project.maxConditions),
    ...(trade ? { trade } : {}),
  };

  const systemHint =
    "You are a construction safety context assistant. Use only environment, work type, and conditions. Do not use project names, addresses, or company identifiers.";

  const userPrompt = [
    "Project context for safety analysis (minimal, de-identified):",
    JSON.stringify(contextBlock),
  ].join("\n\n");

  return {
    systemHint,
    userPrompt,
    context: contextBlock,
    abstractionLevel: level,
    redactionCount: acc.count,
    rulesApplied: [...acc.rulesApplied],
  };
}
