import { VeraIntelligenceEngine } from "@vera/intelligence";
import type { IntelligenceContext } from "@vera/intelligence";

const engine = new VeraIntelligenceEngine();

export function runOfflineIntelligence(ctx: IntelligenceContext & {
  qrPayload?: string;
  complianceOk?: boolean;
  readinessFactors?: { label: string; value: number }[];
}) {
  return engine.analyzeOffline(ctx);
}
