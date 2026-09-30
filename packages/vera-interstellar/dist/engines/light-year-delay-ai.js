"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightYearDelayAiEngine = void 0;
const scoring_1 = require("../utils/scoring");
class LightYearDelayAiEngine {
    run(ctx) {
        const assets = ctx.assets ?? [];
        const delays = assets.map((a) => a.commDelayYears ?? scoring_1.SYSTEM_DELAYS_YEARS[a.system] ?? 4);
        const maxDelay = delays.length ? Math.max(...delays) : 4;
        const predictedStates = assets.map((a) => {
            const delay = a.commDelayYears ?? scoring_1.SYSTEM_DELAYS_YEARS[a.system] ?? 4;
            return {
                assetId: a.id,
                horizon: delay > 10 ? "T+20y" : delay > 4 ? "T+8y" : "T+2y",
                prediction: `Autonomous projection across ${delay}y comm delay — no Earth input`,
            };
        });
        const blackoutWindows = assets
            .filter((a) => (a.commDelayYears ?? scoring_1.SYSTEM_DELAYS_YEARS[a.system] ?? 0) >= 4)
            .map((a) => ({
            assetId: a.id,
            untilYears: a.commDelayYears ?? scoring_1.SYSTEM_DELAYS_YEARS[a.system] ?? 4,
        }));
        const missionIntegrity = (0, scoring_1.clamp)(100 - (ctx.interplanetaryRiskScore ?? 20) / 2 - blackoutWindows.length * 5);
        return {
            predictedStates,
            prePlannedActions: [
                "Pre-authorize multi-decade autonomous mission branch",
                "Pre-stage cryosleep rotation schedule",
                "Queue generational sync batch for comm window",
                "Resolve cross-colony conflicts without Earth ack",
                "Maintain scientific mission priorities across generations",
            ],
            blackoutWindows,
            syncPending: blackoutWindows.length,
            autonomousMode: maxDelay >= 4,
            missionIntegrity,
        };
    }
}
exports.LightYearDelayAiEngine = LightYearDelayAiEngine;
//# sourceMappingURL=light-year-delay-ai.js.map