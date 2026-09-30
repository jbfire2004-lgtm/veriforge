"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingRepository = void 0;
const prisma_1 = require("../db/prisma");
const jobInclude = {
    datasetReferences: true,
    artifacts: true,
};
function json(value) {
    return value;
}
exports.trainingRepository = {
    create(data) {
        return prisma_1.prisma.trainingJob.create({
            data: {
                companyId: data.companyId,
                name: data.name,
                modelType: data.modelType,
                config: json(data.config ?? {}),
                createdBy: data.createdBy,
                status: data.status,
            },
            include: jobInclude,
        });
    },
    findById(id, companyId) {
        return prisma_1.prisma.trainingJob.findFirst({
            where: { id, companyId },
            include: jobInclude,
        });
    },
    list(companyId, status) {
        return prisma_1.prisma.trainingJob.findMany({
            where: { companyId, ...(status ? { status } : {}) },
            include: jobInclude,
            orderBy: { createdAt: 'desc' },
        });
    },
    updateStatus(id, companyId, data) {
        return prisma_1.prisma.trainingJob.updateMany({
            where: { id, companyId },
            data,
        });
    },
    update(id, companyId, data) {
        const { config, ...rest } = data;
        return prisma_1.prisma.trainingJob.updateMany({
            where: { id, companyId },
            data: {
                ...rest,
                ...(config !== undefined ? { config: json(config) } : {}),
            },
        });
    },
    delete(id, companyId) {
        return prisma_1.prisma.trainingJob.deleteMany({ where: { id, companyId } });
    },
    addDatasetReference(data) {
        return prisma_1.prisma.datasetReference.create({
            data: {
                companyId: data.companyId,
                trainingJobId: data.trainingJobId,
                datasetId: data.datasetId,
                datasetVersion: data.datasetVersion,
                sourceType: data.sourceType,
                metadata: json(data.metadata ?? {}),
            },
        });
    },
    addArtifact(data) {
        return prisma_1.prisma.modelArtifact.create({
            data: {
                companyId: data.companyId,
                trainingJobId: data.trainingJobId,
                artifactUri: data.artifactUri,
                artifactType: data.artifactType,
                checksum: data.checksum,
                sizeBytes: data.sizeBytes,
                metadata: json(data.metadata ?? {}),
            },
        });
    },
    logIngestionEvent(data) {
        return prisma_1.prisma.ingestionEventLog.create({
            data: {
                companyId: data.companyId,
                eventType: data.eventType,
                payload: json(data.payload),
                trainingJobId: data.trainingJobId,
            },
        });
    },
};
