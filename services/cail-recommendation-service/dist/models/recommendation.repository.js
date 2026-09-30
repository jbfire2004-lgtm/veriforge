"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return value;
}
exports.recommendationRepository = {
    createMany(rows) {
        if (rows.length === 0)
            return Promise.resolve({ count: 0 });
        return prisma_1.prisma.cailRecommendation.createMany({
            data: rows.map((r) => ({
                companyId: r.companyId,
                projectId: r.projectId,
                workerId: r.workerId,
                equipmentId: r.equipmentId,
                entityType: r.entityType,
                entityId: r.entityId,
                recommendationType: r.recommendationType,
                recommendationText: r.recommendationText,
                evidence: json(r.evidence),
                confidence: r.confidence,
            })),
        });
    },
    findByEntity(companyId, entityType, entityId, recommendationType, limit = 50) {
        return prisma_1.prisma.cailRecommendation.findMany({
            where: {
                companyId,
                entityType,
                entityId,
                ...(recommendationType ? { recommendationType } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    },
    async findLatestPerType(companyId, entityType, entityId) {
        const rows = await prisma_1.prisma.cailRecommendation.findMany({
            where: { companyId, entityType, entityId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        const latest = new Map();
        for (const row of rows) {
            if (!latest.has(row.recommendationType)) {
                latest.set(row.recommendationType, row);
            }
        }
        return [...latest.values()];
    },
};
