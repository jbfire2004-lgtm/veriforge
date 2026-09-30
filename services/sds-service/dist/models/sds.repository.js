"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdsRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? []);
}
exports.sdsRepository = {
    createDocument(data) {
        return prisma_1.prisma.sdsDocument.create({
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
    findDocument(id, companyId) {
        return prisma_1.prisma.sdsDocument.findFirst({ where: { id, companyId } });
    },
    upsertAcknowledgment(sdsId, workerId) {
        return prisma_1.prisma.sdsAcknowledgment.upsert({
            where: { sdsId_workerId: { sdsId, workerId } },
            create: { sdsId, workerId },
            update: { acknowledgedAt: new Date() },
        });
    },
    listWorkerAcknowledgments(workerId, companyId) {
        return prisma_1.prisma.sdsAcknowledgment.findMany({
            where: { workerId, sds: { companyId } },
            include: { sds: true },
        });
    },
    findZoneRule(companyId, zoneId) {
        return prisma_1.prisma.zoneSdsRule.findUnique({
            where: { companyId_zoneId: { companyId, zoneId } },
        });
    },
    upsertZoneRule(companyId, zoneId, requiredSdsIds) {
        return prisma_1.prisma.zoneSdsRule.upsert({
            where: { companyId_zoneId: { companyId, zoneId } },
            create: { companyId, zoneId, requiredSdsIds: json(requiredSdsIds) },
            update: { requiredSdsIds: json(requiredSdsIds) },
        });
    },
    listDocumentsByIds(ids, companyId) {
        if (ids.length === 0)
            return Promise.resolve([]);
        return prisma_1.prisma.sdsDocument.findMany({
            where: { id: { in: ids }, companyId },
        });
    },
    listCompanyDocuments(companyId) {
        return prisma_1.prisma.sdsDocument.findMany({
            where: { companyId },
            orderBy: { productName: 'asc' },
        });
    },
};
