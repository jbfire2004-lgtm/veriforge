import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? []) as Prisma.InputJsonValue;
}

export const sdsRepository = {
  createDocument(data: {
    companyId: string;
    productName: string;
    manufacturer?: string;
    casNumber?: string;
    whmisClassification?: string;
    ppeRequirements?: unknown;
    firstAid?: unknown;
    handlingStorage?: unknown;
    extractedHazards?: unknown;
    extractedControls?: unknown;
    expiryDate?: Date;
    version?: number;
    filePath?: string;
  }) {
    return prisma.sdsDocument.create({
      data: {
        companyId: data.companyId,
        productName: data.productName,
        manufacturer: data.manufacturer,
        casNumber: data.casNumber,
        whmisClassification: data.whmisClassification,
        ppeRequirements: json(data.ppeRequirements ?? []),
        firstAid: json(data.firstAid ?? {}),
        handlingStorage: json(data.handlingStorage ?? {}),
        extractedHazards: json(data.extractedHazards ?? []),
        extractedControls: json(data.extractedControls ?? []),
        expiryDate: data.expiryDate,
        version: data.version ?? 1,
        filePath: data.filePath,
      },
    });
  },

  findDocument(id: string, companyId: string) {
    return prisma.sdsDocument.findFirst({ where: { id, companyId } });
  },

  upsertAcknowledgment(sdsId: string, workerId: string) {
    return prisma.sdsAcknowledgment.upsert({
      where: { sdsId_workerId: { sdsId, workerId } },
      create: { sdsId, workerId },
      update: { acknowledgedAt: new Date() },
    });
  },

  listWorkerAcknowledgments(workerId: string, companyId: string) {
    return prisma.sdsAcknowledgment.findMany({
      where: { workerId, sds: { companyId } },
      include: { sds: true },
    });
  },

  findZoneRule(companyId: string, zoneId: string) {
    return prisma.zoneSdsRule.findUnique({
      where: { companyId_zoneId: { companyId, zoneId } },
    });
  },

  upsertZoneRule(companyId: string, zoneId: string, requiredSdsIds: string[]) {
    return prisma.zoneSdsRule.upsert({
      where: { companyId_zoneId: { companyId, zoneId } },
      create: { companyId, zoneId, requiredSdsIds: json(requiredSdsIds) },
      update: { requiredSdsIds: json(requiredSdsIds) },
    });
  },

  listDocumentsByIds(ids: string[], companyId: string) {
    if (ids.length === 0) return Promise.resolve([]);
    return prisma.sdsDocument.findMany({
      where: { id: { in: ids }, companyId },
    });
  },

  listCompanyDocuments(companyId: string) {
    return prisma.sdsDocument.findMany({
      where: { companyId },
      orderBy: { productName: 'asc' },
    });
  },
};
