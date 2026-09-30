"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
exports.equipmentRepository = {
    createEquipment(data) {
        return prisma_1.prisma.equipment.create({ data });
    },
    findEquipment(id, companyId) {
        return prisma_1.prisma.equipment.findFirst({ where: { id, companyId } });
    },
    updateEquipment(id, companyId, data) {
        return prisma_1.prisma.equipment.updateMany({ where: { id, companyId }, data });
    },
    createInspection(data) {
        return prisma_1.prisma.equipmentInspection.create({ data });
    },
    listInspections(equipmentId, limit = 10) {
        return prisma_1.prisma.equipmentInspection.findMany({
            where: { equipmentId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    },
    createCertification(data) {
        return prisma_1.prisma.equipmentCertification.create({ data });
    },
    listCertifications(equipmentId) {
        return prisma_1.prisma.equipmentCertification.findMany({
            where: { equipmentId },
            orderBy: { issueDate: 'desc' },
        });
    },
    upsertAuthorization(data) {
        return prisma_1.prisma.equipmentAuthorization.upsert({
            where: {
                equipmentId_workerId: {
                    equipmentId: data.equipmentId,
                    workerId: data.workerId,
                },
            },
            create: {
                equipmentId: data.equipmentId,
                workerId: data.workerId,
                authorizedBy: data.authorizedBy,
                expiryDate: data.expiryDate,
                status: client_1.AuthorizationStatus.active,
            },
            update: {
                authorizedBy: data.authorizedBy,
                expiryDate: data.expiryDate,
                status: client_1.AuthorizationStatus.active,
            },
        });
    },
    listAuthorizations(equipmentId) {
        return prisma_1.prisma.equipmentAuthorization.findMany({ where: { equipmentId } });
    },
    findActiveLockout(equipmentId) {
        return prisma_1.prisma.equipmentLockout.findFirst({
            where: { equipmentId, active: true },
            orderBy: { lockedAt: 'desc' },
        });
    },
    createLockout(data) {
        return prisma_1.prisma.equipmentLockout.create({ data });
    },
    deactivateLockout(id, unlockedBy) {
        return prisma_1.prisma.equipmentLockout.update({
            where: { id },
            data: { active: false, unlockedBy, unlockedAt: new Date() },
        });
    },
    getScoreContext(id, companyId) {
        return prisma_1.prisma.equipment.findFirst({
            where: { id, companyId },
            include: {
                inspections: { orderBy: { createdAt: 'desc' }, take: 5 },
                certifications: true,
                authorizations: true,
                lockouts: { where: { active: true }, take: 1 },
            },
        });
    },
    async withTransaction(fn) {
        return prisma_1.prisma.$transaction(fn);
    },
};
