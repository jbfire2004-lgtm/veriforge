"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driftRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return value;
}
exports.driftRepository = {
    createReport(data) {
        return prisma_1.prisma.driftReport.create({
            data: {
                companyId: data.companyId,
                modelId: data.modelId,
                modelVersion: data.modelVersion,
                baselineStats: json(data.baselineStats),
                currentStats: json(data.currentStats),
                featureDrifts: json(data.featureDrifts),
                driftScore: data.driftScore,
                driftDetected: data.driftDetected,
                createdBy: data.createdBy,
            },
        });
    },
    findReportById(id, companyId) {
        return prisma_1.prisma.driftReport.findFirst({
            where: { id, companyId },
            include: { events: true },
        });
    },
    listReports(companyId, modelId) {
        return prisma_1.prisma.driftReport.findMany({
            where: { companyId, ...(modelId ? { modelId } : {}) },
            orderBy: { createdAt: 'desc' },
        });
    },
    createThreshold(data) {
        return prisma_1.prisma.alertThreshold.create({ data });
    },
    listThresholds(companyId, modelId) {
        return prisma_1.prisma.alertThreshold.findMany({
            where: { companyId, ...(modelId ? { modelId } : {}), enabled: true },
        });
    },
    updateThreshold(id, companyId, data) {
        return prisma_1.prisma.alertThreshold.updateMany({ where: { id, companyId }, data });
    },
    deleteThreshold(id, companyId) {
        return prisma_1.prisma.alertThreshold.deleteMany({ where: { id, companyId } });
    },
    emitEvent(data) {
        return prisma_1.prisma.driftEvent.create({
            data: {
                companyId: data.companyId,
                driftReportId: data.driftReportId,
                eventType: data.eventType,
                payload: json(data.payload),
            },
        });
    },
};
