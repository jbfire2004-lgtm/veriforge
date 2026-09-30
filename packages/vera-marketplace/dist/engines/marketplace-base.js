"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchListingsToDemands = matchListingsToDemands;
exports.listingsFromContext = listingsFromContext;
exports.demandsFromContext = demandsFromContext;
const scoring_1 = require("../utils/scoring");
let matchId = 0;
function matchListingsToDemands(listings, demands, category, extraFactors) {
    const catListings = listings.filter((l) => l.category === category);
    const catDemands = demands.filter((d) => d.category === category);
    const matches = [];
    for (const d of catDemands) {
        let best = null;
        for (const l of catListings) {
            if (l.region !== d.region && d.urgency !== "emergency")
                continue;
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
        if (best)
            matches.push(best);
    }
    const regionMap = new Map();
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
function computeMatchScore(l, d) {
    let score = l.readinessScore;
    if (l.complianceOk)
        score += 15;
    if (l.region === d.region)
        score += 20;
    if (d.urgency === "emergency")
        score += 10;
    if (l.skills?.some((s) => d.requiredSkills?.includes(s)))
        score += 15;
    return (0, scoring_1.clamp)(score);
}
function listingsFromContext(ctx) {
    return ctx.listings ?? [];
}
function demandsFromContext(ctx) {
    return ctx.demands ?? [];
}
//# sourceMappingURL=marketplace-base.js.map