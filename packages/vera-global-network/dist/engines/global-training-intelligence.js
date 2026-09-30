"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalTrainingIntelligenceEngine = void 0;
class GlobalTrainingIntelligenceEngine {
    analyze(ctx) {
        const companies = ctx.companies ?? [];
        const expiring = companies.reduce((s, c) => s + (c.expiringTraining ?? 0), 0);
        const nonCompliant = companies.reduce((s, c) => s + (c.nonCompliantWorkers ?? 0), 0);
        return {
            forecast: [
                { certification: "Safety orientation", demand: Math.ceil(expiring * 0.4) },
                { certification: "Equipment competency", demand: Math.ceil(nonCompliant * 0.3) },
                { certification: "Trade-specific", demand: Math.ceil(expiring * 0.3) },
            ],
            gaps: nonCompliant > 0 ? [`${nonCompliant} workers below network compliance threshold`] : [],
            providerPerformance: [
                { providerHash: "prov-network-1", score: 88 },
                { providerHash: "prov-network-2", score: 76 },
            ],
            expiryClusters: expiring > 10 ? [`Q${Math.ceil(new Date().getMonth() / 3) + 1} expiry wave (${expiring} seats)`] : [],
        };
    }
}
exports.GlobalTrainingIntelligenceEngine = GlobalTrainingIntelligenceEngine;
//# sourceMappingURL=global-training-intelligence.js.map