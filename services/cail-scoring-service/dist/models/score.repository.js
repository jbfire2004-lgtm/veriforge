"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return value;
}
exports.scoreRepository = {
    create(data) {
        return prisma_1.prisma.cailScore.create({ data: {
                companyId: data.companyId,
                projectId: data.projectId,
                workerId: data.workerId,
                equipmentId: data.equipmentId,
                entityType: data.entityType,
                entityId: data.entityId,
                scoreType: data.scoreType,
                scoreValue: data.scoreValue,
                contributingFactors: json(data.contributingFactors),
            } });
    },
    findLatestByEntity(companyId, entityType, entityId, scoreType) {
        return prisma_1.prisma.cailScore.findMany({
            where: {
                companyId,
                entityType,
                entityId,
                ...(scoreType ? { scoreType } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: scoreType ? 1 : 20,
        });
    },
    async findLatestPerType(companyId, entityType, entityId) {
        const rows = await prisma_1.prisma.cailScore.findMany({
            where: { companyId, entityType, entityId },
            orderBy: { createdAt: 'desc' },
        });
        const latest = new Map();
        for (const row of rows) {
            if (!latest.has(row.scoreType)) {
                latest.set(row.scoreType, row);
            }
        }
        return [...latest.values()];
    },
};
