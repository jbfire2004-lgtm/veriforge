"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCompany = analyzeCompany;
function analyzeCompany(input, engines) {
    const complianceScore = engines.risk.toReadiness(engines.risk.score([
        { id: "rate", label: "Compliance rate", weight: 50, value: 100 - input.complianceRate },
        { id: "workers", label: "High-risk workers", weight: 25, value: Math.min(100, input.highRiskWorkers * 5) },
        { id: "equipment", label: "High-risk equipment", weight: 25, value: Math.min(100, input.highRiskEquipment * 5) },
    ]));
    const complianceForecast = engines.predictive.forecastFailure(input.id, "Compliance decline", (100 - input.complianceRate) / 100);
    if (input.highRiskWorkers > 5) {
        engines.recommend.suggest({
            module: "company",
            title: "Review high-risk workers",
            description: `${input.highRiskWorkers} workers need attention`,
            actionType: "workers.filterRisk",
            priority: 75,
        });
    }
    return {
        id: input.id,
        name: input.name,
        complianceScore,
        complianceForecast,
        trainingBudgetForecast: { expiringCount: input.expiringTraining, estimatedRenewals: input.expiringTraining },
        workforcePlanning: { highRiskWorkers: input.highRiskWorkers, highRiskEquipment: input.highRiskEquipment },
        summary: engines.summarize.summarize(`Company ${input.name}`, [
            `Compliance ${input.complianceRate}%`,
            `${input.highRiskWorkers} high-risk workers`,
        ]),
        improvements: input.complianceRate < 85 ? ["Training renewal campaign", "Inspection blitz"] : [],
    };
}
//# sourceMappingURL=company-intelligence.js.map