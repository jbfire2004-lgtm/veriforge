"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingDataRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return value;
}
exports.trainingDataRepository = {
    createMany(rows) {
        if (rows.length === 0)
            return Promise.resolve({ count: 0 });
        return prisma_1.prisma.cailTrainingData.createMany({ data: rows.map((r) => ({
                companyId: r.companyId,
                modelId: r.modelId,
                version: r.version,
                datasetReference: r.datasetReference,
                featureSet: json(r.featureSet),
                labelSet: r.labelSet !== undefined ? json(r.labelSet) : undefined,
                sourceEvent: r.sourceEvent,
                anomalyFlag: r.anomalyFlag,
                qualityScore: r.qualityScore,
            })) });
    },
    countByCompany(companyId) {
        return prisma_1.prisma.cailTrainingData.count({ where: { companyId } });
    },
    countAnomalies(companyId) {
        return prisma_1.prisma.cailTrainingData.count({ where: { companyId, anomalyFlag: true } });
    },
    groupByModel(companyId) {
        return prisma_1.prisma.cailTrainingData.groupBy({
            by: ['modelId', 'version'],
            where: { companyId },
            _count: { _all: true },
        });
    },
    groupByDataset(companyId) {
        return prisma_1.prisma.cailTrainingData.groupBy({
            by: ['datasetReference'],
            where: { companyId },
            _count: { _all: true },
        });
    },
    groupBySourceEvent(companyId) {
        return prisma_1.prisma.cailTrainingData.groupBy({
            by: ['sourceEvent'],
            where: { companyId, sourceEvent: { not: null } },
            _count: { _all: true },
        });
    },
    lastCreatedAt(companyId) {
        return prisma_1.prisma.cailTrainingData.findFirst({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        });
    },
};
