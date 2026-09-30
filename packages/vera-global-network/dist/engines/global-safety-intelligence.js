"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalSafetyIntelligenceEngine = void 0;
const anonymize_1 = require("../utils/anonymize");
class GlobalSafetyIntelligenceEngine {
    analyze(ctx) {
        const companies = ctx.companies ?? [];
        const totalSif = companies.reduce((s, c) => s + (c.sifForms ?? 0), 0);
        const totalHeca = companies.reduce((s, c) => s + (c.hecaForms ?? 0), 0);
        const totalEnergy = companies.reduce((s, c) => s + (c.energyWheelForms ?? 0), 0);
        const inspections = companies.reduce((s, c) => s + (c.inspectionFailures ?? 0), 0);
        const globalRiskScore = (0, anonymize_1.clamp)(totalSif * 4 + totalHeca * 3 + totalEnergy * 2 + inspections * 2);
        const globalSafetyScore = (0, anonymize_1.clamp)(100 - globalRiskScore);
        return {
            globalSafetyScore,
            globalRiskScore,
            sifPrediction: Math.min(0.9, totalSif * 0.05 + 0.15),
            hecaPrediction: Math.min(0.85, totalHeca * 0.06 + 0.1),
            energyConflictPrediction: Math.min(0.8, totalEnergy * 0.05),
            trends: [
                { label: "SIF signals", delta: totalSif > 10 ? 12 : 0 },
                { label: "Inspection failures", delta: inspections > 5 ? 8 : -2 },
            ],
            recommendations: [
                "Benchmark high-performing tenants for control libraries",
                globalRiskScore > 50 ? "Escalate network-wide safety review" : "Maintain current control posture",
            ],
        };
    }
}
exports.GlobalSafetyIntelligenceEngine = GlobalSafetyIntelligenceEngine;
//# sourceMappingURL=global-safety-intelligence.js.map