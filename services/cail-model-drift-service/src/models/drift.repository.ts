import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const driftRepository = {
  createReport(data: {
    companyId: string;
    modelId: string;
    modelVersion?: string;
    baselineStats: unknown;
    currentStats: unknown;
    featureDrifts: unknown;
    driftScore: number;
    driftDetected: boolean;
    createdBy: string;
  }) {
    return prisma.driftReport.create({
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

  findReportById(id: string, companyId: string) {
    return prisma.driftReport.findFirst({
      where: { id, companyId },
      include: { events: true },
    });
  },

  listReports(companyId: string, modelId?: string) {
    return prisma.driftReport.findMany({
      where: { companyId, ...(modelId ? { modelId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  },

  createThreshold(data: {
    companyId: string;
    modelId: string;
    featureName: string;
    method: string;
    threshold: number;
  }) {
    return prisma.alertThreshold.create({ data });
  },

  listThresholds(companyId: string, modelId?: string) {
    return prisma.alertThreshold.findMany({
      where: { companyId, ...(modelId ? { modelId } : {}), enabled: true },
    });
  },

  updateThreshold(
    id: string,
    companyId: string,
    data: Partial<{ threshold: number; method: string; enabled: boolean }>,
  ) {
    return prisma.alertThreshold.updateMany({ where: { id, companyId }, data });
  },

  deleteThreshold(id: string, companyId: string) {
    return prisma.alertThreshold.deleteMany({ where: { id, companyId } });
  },

  emitEvent(data: {
    companyId: string;
    driftReportId: string;
    eventType: string;
    payload: unknown;
  }) {
    return prisma.driftEvent.create({
      data: {
        companyId: data.companyId,
        driftReportId: data.driftReportId,
        eventType: data.eventType,
        payload: json(data.payload),
      },
    });
  },
};
