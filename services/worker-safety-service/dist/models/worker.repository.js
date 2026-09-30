"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? []);
}
exports.workerRepository = {
    findProfile(workerId, companyId) {
        return prisma_1.prisma.workerProfile.findFirst({ where: { workerId, companyId } });
    },
    upsertProfile(data) {
        return prisma_1.prisma.workerProfile.upsert({
            where: { workerId: data.workerId },
            create: {
                companyId: data.companyId,
                workerId: data.workerId,
                role: data.role,
                trade: data.trade,
                medicalRestrictions: json(data.medicalRestrictions ?? []),
            },
            update: {
                role: data.role,
                trade: data.trade,
                medicalRestrictions: data.medicalRestrictions != null ? json(data.medicalRestrictions) : undefined,
            },
        });
    },
    updateScore(workerId, companyId, safetyScore, riskLevel) {
        return prisma_1.prisma.workerProfile.updateMany({
            where: { workerId, companyId },
            data: { safetyScore, riskLevel },
        });
    },
    addTraining(data) {
        return prisma_1.prisma.workerTraining.create({ data });
    },
    upsertCompetency(data) {
        return prisma_1.prisma.workerCompetency.upsert({
            where: {
                workerId_competencyCode: {
                    workerId: data.workerId,
                    competencyCode: data.competencyCode,
                },
            },
            create: {
                companyId: data.companyId,
                workerId: data.workerId,
                competencyCode: data.competencyCode,
                level: data.level ?? 'basic',
            },
            update: { level: data.level },
        });
    },
    addAuthorization(data) {
        return prisma_1.prisma.workerAuthorization.create({ data });
    },
    addRestriction(data) {
        return prisma_1.prisma.workerRestriction.create({ data });
    },
    addExposure(data) {
        return prisma_1.prisma.workerHazardExposure.create({ data });
    },
    addIncident(data) {
        return prisma_1.prisma.workerIncident.create({ data });
    },
    addCorrective(data) {
        return prisma_1.prisma.workerCorrectiveAssignment.create({ data });
    },
    addAccessLog(data) {
        return prisma_1.prisma.workerAccessLog.create({ data });
    },
    async getScoreContext(workerId, companyId) {
        const [profile, training, authorizations, restrictions, exposures, incidents, corrective, accessLogs,] = await Promise.all([
            this.findProfile(workerId, companyId),
            prisma_1.prisma.workerTraining.findMany({ where: { workerId, companyId } }),
            prisma_1.prisma.workerAuthorization.findMany({ where: { workerId, companyId } }),
            prisma_1.prisma.workerRestriction.findMany({ where: { workerId, companyId } }),
            prisma_1.prisma.workerHazardExposure.findMany({ where: { workerId, companyId } }),
            prisma_1.prisma.workerIncident.findMany({ where: { workerId, companyId } }),
            prisma_1.prisma.workerCorrectiveAssignment.findMany({ where: { workerId, companyId } }),
            prisma_1.prisma.workerAccessLog.findMany({ where: { workerId, companyId }, take: 100 }),
        ]);
        return {
            profile,
            training,
            authorizations,
            restrictions,
            exposures,
            incidents,
            corrective,
            accessLogs,
        };
    },
};
