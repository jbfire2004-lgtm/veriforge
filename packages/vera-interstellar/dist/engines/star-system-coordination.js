"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarSystemCoordinationEngine = void 0;
const scoring_1 = require("../utils/scoring");
let linkId = 0;
class StarSystemCoordinationEngine {
    coordinate(ctx) {
        const assets = ctx.assets ?? [];
        const systems = [...new Set(assets.map((a) => a.system))];
        const links = [];
        const pairs = [
            ["sol", "alpha_centauri"],
            ["sol", "proxima"],
            ["sol", "trappist_1"],
        ];
        for (const [a, b] of pairs) {
            if (systems.includes(a) && systems.includes(b)) {
                linkId += 1;
                const delay = (scoring_1.SYSTEM_DELAYS_YEARS[a] ?? 0) + (scoring_1.SYSTEM_DELAYS_YEARS[b] ?? 0);
                links.push({
                    id: `sl-${linkId}`,
                    from: a,
                    to: b,
                    delayYears: delay,
                    domains: [
                        "workforce",
                        "equipment",
                        "robotics",
                        "habitat",
                        "terraforming",
                        "power",
                        "mining",
                        "science",
                        "safety",
                        "compliance",
                    ],
                    status: delay > 10 ? "generational" : delay > 4 ? "blackout" : "active",
                });
            }
        }
        const colonies = assets.filter((a) => a.kind === "colony" || a.kind === "replicating_colony");
        for (let i = 0; i < colonies.length - 1; i++) {
            linkId += 1;
            links.push({
                id: `sl-${linkId}`,
                from: colonies[i].id,
                to: colonies[i + 1].id,
                delayYears: scoring_1.SYSTEM_DELAYS_YEARS[colonies[i].system] ?? 4,
                domains: ["logistics", "science"],
                status: "generational",
            });
        }
        return {
            links,
            workforceSync: links.map((l) => `Human+robotic workforce sync ${l.from} ↔ ${l.to} (${l.delayYears}y)`),
            roboticsFleets: ["Cross-system robotics manifest federation"],
            miningOps: ["Asteroid belt + regolith mining coordination"],
            scienceMissions: ["Interstellar survey priority queue"],
            safetySync: ["Cosmic hazard broadcast during comm windows"],
        };
    }
}
exports.StarSystemCoordinationEngine = StarSystemCoordinationEngine;
//# sourceMappingURL=star-system-coordination.js.map