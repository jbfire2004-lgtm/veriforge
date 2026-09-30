import type { ExtractedField, FraudSignal, MappingCandidate } from "../types";

export class VisionSummarizationEngine {
  summarize(
    title: string,
    fields: ExtractedField[],
    fraud: { score: number; signals: FraudSignal[] },
    mappings: MappingCandidate[],
    extras?: string[]
  ): { text: string; bullets: string[] } {
    const bullets: string[] = [
      `${fields.length} fields extracted`,
      mappings.length ? `${mappings.length} auto-mapped entities` : "No auto-mappings",
      fraud.signals.length ? `${fraud.signals.length} fraud signals (score ${fraud.score})` : "No fraud signals",
      ...(extras ?? []),
    ];
    const text = `${title}: ${bullets.slice(0, 4).join("; ")}`;
    return { text, bullets };
  }
}
