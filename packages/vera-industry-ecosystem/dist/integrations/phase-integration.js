"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestNetworkReport = ingestNetworkReport;
function ingestNetworkReport(ctx, network) {
    if (!network)
        return ctx;
    const participants = ctx.participants ??
        (network.context.companies ?? []).map((c) => ({
            companyHash: c.companyHash,
            industry: c.industry ?? "construction",
            region: c.region ?? "NA",
            workerCount: c.workerCount,
            equipmentCount: c.equipmentCount,
            projectCount: c.projectCount,
            sifForms: c.sifForms,
            hecaForms: c.hecaForms,
            energyWheelForms: c.energyWheelForms,
            inspectionFailures: c.inspectionFailures,
            nonCompliantWorkers: c.nonCompliantWorkers,
            expiringTraining: c.expiringTraining,
            dispatchConflicts: c.dispatchConflicts,
        }));
    return {
        ...ctx,
        participants,
        networkRiskScore: network.safety.globalRiskScore,
        networkSafetyScore: network.safety.globalSafetyScore,
        totalWorkers: network.context.totalWorkers,
        totalEquipment: network.context.totalEquipment,
        totalUnionHalls: network.context.totalUnionHalls,
        totalProviders: network.context.totalProviders,
    };
}
//# sourceMappingURL=phase-integration.js.map