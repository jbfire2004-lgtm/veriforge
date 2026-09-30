import { translateFlhaToPrompt } from "./translate-flha";
import { translateImageToPrompt } from "./translate-image";
import { translateProjectToPrompt } from "./translate-project";
import type {
  FlhaDocument,
  ImageMeta,
  Project,
  SafetyBriefingPrompt,
  TranslationContext,
} from "./types";

/**
 * Example composition: safety briefing prompt from FLHA + optional project/image.
 * Translation only — policy/firewall still gate egress.
 */
export function translateSafetyBriefingToPrompt(
  input: {
    flha: FlhaDocument;
    project?: Project;
    image?: ImageMeta;
  },
  context: TranslationContext,
): SafetyBriefingPrompt {
  const flha = translateFlhaToPrompt(input.flha, context);
  const project = input.project
    ? translateProjectToPrompt(input.project, context)
    : undefined;
  const image = input.image
    ? translateImageToPrompt(input.image, context)
    : undefined;

  const level = context.abstractionLevel ?? "strict";

  const systemHint =
    "You are preparing a construction safety briefing. Use only abstracted hazards, risk levels, mitigation types, and de-identified project/image context. No names, locations, or company identifiers. Return JSON: {\"briefingPoints\":string[],\"focusAreas\":string[],\"ppeReminders\":string[]}.";

  const userPrompt = [
    "Compose a concise safety briefing from the following abstracted inputs.",
    JSON.stringify({
      flha: {
        taskTypes: flha.taskTypes,
        hazards: flha.hazards,
      },
      project: project?.context,
      image: image
        ? {
            sceneDescription: image.sceneDescription,
            hazards: image.hazards,
            equipment: image.equipment,
            conditions: image.conditions,
          }
        : undefined,
    }),
  ].join("\n\n");

  return {
    systemHint,
    userPrompt,
    flha,
    project,
    image,
    abstractionLevel: level,
  };
}
