"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestPhases = ingestPhases;
const scoring_1 = require("../utils/scoring");
function ingestPhases(ctx, interplanetary, marketplace) {
    const assets = [...(ctx.assets ?? [])];
    if (assets.length === 0) {
        const risk = interplanetary?.dashboard.interplanetaryRiskScore ?? 30;
        const workers = interplanetary?.context.earthWorkerCount ?? 0;
        assets.push({
            id: "sol-earth",
            name: "Earth Interstellar Command",
            system: "sol",
            kind: "colony",
            crewCount: workers,
            robotCount: Math.ceil(workers * 0.1),
            lifeSupportOk: true,
            powerLevel: 95,
            radiationLevel: 10,
            commDelayYears: scoring_1.SYSTEM_DELAYS_YEARS.sol,
            hazardScore: risk,
        }, {
            id: "ac-colony-1",
            name: "Alpha Centauri Colony One",
            system: "alpha_centauri",
            kind: "colony",
            crewCount: Math.max(20, Math.ceil(workers * 0.02)),
            robotCount: 50,
            lifeSupportOk: true,
            powerLevel: 80,
            radiationLevel: 45,
            commDelayYears: scoring_1.SYSTEM_DELAYS_YEARS.alpha_centauri,
            hazardScore: 35,
            terraformStage: 1,
        }, {
            id: "proxima-b-base",
            name: "Proxima b Surface Base",
            system: "proxima",
            kind: "habitat",
            crewCount: 15,
            robotCount: 30,
            lifeSupportOk: risk < 70,
            powerLevel: 72,
            radiationLevel: 60,
            commDelayYears: scoring_1.SYSTEM_DELAYS_YEARS.proxima,
            hazardScore: 40,
            terraformStage: 2,
        }, {
            id: "gen-ship-horizon",
            name: "Generation Ship Horizon",
            system: "alpha_centauri",
            kind: "generation_ship",
            crewCount: 500,
            robotCount: 200,
            lifeSupportOk: true,
            powerLevel: 68,
            radiationLevel: 50,
            commDelayYears: 4.37,
            hazardScore: 30,
        }, {
            id: "probe-voyager-x",
            name: "Probe Voyager-X",
            system: "trappist_1",
            kind: "probe",
            robotCount: 1,
            lifeSupportOk: true,
            powerLevel: 40,
            radiationLevel: 75,
            commDelayYears: scoring_1.SYSTEM_DELAYS_YEARS.trappist_1,
            hazardScore: 50,
        }, {
            id: "replicate-colony-seed",
            name: "Self-Replicating Colony Seed",
            system: "proxima",
            kind: "replicating_colony",
            crewCount: 8,
            robotCount: 100,
            lifeSupportOk: true,
            powerLevel: 55,
            radiationLevel: 55,
            commDelayYears: scoring_1.SYSTEM_DELAYS_YEARS.proxima,
            hazardScore: 38,
            terraformStage: 1,
        });
    }
    return {
        ...ctx,
        assets,
        interplanetaryRiskScore: interplanetary?.dashboard.interplanetaryRiskScore ?? ctx.interplanetaryRiskScore,
        marketplaceMatchCount: marketplace?.dashboard.matchCount ?? ctx.marketplaceMatchCount,
    };
}
//# sourceMappingURL=phase-integration.js.map