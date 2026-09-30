"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalComplianceIntelligenceEngine = void 0;
const anonymize_1 = require("../utils/anonymize");
class GlobalComplianceIntelligenceEngine {
    analyze(ctx) {
        const companies = ctx.companies ?? [];
        const workers = companies.reduce((s, c) => s + (c.workerCount ?? 0), 0);
        const gaps = companies.reduce((s, c) => s + (c.nonCompliantWorkers ?? 0), 0);
        const rate = workers > 0 ? ((workers - gaps) / workers) * 100 : 100;
        const byRegion = new Map();
        for (const c of companies) {
            const r = c.region ?? "global";
            byRegion.set(r, (byRegion.get(r) ?? 0) + (c.nonCompliantWorkers ?? 0));
        }
        return {
            globalScore: (0, anonymize_1.clamp)(Math.round(rate)),
            trends: [...byRegion.entries()].map(([label, value]) => ({ label, value })),
            regulatoryRisks: gaps > workers * 0.1 ? ["Network compliance drift exceeds 10% threshold"] : [],
            recommendations: [
                "Federated compliance recalc across all tenants",
                gaps > 0 ? "Prioritize network training renewal campaign" : "Maintain compliance posture",
            ],
        };
    }
}
exports.GlobalComplianceIntelligenceEngine = GlobalComplianceIntelligenceEngine;
//# sourceMappingURL=global-compliance-intelligence.js.map