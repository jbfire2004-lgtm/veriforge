"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerSafetyService = void 0;
const worker_repository_1 = require("../models/worker.repository");
const worker_scoring_engine_1 = require("../engines/worker-scoring.engine");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapProfile(p) {
    return {
        id: p.id,
        companyId: p.companyId,
        workerId: p.workerId,
        role: p.role,
        trade: p.trade,
        medicalRestrictions: p.medicalRestrictions,
        safetyScore: p.safetyScore,
        riskLevel: p.riskLevel,
        updatedAt: p.updatedAt.toISOString(),
    };
}
exports.workerSafetyService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async assertWorkerCompany(workerId, companyId) {
        const profile = await worker_repository_1.workerRepository.findProfile(workerId, companyId);
        if (profile && profile.companyId !== companyId) {
            throw new errors_1.ForbiddenError('Worker does not belong to company');
        }
        return profile;
    },
    async upsertProfile(input) {
        const profile = await worker_repository_1.workerRepository.upsertProfile(input);
        if (input.competencyCode) {
            await worker_repository_1.workerRepository.upsertCompetency({
                companyId: input.companyId,
                workerId: input.workerId,
                competencyCode: input.competencyCode,
                level: input.competencyLevel,
            });
        }
        logger_1.logger.info('worker profile updated', { workerId: input.workerId });
        return mapProfile(profile);
    },
    async addTraining(input) {
        await this.assertWorkerCompany(input.workerId, input.companyId);
        const row = await worker_repository_1.workerRepository.addTraining({
            ...input,
            completionDate: new Date(input.completionDate),
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        });
        return {
            id: row.id,
            workerId: row.workerId,
            courseId: row.courseId,
            completionDate: row.completionDate.toISOString(),
            expiryDate: row.expiryDate?.toISOString() ?? null,
            competencyLevel: row.competencyLevel,
            certificatePath: row.certificatePath,
        };
    },
    async addAuthorization(input) {
        await this.assertWorkerCompany(input.workerId, input.companyId);
        const row = await worker_repository_1.workerRepository.addAuthorization({
            ...input,
            issueDate: new Date(input.issueDate),
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        });
        return {
            id: row.id,
            workerId: row.workerId,
            equipmentType: row.equipmentType,
            authorizationType: row.authorizationType,
            issueDate: row.issueDate.toISOString(),
            expiryDate: row.expiryDate?.toISOString() ?? null,
        };
    },
    async addRestriction(input) {
        let profile = await worker_repository_1.workerRepository.findProfile(input.workerId, input.companyId);
        if (!profile) {
            throw new errors_1.NotFoundError('Worker profile not found — create profile first');
        }
        const row = await worker_repository_1.workerRepository.addRestriction({
            companyId: input.companyId,
            workerId: input.workerId,
            restrictionType: input.restrictionType,
            description: input.description,
            effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        });
        if (input.updateProfile !== false) {
            const existing = profile.medicalRestrictions ?? [];
            const updated = [
                ...existing,
                {
                    restrictionType: input.restrictionType,
                    description: input.description,
                    effectiveDate: row.effectiveDate.toISOString(),
                    expiryDate: row.expiryDate?.toISOString() ?? null,
                },
            ];
            profile = await worker_repository_1.workerRepository.upsertProfile({
                companyId: input.companyId,
                workerId: input.workerId,
                role: profile.role,
                trade: profile.trade ?? undefined,
                medicalRestrictions: updated,
            });
        }
        return {
            id: row.id,
            workerId: row.workerId,
            restrictionType: row.restrictionType,
            description: row.description,
            effectiveDate: row.effectiveDate.toISOString(),
            expiryDate: row.expiryDate?.toISOString() ?? null,
            profile: mapProfile(profile),
        };
    },
    async addExposure(input) {
        if (input.severity < 1 || input.severity > 5 || input.likelihood < 1 || input.likelihood > 5) {
            throw new errors_1.BadRequestError('severity and likelihood must be between 1 and 5');
        }
        await this.assertWorkerCompany(input.workerId, input.companyId);
        const row = await worker_repository_1.workerRepository.addExposure({
            ...input,
            exposureDate: new Date(input.exposureDate),
        });
        return {
            id: row.id,
            workerId: row.workerId,
            hazardId: row.hazardId,
            severity: row.severity,
            likelihood: row.likelihood,
            exposureDate: row.exposureDate.toISOString(),
            riskScore: row.severity * row.likelihood,
        };
    },
    async addCorrective(input) {
        await this.assertWorkerCompany(input.workerId, input.companyId);
        const row = await worker_repository_1.workerRepository.addCorrective(input);
        return {
            id: row.id,
            workerId: row.workerId,
            correctiveActionId: row.correctiveActionId,
            status: row.status,
            assignedAt: row.assignedAt.toISOString(),
        };
    },
    async logAccess(input) {
        await this.assertWorkerCompany(input.workerId, input.companyId);
        return worker_repository_1.workerRepository.addAccessLog(input);
    },
    async recordIncident(input) {
        await this.assertWorkerCompany(input.workerId, input.companyId);
        return worker_repository_1.workerRepository.addIncident({
            ...input,
            incidentDate: new Date(input.incidentDate),
        });
    },
    async getScore(workerId, companyId) {
        const ctx = await worker_repository_1.workerRepository.getScoreContext(workerId, companyId);
        if (!ctx.profile) {
            throw new errors_1.NotFoundError('Worker profile not found');
        }
        const score = worker_scoring_engine_1.workerScoringEngine.compute(workerId, companyId, {
            profile: {
                role: ctx.profile.role,
                medicalRestrictions: ctx.profile.medicalRestrictions,
            },
            training: ctx.training,
            authorizations: ctx.authorizations,
            restrictions: ctx.restrictions,
            exposures: ctx.exposures,
            incidents: ctx.incidents,
            corrective: ctx.corrective,
            accessLogs: ctx.accessLogs,
        });
        await worker_repository_1.workerRepository.updateScore(workerId, companyId, score.score, score.riskLevel);
        return score;
    },
};
