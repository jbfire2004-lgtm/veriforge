"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayTolerantAiEngine = void 0;
const scoring_1 = require("../utils/scoring");
class DelayTolerantAiEngine {
    run(ctx) {
        const sites = ctx.sites ?? [];
        const maxDelay = Math.max(...sites.map((s) => s.commDelayMinutes ?? scoring_1.COMM_DELAYS[s.body] ?? 0), 0);
        const predictedStates = sites.map((s) => {
            const delay = s.commDelayMinutes ?? scoring_1.COMM_DELAYS[s.body] ?? 0;
            return {
                siteId: s.id,
                horizon: delay > 15 ? "T+24h" : "T+4h",
                prediction: delay > 15
                    ? `Autonomous state projection during ${delay}m comm blackout`
                    : "Near-real-time state sync with Earth",
            };
        });
        const blackoutWindows = sites
            .filter((s) => (s.commDelayMinutes ?? scoring_1.COMM_DELAYS[s.body] ?? 0) > 10)
            .map((s) => ({
            siteId: s.id,
            until: new Date(Date.now() + (s.commDelayMinutes ?? 22) * 60 * 1000).toISOString(),
        }));
        return {
            predictedStates,
            prePlannedActions: [
                "Pre-authorize EVA abort during blackout",
                "Pre-stage life support O2 reserve adjustment",
                "Queue sync batch for comm window reopen",
                "Resolve resource conflicts autonomously during blackout",
            ],
            blackoutWindows,
            syncPending: blackoutWindows.length,
            autonomousMode: maxDelay >= 5,
        };
    }
}
exports.DelayTolerantAiEngine = DelayTolerantAiEngine;
//# sourceMappingURL=delay-tolerant-ai.js.map