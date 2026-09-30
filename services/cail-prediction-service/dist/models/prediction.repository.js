"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictionRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return value;
}
exports.predictionRepository = {
    create(data) {
        return prisma_1.prisma.cailPrediction.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                workerId: data.workerId,
                equipmentId: data.equipmentId,
                entityType: data.entityType,
                entityId: data.entityId,
                moduleType: data.moduleType,
                predictionType: data.predictionType,
                predictionValue: data.predictionValue,
                confidence: data.confidence,
                riskLevel: data.riskLevel,
                factors: json(data.factors),
                modelKey: data.modelKey,
            },
        });
    },
    findLatestByEntity(companyId, entityType, entityId, predictionType) {
        return prisma_1.prisma.cailPrediction.findMany({
            where: {
                companyId,
                entityType,
                entityId,
                ...(predictionType ? { predictionType } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: predictionType ? 1 : 20,
        });
    },
    async findLatestPerType(companyId, entityType, entityId) {
        const rows = await prisma_1.prisma.cailPrediction.findMany({
            where: { companyId, entityType, entityId },
            orderBy: { createdAt: 'desc' },
        });
        const latest = new Map();
        for (const row of rows) {
            if (!latest.has(row.predictionType)) {
                latest.set(row.predictionType, row);
            }
        }
        return [...latest.values()];
    },
};
