import type { CategoryMarketplace, MarketplaceContextInput, MatchingResult } from "../types";

export class MarketplaceMatchingEngine {
  match(
    ctx: MarketplaceContextInput,
    categories: CategoryMarketplace[]
  ): MatchingResult {
    const allMatches = categories.flatMap((c) => c.matches);

    return {
      matches: allMatches.sort((a, b) => b.score - a.score),
      skillMatches: allMatches.filter((m) => m.factors.includes("skill_fit") || m.factors.includes("competency_aligned")).length,
      complianceMatches: allMatches.filter((m) => m.factors.includes("compliance_ok")).length,
      readinessMatches: allMatches.filter((m) => m.factors.includes("readiness")).length,
      locationMatches: allMatches.filter((m) => m.score >= 70).length,
    };
  }
}
