"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestPhases = ingestPhases;
const scoring_1 = require("../utils/scoring");
function ingestPhases(ctx, network, industry) {
    const listings = [...(ctx.listings ?? [])];
    const demands = [...(ctx.demands ?? [])];
    const participants = industry?.context.participants?.map((p) => ({
        companyHash: p.companyHash,
        region: p.region,
        workerCount: p.workerCount,
        equipmentCount: p.equipmentCount,
        nonCompliantWorkers: p.nonCompliantWorkers,
        inspectionFailures: p.inspectionFailures,
        expiringTraining: p.expiringTraining,
        sifForms: p.sifForms,
    })) ??
        network?.context.companies?.map((c) => ({
            companyHash: c.companyHash,
            region: c.region,
            workerCount: c.workerCount,
            equipmentCount: c.equipmentCount,
            nonCompliantWorkers: c.nonCompliantWorkers,
            inspectionFailures: c.inspectionFailures,
            expiringTraining: c.expiringTraining,
            sifForms: c.sifForms,
        })) ??
        [];
    for (const p of participants) {
        const hash = p.companyHash;
        const region = p.region ?? "NA";
        const workers = p.workerCount ?? 0;
        const equipment = p.equipmentCount ?? 0;
        const gaps = p.nonCompliantWorkers ?? 0;
        if (workers > 0) {
            listings.push({
                id: `wl-${hash}`,
                sellerHash: hash,
                category: "workforce",
                resourceType: "dispatch_available",
                region,
                quantity: Math.max(0, workers - gaps),
                readinessScore: Math.max(40, 100 - gaps * 2),
                complianceOk: gaps < workers * 0.1,
                skills: ["general", "trade"],
            });
        }
        if (gaps > 0) {
            demands.push({
                id: `wd-${hash}`,
                buyerHash: hash,
                category: "workforce",
                resourceType: "project_assignment",
                region,
                quantity: gaps,
                urgency: gaps > 10 ? "high" : "normal",
                requiredSkills: ["trade"],
            });
        }
        if (equipment > 0) {
            const failures = p.inspectionFailures ?? 0;
            listings.push({
                id: `el-${hash}`,
                sellerHash: hash,
                category: "equipment",
                resourceType: "rental",
                region,
                quantity: Math.max(0, equipment - failures),
                readinessScore: Math.max(30, 100 - failures * 5),
                complianceOk: failures === 0,
            });
            if (failures > 2) {
                demands.push({
                    id: `ed-${hash}`,
                    buyerHash: hash,
                    category: "equipment",
                    resourceType: "emergency_deploy",
                    region,
                    quantity: failures,
                    urgency: "emergency",
                });
            }
        }
        const expiring = p.expiringTraining ?? 0;
        if (expiring > 0) {
            demands.push({
                id: `td-${hash}`,
                buyerHash: hash,
                category: "training",
                resourceType: "session",
                region,
                quantity: expiring,
                urgency: "normal",
            });
            listings.push({
                id: `tl-${(0, scoring_1.hashId)(hash, "prov")}`,
                sellerHash: (0, scoring_1.hashId)(hash, "prov"),
                category: "provider",
                resourceType: "training_provider",
                region,
                quantity: Math.ceil(expiring * 1.2),
                readinessScore: 85,
                complianceOk: true,
            });
        }
        const sif = p.sifForms ?? 0;
        if (sif > 0) {
            demands.push({
                id: `sd-${hash}`,
                buyerHash: hash,
                category: "safety_services",
                resourceType: "sif_specialist",
                region,
                quantity: sif,
                urgency: "high",
            });
        }
        if (gaps > 5) {
            demands.push({
                id: `cd-${hash}`,
                buyerHash: hash,
                category: "compliance_services",
                resourceType: "auditor",
                region,
                quantity: Math.ceil(gaps / 5),
                urgency: "normal",
            });
        }
    }
    return {
        ...ctx,
        listings,
        demands,
        industryRiskScore: industry?.risk.industryScore ?? ctx.industryRiskScore,
        industryReadinessScore: industry?.readiness.industryReadinessScore ?? ctx.industryReadinessScore,
        networkSafetyScore: network?.safety.globalSafetyScore ?? ctx.networkSafetyScore,
        totalWorkers: ctx.totalWorkers ?? network?.context.totalWorkers,
        totalEquipment: ctx.totalEquipment ?? network?.context.totalEquipment,
        totalProviders: ctx.totalProviders ?? network?.context.totalProviders,
    };
}
//# sourceMappingURL=phase-integration.js.map