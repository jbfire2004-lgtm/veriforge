import type { CategoryMarketplace, MarketplaceContextInput, MarketplaceDemand, MarketplaceListing, MarketplaceMatch } from "../types";
import { clamp } from "../utils/scoring";

let matchId = 0;

export function matchListingsToDemands(
  listings: MarketplaceListing[],
  demands: MarketplaceDemand[],
  category: string,
  extraFactors: (l: MarketplaceListing, d: MarketplaceDemand) => string[]
): CategoryMarketplace {
  const catListings = listings.filter((l) => l.category === category);
  const catDemands = demands.filter((d) => d.category === category);
  const matches: MarketplaceMatch[] = [];

  for (const d of catDemands) {
    let best: MarketplaceMatch | null = null;
    for (const l of catListings) {
      if (l.region !== d.region && d.urgency !== "emergency") continue;
      const score = computeMatchScore(l, d);
      if (!best || score > best.score) {
        matchId += 1;
        const factors = ["skill_fit", "compliance_ok", "readiness", ...extraFactors(l, d)];
        best = {
          id: `match-${matchId}`,
          listingId: l.id,
          demandId: d.id,
          category,
          score,
          factors,
          anonymized: true,
        };
      }
    }
    if (best) matches.push(best);
  }

  const regionMap = new Map<string, { supply: number; demand: number }>();
  for (const l of catListings) {
    const cur = regionMap.get(l.region) ?? { supply: 0, demand: 0 };
    cur.supply += l.quantity;
    regionMap.set(l.region, cur);
  }
  for (const d of catDemands) {
    const cur = regionMap.get(d.region) ?? { supply: 0, demand: 0 };
    cur.demand += d.quantity;
    regionMap.set(d.region, cur);
  }

  const availabilityMap = [...regionMap.entries()].map(([region, v]) => ({
    region,
    supply: v.supply,
    demand: v.demand,
  }));

  const shortagePredictions = availabilityMap
    .filter((a) => a.demand > a.supply)
    .map((a) => ({
      resource: category,
      deficit: a.demand - a.supply,
      region: a.region,
    }));

  const surplusPredictions = availabilityMap
    .filter((a) => a.supply > a.demand)
    .map((a) => ({
      resource: category,
      surplus: a.supply - a.demand,
      region: a.region,
    }));

  return {
    category,
    matches,
    availabilityMap,
    shortagePredictions,
    surplusPredictions,
    recommendations: shortagePredictions.length
      ? [`Source ${category} from surplus regions via federated pool`]
      : [`${category} market balanced — maintain autonomous listings`],
  };
}

function computeMatchScore(l: MarketplaceListing, d: MarketplaceDemand): number {
  let score = l.readinessScore;
  if (l.complianceOk) score += 15;
  if (l.region === d.region) score += 20;
  if (d.urgency === "emergency") score += 10;
  if (l.skills?.some((s) => d.requiredSkills?.includes(s))) score += 15;
  return clamp(score);
}

export function listingsFromContext(ctx: MarketplaceContextInput): MarketplaceListing[] {
  return ctx.listings ?? [];
}

export function demandsFromContext(ctx: MarketplaceContextInput): MarketplaceDemand[] {
  return ctx.demands ?? [];
}
