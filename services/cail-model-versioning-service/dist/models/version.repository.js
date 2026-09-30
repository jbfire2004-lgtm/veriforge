"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
function json(value) {
    return value;
}
exports.versionRepository = {
    create(data) {
        return prisma_1.prisma.modelVersion.create({
            data: {
                companyId: data.companyId,
                modelId: data.modelId,
                version: data.version,
                createdBy: data.createdBy,
                trainingJobId: data.trainingJobId,
                artifactUri: data.artifactUri,
                metadata: json(data.metadata ?? {}),
            },
        });
    },
    findById(id, companyId) {
        return prisma_1.prisma.modelVersion.findFirst({ where: { id, companyId } });
    },
    findByModelVersion(companyId, modelId, version) {
        return prisma_1.prisma.modelVersion.findFirst({ where: { companyId, modelId, version } });
    },
    list(companyId, modelId, status) {
        return prisma_1.prisma.modelVersion.findMany({
            where: {
                companyId,
                ...(modelId ? { modelId } : {}),
                ...(status ? { status } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    updateStatus(id, companyId, status) {
        return prisma_1.prisma.modelVersion.updateMany({ where: { id, companyId }, data: { status } });
    },
    async retireProduction(companyId, modelId, excludeId) {
        await prisma_1.prisma.modelVersion.updateMany({
            where: {
                companyId,
                modelId,
                status: client_1.ModelVersionStatus.production,
                id: { not: excludeId },
            },
            data: { status: client_1.ModelVersionStatus.retired },
        });
    },
    recordPromotion(data) {
        return prisma_1.prisma.modelPromotionHistory.create({
            data: {
                companyId: data.companyId,
                modelVersionId: data.modelVersionId,
                action: data.action,
                fromStatus: data.fromStatus,
                toStatus: data.toStatus,
                performedBy: data.performedBy,
                reason: data.reason,
            },
        });
    },
};
