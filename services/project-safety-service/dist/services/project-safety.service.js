"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSafetyService = void 0;
const project_safety_repository_1 = require("../models/project-safety.repository");
const scoring_engine_1 = require("../engines/scoring.engine");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapProfile(p) {
    return {
        id: p.id,
        companyId: p.companyId,
        projectId: p.projectId,
        riskLevel: p.riskLevel,
        requiredJhaTypes: p.requiredJhaTypes,
        requiredInspections: p.requiredInspections,
        requiredTraining: p.requiredTraining,
        requiredEquipmentCertifications: p.requiredEquipmentCertifications,
        requiredPpe: p.requiredPpe,
        requiredEmergencyPlans: p.requiredEmergencyPlans,
        version: p.version,
        status: p.status,
        publishedAt: p.publishedAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    };
}
async function snapshotProfile(projectId, companyId) {
    const profile = await project_safety_repository_1.projectSafetyRepository.findProfile(projectId, companyId);
    if (!profile)
        return;
    const ctx = await project_safety_repository_1.projectSafetyRepository.getScoreContext(projectId, companyId);
    await project_safety_repository_1.projectSafetyRepository.createProfileVersion({
        profileId: profile.id,
        companyId,
        projectId,
        version: profile.version,
        snapshot: {
            profile: mapProfile(profile),
            counts: {
                hazards: ctx.hazards.length,
                controls: ctx.controls.length,
                zones: ctx.zones.length,
                training: ctx.training.length,
                emergency: ctx.emergency.length,
                equipment: ctx.equipment.length,
            },
        },
    });
}
exports.projectSafetyService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async assertProjectCompany(projectId, companyId) {
        const profile = await project_safety_repository_1.projectSafetyRepository.findProfile(projectId, companyId);
        if (profile && profile.companyId !== companyId) {
            throw new errors_1.ForbiddenError('Project does not belong to company');
        }
        return profile;
    },
    async upsertProfile(input) {
        const existing = await project_safety_repository_1.projectSafetyRepository.findProfile(input.projectId, input.companyId);
        const profile = await project_safety_repository_1.projectSafetyRepository.upsertProfile(input);
        if (input.publish) {
            await snapshotProfile(input.projectId, input.companyId);
        }
        else if (existing) {
            await project_safety_repository_1.projectSafetyRepository.bumpProfileVersion(input.projectId, input.companyId, scoring_engine_1.versioningEngine.nextVersion(existing.version));
        }
        logger_1.logger.info('project safety profile updated', {
            projectId: input.projectId,
            companyId: input.companyId,
        });
        const updated = await project_safety_repository_1.projectSafetyRepository.findProfile(input.projectId, input.companyId);
        return mapProfile(updated);
    },
    async addHazard(input) {
        if (input.severity < 1 || input.severity > 5 || input.likelihood < 1 || input.likelihood > 5) {
            throw new errors_1.BadRequestError('severity and likelihood must be between 1 and 5');
        }
        const hazardId = input.hazardId ?? scoring_engine_1.versioningEngine.newId();
        const score = scoring_engine_1.hazardScoringEngine.score(input.severity, input.likelihood);
        const ctx = await project_safety_repository_1.projectSafetyRepository.getScoreContext(input.projectId, input.companyId);
        const prev = ctx.hazards.find((h) => h.hazardId === hazardId);
        const version = prev ? scoring_engine_1.versioningEngine.nextVersion(prev.version) : 1;
        const hazard = await project_safety_repository_1.projectSafetyRepository.upsertHazard({
            ...input,
            hazardId,
            sifPotential: score.sifPotential,
            hecaCategory: score.hecaCategory,
            version,
        });
        return {
            id: hazard.id,
            projectId: hazard.projectId,
            hazardId: hazard.hazardId,
            title: hazard.title,
            severity: hazard.severity,
            likelihood: hazard.likelihood,
            sifPotential: hazard.sifPotential,
            hecaCategory: hazard.hecaCategory,
            requiredControls: hazard.requiredControls,
            version: hazard.version,
            status: hazard.status,
        };
    },
    async addControl(input) {
        if (input.controlStrength < 1 || input.controlStrength > 5) {
            throw new errors_1.BadRequestError('control_strength must be between 1 and 5');
        }
        const controlId = input.controlId ?? scoring_engine_1.versioningEngine.newId();
        const ctx = await project_safety_repository_1.projectSafetyRepository.getScoreContext(input.projectId, input.companyId);
        const prev = ctx.controls.find((c) => c.controlId === controlId);
        const version = prev ? scoring_engine_1.versioningEngine.nextVersion(prev.version) : 1;
        const control = await project_safety_repository_1.projectSafetyRepository.upsertControl({
            ...input,
            controlId,
            version,
        });
        return {
            id: control.id,
            projectId: control.projectId,
            controlId: control.controlId,
            title: control.title,
            controlStrength: control.controlStrength,
            verificationSteps: control.verificationSteps,
            version: control.version,
            status: control.status,
        };
    },
    async addZone(input) {
        const zone = await project_safety_repository_1.projectSafetyRepository.createZone({
            companyId: input.companyId,
            projectId: input.projectId,
            name: input.name,
            type: input.type,
            location: input.location,
            riskLevel: input.riskLevel,
        });
        let rules = null;
        if (input.rules) {
            rules = await project_safety_repository_1.projectSafetyRepository.upsertZoneRule({
                zoneId: zone.id,
                ...input.rules,
            });
        }
        return {
            id: zone.id,
            projectId: zone.projectId,
            name: zone.name,
            type: zone.type,
            location: zone.location,
            riskLevel: zone.riskLevel,
            rules,
        };
    },
    async upsertEquipment(input) {
        const ctx = await project_safety_repository_1.projectSafetyRepository.getScoreContext(input.projectId, input.companyId);
        const prev = ctx.equipment.find((e) => e.ruleKey === input.ruleKey);
        const version = prev ? scoring_engine_1.versioningEngine.nextVersion(prev.version) : 1;
        const rule = await project_safety_repository_1.projectSafetyRepository.upsertEquipmentRule({ ...input, version });
        return {
            id: rule.id,
            projectId: rule.projectId,
            ruleKey: rule.ruleKey,
            requiredInspections: rule.requiredInspections,
            requiredCerts: rule.requiredCerts,
            requiredControls: rule.requiredControls,
            version: rule.version,
        };
    },
    async upsertTraining(input) {
        const ctx = await project_safety_repository_1.projectSafetyRepository.getScoreContext(input.projectId, input.companyId);
        const prev = ctx.training.find((t) => t.role === input.role);
        const version = prev ? scoring_engine_1.versioningEngine.nextVersion(prev.version) : 1;
        const row = await project_safety_repository_1.projectSafetyRepository.upsertTraining({ ...input, version });
        return {
            id: row.id,
            projectId: row.projectId,
            role: row.role,
            requiredCourses: row.requiredCourses,
            version: row.version,
        };
    },
    async createEmergency(input) {
        const plan = await project_safety_repository_1.projectSafetyRepository.createEmergency(input);
        return {
            id: plan.id,
            projectId: plan.projectId,
            planType: plan.planType,
            title: plan.title,
            content: plan.content,
            version: plan.version,
            status: plan.status,
        };
    },
    async getScore(projectId, companyId) {
        const ctx = await project_safety_repository_1.projectSafetyRepository.getScoreContext(projectId, companyId);
        if (!ctx.profile && ctx.hazards.length === 0) {
            throw new errors_1.NotFoundError('Project safety context not found');
        }
        return scoring_engine_1.projectSafetyScoringEngine.compute(projectId, companyId, {
            profile: ctx.profile
                ? {
                    riskLevel: ctx.profile.riskLevel,
                    status: ctx.profile.status,
                    requiredJhaTypes: ctx.profile.requiredJhaTypes,
                    requiredTraining: ctx.profile.requiredTraining,
                    requiredEmergencyPlans: ctx.profile.requiredEmergencyPlans,
                }
                : null,
            hazards: ctx.hazards,
            controls: ctx.controls,
            zones: ctx.zones.map((z) => ({ rules: z.rules, riskLevel: z.riskLevel })),
            training: ctx.training,
            emergency: ctx.emergency,
            equipment: ctx.equipment,
        }, ctx.profile?.version ?? 1);
    },
};
