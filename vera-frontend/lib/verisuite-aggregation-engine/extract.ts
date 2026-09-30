/**
 * AI extraction — LLM + vision + scrape modalities (preview simulation).
 */

import { normalizeExtract } from "./normalize";
import type {
  DiscoveredSource,
  ExtractJobResult,
  ExtractModality,
  NormalizedIndustryFact,
  RawExtractedPayload,
} from "./types";

function baseRaw(
  source: DiscoveredSource,
  modality: ExtractModality,
  seed: number,
): RawExtractedPayload {
  const hours = 140000 + (seed % 9) * 12000 + modality.length * 800;
  return {
    sourceId: source.id,
    modality,
    industry: source.industry,
    period: "2026-Q2",
    regionCode:
      source.industry === "mining"
        ? seed % 2 === 0
          ? "US-NV"
          : "CA-AB"
        : source.industry === "construction"
          ? seed % 2 === 0
            ? "CA-AB"
            : "US-TX"
          : seed % 2 === 0
            ? "CA-ON"
            : "US-TX",
    hours,
    recordables: 1 + (seed % 4),
    lostTimeInjuries: seed % 3,
    severityWeight: 1.2 + (seed % 5) * 0.35,
    nearMisses: 4 + (seed % 8),
    leadingMaturity: 55 + (seed % 35),
    // Will be stripped
    organizationName: `External Org ${source.id}`,
    contactEmail: `press@${source.id}.example`,
    authorName: `Analyst ${seed}`,
    siteAddress: `${100 + seed} Industry Ave`,
  };
}

/**
 * Run multi-modal extraction for a discovered source.
 * Order: scrape tables → vision for charts/PDFs → LLM structuring.
 */
export function extractFromSource(
  source: DiscoveredSource,
  seed: number,
): { facts: NormalizedIndustryFact[]; result: ExtractJobResult } {
  const started = Date.now();
  const facts: NormalizedIndustryFact[] = [];
  const stripped = new Set<string>();
  let ok = 0;

  for (const modality of source.modalities) {
    const raw = baseRaw(source, modality, seed + modality.charCodeAt(0));
    // Modality-specific confidence adjustment
    const conf =
      source.confidence *
      (modality === "llm" ? 0.95 : modality === "vision" ? 0.88 : 0.91);
    try {
      const { fact, strippedFields } = normalizeExtract(raw, source.kind, conf);
      facts.push(fact);
      for (const f of strippedFields) stripped.add(f);
      ok += 1;
    } catch {
      // modality failure — continue others
    }
  }

  const status: ExtractJobResult["status"] =
    ok === 0 ? "failed" : ok < source.modalities.length ? "partial" : "ok";

  return {
    facts,
    result: {
      sourceId: source.id,
      modality: source.modalities[0] ?? "llm",
      status,
      factsAdded: facts.length,
      strippedFields: [...stripped],
      durationMs: Math.max(12, Date.now() - started + (seed % 40)),
    },
  };
}
