import type { GlobalEquipmentIntelligence, NetworkContextInput } from "../types";
import { clamp } from "../utils/anonymize";

export class GlobalEquipmentIntelligenceEngine {
  analyze(ctx: NetworkContextInput): GlobalEquipmentIntelligence {
    const companies = ctx.companies ?? [];
    const failures = companies.reduce((s, c) => s + (c.inspectionFailures ?? 0), 0);
    const equipment = companies.reduce((s, c) => s + (c.equipmentCount ?? 0), 0);
    const failureRate = equipment > 0 ? failures / equipment : 0;

    return {
      reliabilityScore: clamp(100 - failureRate * 200),
      riskScore: clamp(failureRate * 150),
      failurePredictions: [
        { pattern: "Overdue inspection cascade", probability: Math.min(0.85, failureRate * 3) },
        { pattern: "Fleet lockout clustering", probability: failures > 10 ? 0.6 : 0.25 },
      ],
      lockoutPatterns: failures > 0 ? ["Inspection-failure lockout chain detected network-wide"] : [],
      recommendations: [
        "Share preventive maintenance intervals across similar equipment classes",
        failureRate > 0.05 ? "Network maintenance surge recommended" : "Continue federated reliability monitoring",
      ],
    };
  }
}
