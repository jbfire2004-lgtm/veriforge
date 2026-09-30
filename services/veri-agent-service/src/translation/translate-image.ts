import { loadAbstractionConfig } from "./load-config";
import {
  hashKey,
  newRedactionAcc,
  sanitizeText,
  truncate,
} from "./sanitize";
import type {
  AbstractionLevel,
  ImageMeta,
  ImagePrompt,
  TranslationContext,
} from "./types";

function resolveLevel(ctx: TranslationContext): AbstractionLevel {
  return ctx.abstractionLevel ?? "strict";
}

function dropPeopleRefs(text: string, enabled: boolean): string {
  if (!enabled) return text;
  return text
    .replace(
      /\b(worker|person|man|woman|employee|operator|foreman)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/gi,
      "$1 [ROLE]",
    )
    .replace(/\b(he|she|his|her|they)\b/gi, "personnel");
}

/**
 * Convert image metadata (+ optional local vision output) into a text-only prompt.
 * Never embeds raw image bytes in the prompt body.
 */
export function translateImageToPrompt(
  imageMeta: ImageMeta,
  context: TranslationContext,
): ImagePrompt {
  const level = resolveLevel(context);
  const cfg = loadAbstractionConfig(level);
  const acc = newRedactionAcc();

  const vision = imageMeta.vision;
  const rawDescription =
    vision?.sceneDescription?.trim() ||
    imageMeta.caption?.trim() ||
    (imageMeta.objectKey
      ? "Site image referenced by object key; local vision features only"
      : "Image metadata without caption; feature stub only");

  let sceneDescription = truncate(
    dropPeopleRefs(sanitizeText(rawDescription, acc), cfg.image.dropPeopleReferences),
    cfg.image.maxDescriptionChars,
  );

  const hazards = (vision?.hazardsSuspected ?? [])
    .map((h) => truncate(sanitizeText(h, acc), 120))
    .filter(Boolean)
    .slice(0, cfg.image.maxLabels);

  const equipment = (vision?.equipment ?? [])
    .map((e) => truncate(sanitizeText(e, acc), 80))
    .filter(Boolean)
    .slice(0, cfg.image.maxLabels);

  const conditions = (vision?.conditions ?? [])
    .map((c) => truncate(sanitizeText(c, acc), 80))
    .filter(Boolean)
    .slice(0, cfg.image.maxLabels);

  const labels = (vision?.labels ?? [])
    .map((l) => truncate(sanitizeText(l, acc), 64))
    .filter(Boolean)
    .slice(0, cfg.image.maxLabels);

  const features: string[] = [...labels];
  if (imageMeta.objectKey) {
    features.push(
      cfg.image.hashObjectKeys
        ? hashKey(imageMeta.objectKey)
        : "object_ref:present",
    );
  }
  if (imageMeta.mimeType) {
    features.push(`mime:${sanitizeText(imageMeta.mimeType, acc)}`);
  }
  if (imageMeta.width && imageMeta.height) {
    features.push(`dims:${imageMeta.width}x${imageMeta.height}`);
  }
  // Signal bytes exist without including them
  if (imageMeta.imageBase64) features.push("bytes_present");

  if (!hazards.length && /trench|excav|scaffold|ladder|fall/i.test(sceneDescription)) {
    hazards.push("potential_fall_or_excavation_hazard");
  }

  const systemHint =
    "You are a construction site visual safety assistant. Describe scene, equipment, conditions, and suspected hazards in generic terms. No people names or locations. Return JSON only.";

  const userPrompt = [
    "Describe hazards and conditions from this abstracted site image context.",
    JSON.stringify({
      sceneDescription,
      hazards,
      equipment,
      conditions,
      features: features.slice(0, cfg.image.maxLabels + 4),
    }),
  ].join("\n\n");

  return {
    systemHint,
    userPrompt,
    sceneDescription,
    hazards,
    equipment,
    conditions,
    features,
    includesRawImage: false,
    abstractionLevel: level,
    redactionCount: acc.count,
    rulesApplied: [...acc.rulesApplied],
  };
}
